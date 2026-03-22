import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db, handleFirestoreError } from '../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, setDoc } from 'firebase/firestore';
import { Order, OperationType, OrderStatus, Zone } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import RiderTracker from '../components/RiderTracker';
import { 
  Clock, 
  CheckCircle2, 
  Truck, 
  Package, 
  MapPin, 
  Phone, 
  User, 
  Building2, 
  AlertCircle, 
  ChevronRight, 
  XCircle,
  CreditCard,
  Map,
  ShieldCheck,
  ScanFace
} from 'lucide-react';
import BiometricAuth from '../components/BiometricAuth';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'cancel' | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [biometricTarget, setBiometricTarget] = useState<{ orderId: string, status: OrderStatus } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const orderId = params.get('orderId');
    
    if (payment === 'success' && orderId) {
      setPaymentStatus('success');
      // Update order status in Firestore (demo only, should be webhook)
      const orderRef = doc(db, 'orders', orderId);
      updateDoc(orderRef, { 
        paymentStatus: 'paid',
        updatedAt: new Date().toISOString()
      }).catch(err => console.error('Failed to update payment status:', err));
    }
    if (payment === 'cancel') setPaymentStatus('cancel');
  }, []);

  useEffect(() => {
    if (!user || !profile) return;

    // Handle payment success redirect
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const orderId = urlParams.get('orderId');

    if (paymentStatus === 'success' && orderId) {
      const updatePayment = async () => {
        try {
          const orderRef = doc(db, 'orders', orderId);
          await updateDoc(orderRef, { paymentStatus: 'paid' });
          // Clear URL params without reloading
          window.history.replaceState({}, '', window.location.pathname);
        } catch (err) {
          console.error('Error updating payment status:', err);
        }
      };
      updatePayment();
    }

    let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

    if (profile.role === 'patient') {
      q = query(collection(db, 'orders'), where('patientId', '==', user.uid), orderBy('createdAt', 'desc'));
    } else if (profile.role === 'rider') {
      // Riders see pending orders in their zone OR orders assigned to them
      q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      
      // Fetch zones for filtering
      const zonesQ = query(collection(db, 'zones'), orderBy('name', 'asc'));
      const unsubscribeZones = onSnapshot(zonesQ, (snapshot) => {
        setZones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Zone)));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'zones'));
      
      const originalUnsubscribe = onSnapshot(q, (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(ordersData);
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'orders');
      });

      return () => {
        unsubscribeZones();
        originalUnsubscribe();
      };
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    return () => unsubscribe();
  }, [user, profile]);

  useEffect(() => {
    if (profile?.role !== 'rider' || !user) return;

    const activeOrder = orders.find(o => o.status === 'in-transit' && o.riderId === user.uid);
    if (!activeOrder) return;

    let watchId: number;

    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            await setDoc(doc(db, 'riderLocations', user.uid), {
              riderId: user.uid,
              latitude,
              longitude,
              updatedAt: new Date().toISOString()
            });
          } catch (err) {
            console.error('Error updating rider location:', err);
          }
        },
        (err) => console.error('Geolocation error:', err),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [profile, user, orders]);

  const handlePayment = async (order: Order) => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          amount: 5000, // R50.00 delivery fee
          medicationName: order.medicationName
        })
      });

      const session = await response.json();
      if (session.url) {
        window.location.href = session.url;
      } else {
        alert('Failed to initiate payment. Please check if Stripe is configured.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('An error occurred during payment initiation.');
    }
  };

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const updateData: Partial<Order> = { 
        status, 
        updatedAt: new Date().toISOString() 
      };
      
      if (status === 'assigned' && profile?.role === 'rider') {
        updateData.riderId = user?.uid;
        updateData.riderName = user?.displayName || 'Verified Rider';
      }

      await updateDoc(orderRef, updateData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const toggleAvailability = async () => {
    if (!user || !profile) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        isAvailable: !profile.isAvailable,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'all' || o.status === filter;
    const matchesZone = !selectedZone || o.deliveryZone === selectedZone;
    
    if (profile?.role === 'rider') {
      // For riders, if they have an active order, show it regardless of zone filter?
      // Actually, let's just apply both filters.
      return matchesFilter && matchesZone;
    }
    
    return matchesFilter;
  });

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return <Clock className="text-amber-500" size={20} />;
      case 'assigned': return <User className="text-blue-500" size={20} />;
      case 'picked-up': return <Package className="text-teal-500" size={20} />;
      case 'in-transit': return <Truck className="text-sky-500" size={20} />;
      case 'delivered': return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'cancelled': return <XCircle className="text-rose-500" size={20} />;
      default: return <Package size={20} />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'assigned': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'picked-up': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'in-transit': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full"
        />
        <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Welcome back, {profile?.displayName?.split(' ')[0]}</h1>
          <p className="text-slate-500">
            {profile?.role === 'patient' ? 'Track your prescription collections and deliveries.' : 
             profile?.role === 'rider' ? 'Manage your active deliveries in Paarl.' : 
             'Overview of all platform activity.'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 p-1 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === 'orders' ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'hover:bg-slate-50 text-slate-400'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === 'profile' ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'hover:bg-slate-50 text-slate-400'
            }`}
          >
            Profile
          </button>
          
          <div className="h-6 w-px bg-slate-100 mx-2" />

          {(['all', 'pending', 'assigned', 'picked-up', 'delivered'] as const).map((f) => (
            <button
              key={f}
              disabled={activeTab !== 'orders'}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                filter === f && activeTab === 'orders' ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'hover:bg-slate-50 text-slate-400 disabled:opacity-30'
              }`}
            >
              {f}
            </button>
          ))}
          
          {profile?.role === 'rider' && zones.length > 0 && (
            <div className="flex items-center gap-2 pl-4 border-l border-slate-100">
              <Map size={14} className="text-slate-300" />
              <select 
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-slate-500 focus:ring-0 cursor-pointer"
              >
                <option value="">All Zones</option>
                {zones.map(z => (
                  <option key={z.id} value={z.name}>{z.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Payment Notifications */}
      <AnimatePresence>
        {paymentStatus === 'success' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-emerald-50 border border-emerald-200 p-6 rounded-[2rem] flex items-center gap-4 text-emerald-800"
          >
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div className="flex-1">
              <p className="font-bold">Payment Successful!</p>
              <p className="text-sm opacity-80">Your delivery fee has been processed. A rider will be assigned shortly.</p>
            </div>
            <button onClick={() => setPaymentStatus(null)} className="p-2 hover:bg-emerald-100 rounded-xl">
              <XCircle size={20} />
            </button>
          </motion.div>
        )}
        {paymentStatus === 'cancel' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50 border border-amber-200 p-6 rounded-[2rem] flex items-center gap-4 text-amber-800"
          >
            <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shrink-0">
              <AlertCircle size={24} />
            </div>
            <div className="flex-1">
              <p className="font-bold">Payment Cancelled</p>
              <p className="text-sm opacity-80">The payment process was cancelled. You can try again from your dashboard.</p>
            </div>
            <button onClick={() => setPaymentStatus(null)} className="p-2 hover:bg-amber-100 rounded-xl">
              <XCircle size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="wait">
          {activeTab === 'orders' ? (
            <motion.div
              key="orders-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl border border-[#1a1a1a]/5 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center hover:border-[#5A5A40]/20 transition-all group"
                  >
                    {/* Status Column */}
                    <div className="flex flex-col items-center gap-3 min-w-[120px]">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${getStatusColor(order.status)} border shadow-sm`}>
                        {getStatusIcon(order.status)}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      {order.paymentStatus === 'paid' && (
                        <span className="text-[9px] font-bold uppercase tracking-tighter text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          Paid
                        </span>
                      )}
                    </div>

                    {/* Details Column */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Package size={18} className="text-slate-400 mt-1" />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Medication</p>
                            <p className="font-bold text-lg text-slate-900">{order.medicationName}</p>
                            <p className="text-sm text-slate-500">Quantity: {order.quantity}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Building2 size={18} className="text-slate-400 mt-1" />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Pharmacy</p>
                            <p className="font-bold text-slate-700">{order.pharmacyName}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <MapPin size={18} className="text-slate-400 mt-1" />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Delivery Address ({order.deliveryZone})</p>
                            <p className="text-sm text-slate-500 leading-relaxed">{order.deliveryAddress}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <User size={18} className="text-slate-400 mt-1" />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Patient</p>
                            <p className="font-bold text-slate-700">{order.patientName}</p>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                              <Phone size={12} /> {order.patientPhone}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div className="flex flex-col gap-3 w-full md:w-auto">
                      {profile?.role === 'patient' && order.status === 'pending' && order.paymentStatus !== 'paid' && (
                        <button 
                          onClick={() => handlePayment(order)}
                          className="w-full md:w-auto px-6 py-3 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20"
                        >
                          Pay Delivery Fee (R50) <CreditCard size={18} />
                        </button>
                      )}
                      {profile?.role === 'rider' && order.status === 'pending' && (
                        <button 
                          onClick={() => updateStatus(order.id!, 'assigned')}
                          className="w-full md:w-auto px-6 py-3 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20"
                        >
                          Accept Order <ChevronRight size={18} />
                        </button>
                      )}
                      {profile?.role === 'rider' && order.status === 'assigned' && order.riderId === user?.uid && (
                        <button 
                          onClick={() => setBiometricTarget({ orderId: order.id!, status: 'picked-up' })}
                          className="w-full md:w-auto px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                        >
                          Mark as Picked Up <ScanFace size={18} />
                        </button>
                      )}
                      {profile?.role === 'rider' && order.status === 'picked-up' && order.riderId === user?.uid && (
                        <button 
                          onClick={() => setBiometricTarget({ orderId: order.id!, status: 'in-transit' })}
                          className="w-full md:w-auto px-6 py-3 bg-sky-600 text-white rounded-2xl font-bold hover:bg-sky-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20"
                        >
                          Start Delivery <ScanFace size={18} />
                        </button>
                      )}
                      {profile?.role === 'rider' && order.status === 'in-transit' && order.riderId === user?.uid && (
                        <button 
                          onClick={() => setBiometricTarget({ orderId: order.id!, status: 'delivered' })}
                          className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                        >
                          Confirm Delivery <ScanFace size={18} />
                        </button>
                      )}
                      {(profile?.role === 'patient' || profile?.role === 'pharmacy') && order.status === 'in-transit' && (
                        <button 
                          onClick={() => setTrackingOrder(order)}
                          className="w-full md:w-auto px-6 py-3 bg-sky-600 text-white rounded-2xl font-bold hover:bg-sky-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20"
                        >
                          Track Delivery <Map size={18} />
                        </button>
                      )}
                      {profile?.role === 'patient' && order.status === 'pending' && (
                        <button 
                          onClick={() => updateStatus(order.id!, 'cancelled')}
                          className="w-full md:w-auto px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                        >
                          Cancel Order <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-24 text-center space-y-4 bg-white rounded-[3rem] border border-dashed border-[#1a1a1a]/10">
                  <div className="w-16 h-16 bg-[#f5f5f0] rounded-full flex items-center justify-center mx-auto text-[#1a1a1a]/20">
                    <Package size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-bold">No orders found</p>
                    <p className="text-[#1a1a1a]/40">Your collection requests will appear here once submitted.</p>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="profile-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[3rem] border border-[#1a1a1a]/5 p-8 md:p-12 space-y-12"
            >
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-teal-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-teal-600/20">
                  <User size={40} />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tighter text-slate-900">{profile?.displayName}</h2>
                  <p className="text-teal-600 font-bold uppercase tracking-widest text-sm">{profile?.role}</p>
                  <p className="text-slate-400 text-sm">{profile?.email}</p>
                </div>
              </div>

              {profile?.role === 'rider' && (
                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${profile.isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    <div>
                      <p className="font-black uppercase tracking-widest text-sm text-slate-900">
                        {profile.isAvailable ? 'Available for Orders' : 'Currently Offline'}
                      </p>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                        {profile.isAvailable ? 'You are visible to pharmacies and patients' : 'Toggle to start receiving delivery requests'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={toggleAvailability}
                    className={`relative w-16 h-8 rounded-full transition-all duration-300 ${profile.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${profile.isAvailable ? 'left-9' : 'left-1'}`} />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-sm font-bold uppercase tracking-widest text-slate-400">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="tel"
                      readOnly
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-600 cursor-not-allowed"
                      value={profile?.phone || 'Not provided'}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold uppercase tracking-widest text-slate-400">Primary Zone</label>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text"
                      readOnly
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-600 cursor-not-allowed"
                      value={profile?.zone || 'Not provided'}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <label className="block text-sm font-bold uppercase tracking-widest text-slate-400">Default Address</label>
                  <div className="relative">
                    <Building2 className="absolute left-6 top-6 text-slate-400" size={18} />
                    <textarea 
                      readOnly
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-slate-600 cursor-not-allowed min-h-[100px]"
                      value={profile?.address || 'Not provided'}
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-teal-50/50 rounded-[2.5rem] border border-teal-100/50 flex flex-col md:flex-row items-center gap-6">
                <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div className="text-center md:text-left">
                  <p className="font-bold text-slate-900">Profile Verified</p>
                  <p className="text-sm text-slate-500">Your profile is fully boarded and compliant with POPIA regulations.</p>
                </div>
                <button 
                  onClick={() => alert('Profile editing will be available in the next update.')}
                  className="md:ml-auto px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
                >
                  Edit Profile
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {trackingOrder && (
          <RiderTracker 
            riderId={trackingOrder.riderId!} 
            orderId={trackingOrder.id!} 
            onClose={() => setTrackingOrder(null)} 
          />
        )}

        <AnimatePresence>
          {biometricTarget && (
            <BiometricAuth 
              onVerified={() => {
                updateStatus(biometricTarget.orderId, biometricTarget.status);
                setBiometricTarget(null);
              }}
              onCancel={() => setBiometricTarget(null)}
              title="Order Status Verification"
              description={`Scan your face to confirm you are marking this order as ${biometricTarget.status}.`}
            />
          )}
        </AnimatePresence>
      </AnimatePresence>

      {/* Info Card */}
      <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1579154235602-4c0973873076?auto=format&fit=crop&q=80&w=2000" 
            alt="Medical Background" 
            className="w-full h-full object-cover mix-blend-overlay group-hover:scale-105 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        </div>
        <div className="w-20 h-20 bg-teal-600 rounded-3xl flex items-center justify-center shrink-0 shadow-lg shadow-teal-600/20 relative z-10">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-2 text-center md:text-left relative z-10">
          <h3 className="text-2xl font-black tracking-tight">Need help with an order?</h3>
          <p className="text-slate-400 max-w-md">Our support agent Emma-i™ is available 24/7 to assist you with any logistics queries or pharmaceutical handling questions.</p>
        </div>
        <button className="md:ml-auto px-10 py-4 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-all relative z-10 shadow-xl shadow-teal-600/20">
          Contact Support
        </button>
      </div>
    </div>
  );
}
