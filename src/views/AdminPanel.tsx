import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError } from '../firebase';
import { useAuth } from '../App';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy, addDoc } from 'firebase/firestore';
import { Order, UserProfile, OperationType, OrderStatus, Zone, Pharmacy } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import RiderTracker from '../components/RiderTracker';
import { 
  Users, 
  Package, 
  Truck, 
  Map, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Clock,
  ChevronRight,
  ShieldCheck,
  Plus,
  Building2,
  Phone,
  Mail,
  CreditCard
} from 'lucide-react';

export default function AdminPanel() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'users' | 'zones' | 'pharmacies'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newZone, setNewZone] = useState({ name: '', description: '', riderCapacity: 5 });
  const [newPharmacy, setNewPharmacy] = useState({ name: '', address: '', phone: '', email: '', status: 'active' as const });
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user || profile?.role !== 'admin') return;

    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const zonesQuery = query(collection(db, 'zones'), orderBy('name', 'asc'));
    const pharmaciesQuery = query(collection(db, 'pharmacies'), orderBy('name', 'asc'));

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders'));

    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as unknown as UserProfile)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));

    const unsubscribeZones = onSnapshot(zonesQuery, (snapshot) => {
      setZones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Zone)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'zones'));

    const unsubscribePharmacies = onSnapshot(pharmaciesQuery, (snapshot) => {
      setPharmacies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pharmacy)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'pharmacies'));

    return () => {
      unsubscribeOrders();
      unsubscribeUsers();
      unsubscribeZones();
      unsubscribePharmacies();
    };
  }, []);

  const deleteOrder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `orders/${id}`);
    }
  };

  const updateUserRole = async (uid: string, role: UserProfile['role']) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const updateUserZone = async (uid: string, zone: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { zone });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const addZone = async () => {
    try {
      await addDoc(collection(db, 'zones'), newZone);
      setShowAddModal(false);
      setNewZone({ name: '', description: '', riderCapacity: 5 });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'zones');
    }
  };

  const deleteZone = async (id: string) => {
    if (!confirm('Delete this zone?')) return;
    try {
      await deleteDoc(doc(db, 'zones', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `zones/${id}`);
    }
  };

  const addPharmacy = async () => {
    try {
      await addDoc(collection(db, 'pharmacies'), newPharmacy);
      setShowAddModal(false);
      setNewPharmacy({ name: '', address: '', phone: '', email: '', status: 'active' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'pharmacies');
    }
  };

  const deletePharmacy = async (id: string) => {
    if (!confirm('Delete this pharmacy?')) return;
    try {
      await deleteDoc(doc(db, 'pharmacies', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `pharmacies/${id}`);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.pharmacyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.medicationName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPharmacies = pharmacies.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <ShieldCheck size={48} className="text-red-500" />
        <h2 className="text-2xl font-black text-slate-900">Access Denied</h2>
        <p className="text-slate-500">You do not have permission to access the Admin Panel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {[
          { label: 'Total Orders', value: orders.length, icon: <Package className="text-teal-600" /> },
          { label: 'Active Riders', value: users.filter(u => u.role === 'rider').length, icon: <Truck className="text-emerald-600" /> },
          { label: 'Pending Deliveries', value: orders.filter(o => o.status === 'pending').length, icon: <Clock className="text-amber-600" /> },
          { label: 'Total Users', value: users.length, icon: <Users className="text-blue-600" /> },
          { label: 'Total Revenue', value: `R${orders.filter(o => o.paymentStatus === 'paid').length * 50}`, icon: <CreditCard className="text-emerald-500" /> },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-slate-50 rounded-2xl">{stat.icon}</div>
              <span className="text-2xl font-black text-slate-900">{stat.value}</span>
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
        {/* Tabs & Search */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-2xl overflow-x-auto">
            {(['orders', 'users', 'zones', 'pharmacies'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab ? 'bg-white text-teal-600 shadow-md' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text"
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-12 pr-6 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-teal-600 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {(activeTab === 'zones' || activeTab === 'pharmacies') && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="p-3 bg-teal-600 text-white rounded-2xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
              >
                <Plus size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Table/List View */}
        <div className="overflow-x-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'orders' && (
              <motion.table 
                key="orders"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full text-left border-collapse"
              >
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Order / Patient</th>
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Medication</th>
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Pharmacy / Zone</th>
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-6">
                        <p className="font-bold text-slate-900">{order.patientName}</p>
                        <p className="text-xs text-slate-400">{order.id?.slice(-6).toUpperCase()}</p>
                      </td>
                      <td className="p-6">
                        <p className="font-medium text-slate-700">{order.medicationName}</p>
                        <p className="text-xs text-slate-400">Qty: {order.quantity}</p>
                      </td>
                      <td className="p-6">
                        <p className="font-medium text-slate-700">{order.pharmacyName}</p>
                        <p className="text-xs text-slate-400">{order.deliveryZone}</p>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                          order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          order.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          order.status === 'picked-up' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                          order.status === 'in-transit' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                          'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {order.status === 'in-transit' && (
                            <button 
                              onClick={() => setTrackingOrder(order)}
                              className="p-2 text-sky-600 hover:bg-sky-50 rounded-xl transition-colors"
                              title="Track Delivery"
                            >
                              <Map size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => deleteOrder(order.id!)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </motion.table>
            )}

            {activeTab === 'users' && (
              <motion.table 
                key="users"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full text-left border-collapse"
              >
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">User</th>
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Role</th>
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Zone / Phone</th>
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Joined</th>
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center font-bold text-teal-600">
                            {u.displayName?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.displayName}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <select 
                          value={u.role}
                          onChange={(e) => updateUserRole(u.uid, e.target.value as UserProfile['role'])}
                          className="bg-slate-50 border-none rounded-xl text-xs font-bold uppercase tracking-widest px-4 py-2 focus:ring-2 focus:ring-teal-600"
                        >
                          <option value="patient">Patient</option>
                          <option value="rider">Rider</option>
                          <option value="pharmacy">Pharmacy</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-6">
                        {u.role === 'rider' ? (
                          <select 
                            value={u.zone || ''}
                            onChange={(e) => updateUserZone(u.uid, e.target.value)}
                            className="bg-slate-50 border-none rounded-xl text-xs font-bold uppercase tracking-widest px-4 py-2 focus:ring-2 focus:ring-teal-600"
                          >
                            <option value="">No Zone</option>
                            {zones.map(z => (
                              <option key={z.id} value={z.name}>{z.name}</option>
                            ))}
                          </select>
                        ) : (
                          <p className="font-medium text-slate-700">{u.zone || 'N/A'}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">{u.phone || 'No phone'}</p>
                      </td>
                      <td className="p-6 text-xs text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-6 text-right">
                        <button className="p-2 text-slate-300 hover:bg-slate-50 rounded-xl transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </motion.table>
            )}

            {activeTab === 'zones' && (
              <motion.div 
                key="zones"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {zones.map(z => (
                    <div key={z.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4 relative group">
                      <button 
                        onClick={() => deleteZone(z.id!)}
                        className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-teal-600 shadow-sm">
                        <Map size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-lg text-slate-900">{z.name}</h4>
                        <p className="text-sm text-slate-500">{z.description || 'No description'}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Capacity</span>
                        <span className="font-black text-teal-600">{z.riderCapacity} Riders</span>
                      </div>
                    </div>
                  ))}
                  {zones.length === 0 && (
                    <div className="col-span-full py-24 text-center space-y-4">
                      <Map className="mx-auto text-slate-200" size={48} />
                      <p className="text-slate-400 font-bold uppercase tracking-widest">No zones configured</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'pharmacies' && (
              <motion.div 
                key="pharmacies"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredPharmacies.map(p => (
                    <div key={p.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6 relative group">
                      <button 
                        onClick={() => deletePharmacy(p.id!)}
                        className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-teal-600 shadow-sm">
                          <Building2 size={28} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-xl text-slate-900">{p.name}</h4>
                          <p className="text-sm text-slate-500">{p.address}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone size={14} className="text-slate-400" />
                          {p.phone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail size={14} className="text-slate-400" />
                          {p.email}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                          p.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}>
                          {p.status}
                        </span>
                        <button className="text-teal-600 text-xs font-bold uppercase tracking-widest hover:underline">
                          Edit Details
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredPharmacies.length === 0 && (
                    <div className="col-span-full py-24 text-center space-y-4">
                      <Building2 className="mx-auto text-slate-200" size={48} />
                      <p className="text-slate-400 font-bold uppercase tracking-widest">No pharmacies found</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Rider Tracking Modal */}
      <AnimatePresence>
        {trackingOrder && (
          <RiderTracker 
            riderId={trackingOrder.riderId!} 
            orderId={trackingOrder.id!} 
            onClose={() => setTrackingOrder(null)} 
          />
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100">
                <h3 className="text-2xl font-black text-slate-900">
                  {activeTab === 'zones' ? 'Add New Zone' : 'Add New Pharmacy'}
                </h3>
              </div>
              <div className="p-8 space-y-6">
                {activeTab === 'zones' ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Zone Name</label>
                      <input 
                        type="text"
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-600"
                        placeholder="e.g. Paarl Central"
                        value={newZone.name}
                        onChange={e => setNewZone({ ...newZone, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Description</label>
                      <textarea 
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-600 min-h-[100px]"
                        placeholder="Area coverage details..."
                        value={newZone.description}
                        onChange={e => setNewZone({ ...newZone, description: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Rider Capacity</label>
                      <input 
                        type="number"
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-600"
                        value={newZone.riderCapacity}
                        onChange={e => setNewZone({ ...newZone, riderCapacity: parseInt(e.target.value) })}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Pharmacy Name</label>
                      <input 
                        type="text"
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-600"
                        placeholder="e.g. Clicks Paarl"
                        value={newPharmacy.name}
                        onChange={e => setNewPharmacy({ ...newPharmacy, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Address</label>
                      <input 
                        type="text"
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-600"
                        placeholder="Full street address"
                        value={newPharmacy.address}
                        onChange={e => setNewPharmacy({ ...newPharmacy, address: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Phone</label>
                        <input 
                          type="tel"
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-600"
                          placeholder="021..."
                          value={newPharmacy.phone}
                          onChange={e => setNewPharmacy({ ...newPharmacy, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email</label>
                        <input 
                          type="email"
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-600"
                          placeholder="pharmacy@example.com"
                          value={newPharmacy.email}
                          onChange={e => setNewPharmacy({ ...newPharmacy, email: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="p-8 bg-slate-50 flex gap-4">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-8 py-4 bg-white text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all border border-slate-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={activeTab === 'zones' ? addZone : addPharmacy}
                  className="flex-1 px-8 py-4 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20"
                >
                  Save {activeTab === 'zones' ? 'Zone' : 'Pharmacy'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
