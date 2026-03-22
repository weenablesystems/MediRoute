import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../App';
import { db, handleFirestoreError } from '../firebase';
import { collection, addDoc, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Order, OperationType, Zone, Pharmacy } from '../types';
import { ArrowLeft, ArrowRight, Check, MapPin, Building2, FileText, ShieldCheck, Phone } from 'lucide-react';

interface OrderFormProps {
  onComplete: () => void;
}

export default function OrderForm({ onComplete }: OrderFormProps) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState<Zone[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [formData, setFormData] = useState<Partial<Order>>({
    patientId: user?.uid || '',
    patientName: user?.displayName || '',
    medicationName: '',
    quantity: '1',
    pharmacyName: '',
    deliveryAddress: profile?.address || '',
    deliveryZone: profile?.zone || '',
    patientPhone: profile?.phone || '',
    prescriptionDetails: '',
    consentGiven: false,
    status: 'pending',
  });

  useEffect(() => {
    const zonesQuery = query(collection(db, 'zones'), orderBy('name', 'asc'));
    const pharmaciesQuery = query(collection(db, 'pharmacies'), orderBy('name', 'asc'));

    const unsubscribeZones = onSnapshot(zonesQuery, (snapshot) => {
      setZones(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Zone)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'zones'));

    const unsubscribePharmacies = onSnapshot(pharmaciesQuery, (snapshot) => {
      setPharmacies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pharmacy)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'pharmacies'));

    return () => {
      unsubscribeZones();
      unsubscribePharmacies();
    };
  }, []);

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const orderData = {
        ...formData,
        patientId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalAmount: 150, // Fixed delivery fee
        paymentStatus: 'pending',
      };
      await addDoc(collection(db, 'orders'), orderData);
      onComplete();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Pharmacy', icon: <Building2 size={20} /> },
    { id: 2, title: 'Delivery', icon: <MapPin size={20} /> },
    { id: 3, title: 'Details', icon: <FileText size={20} /> },
    { id: 4, title: 'Consent', icon: <ShieldCheck size={20} /> },
  ];

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-slate-50 p-8 flex items-center justify-between border-b border-slate-100">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                step >= s.id ? 'bg-teal-600 text-white' : 'bg-white text-slate-300 border border-slate-200'
              }`}>
                {step > s.id ? <Check size={18} /> : s.icon}
              </div>
              <span className={`hidden sm:inline text-sm font-bold uppercase tracking-widest ${
                step >= s.id ? 'text-teal-600' : 'text-slate-300'
              }`}>
                {s.title}
              </span>
              {i < steps.length - 1 && (
                <div className={`w-8 h-px hidden sm:block ${step > s.id ? 'bg-teal-600' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {step === 1 && (
                <div className="space-y-6">
                  <div className="h-48 rounded-[2rem] overflow-hidden relative group">
                    <img 
                      src="https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&q=80&w=1000" 
                      alt="Pharmacy" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter text-slate-900">Where should we collect?</h2>
                  <p className="text-slate-500">Select the pharmacy where your prescription is held.</p>
                  <div className="space-y-4">
                    <label className="block text-sm font-bold uppercase tracking-widest text-slate-400">Select Pharmacy</label>
                    <select 
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-600 transition-all appearance-none"
                      value={formData.pharmacyName}
                      onChange={e => setFormData({ ...formData, pharmacyName: e.target.value })}
                    >
                      <option value="">Choose a pharmacy...</option>
                      {pharmacies.map(p => (
                        <option key={p.id} value={p.name}>{p.name} - {p.address}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="h-48 rounded-[2rem] overflow-hidden relative group">
                    <img 
                      src="https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=1000" 
                      alt="Delivery" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter text-slate-900">Where are we delivering?</h2>
                  <p className="text-slate-500">Provide your full delivery address and contact number.</p>
                  <div className="space-y-4">
                    <label className="block text-sm font-bold uppercase tracking-widest text-slate-400">Delivery Zone</label>
                    <select 
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-600 transition-all appearance-none"
                      value={formData.deliveryZone}
                      onChange={e => setFormData({ ...formData, deliveryZone: e.target.value })}
                    >
                      <option value="">Select Zone</option>
                      {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                    </select>
                    
                    <label className="block text-sm font-bold uppercase tracking-widest text-slate-400">Delivery Address</label>
                    <textarea 
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-600 transition-all min-h-[120px]"
                      placeholder="Street address, suburb, Paarl"
                      value={formData.deliveryAddress}
                      onChange={e => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    />
                    <label className="block text-sm font-bold uppercase tracking-widest text-slate-400">Contact Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="tel"
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-600 transition-all"
                        placeholder="082 123 4567"
                        value={formData.patientPhone}
                        onChange={e => setFormData({ ...formData, patientPhone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="h-48 rounded-[2rem] overflow-hidden relative group">
                    <img 
                      src="https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=1000" 
                      alt="Medication" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter text-slate-900">Medication Details</h2>
                  <p className="text-slate-500">Tell us what we are collecting and any specific instructions.</p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-bold uppercase tracking-widest text-slate-400">Medication Name</label>
                        <input 
                          type="text"
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-600 transition-all"
                          placeholder="e.g. Panado, Chronic Meds"
                          value={formData.medicationName}
                          onChange={e => setFormData({ ...formData, medicationName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold uppercase tracking-widest text-slate-400">Quantity</label>
                        <input 
                          type="text"
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-600 transition-all"
                          placeholder="e.g. 1 box"
                          value={formData.quantity}
                          onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                        />
                      </div>
                    </div>
                    <label className="block text-sm font-bold uppercase tracking-widest text-slate-400">Additional Instructions</label>
                    <textarea 
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-600 transition-all min-h-[120px]"
                      placeholder="e.g. Chronic medication, 3 items"
                      value={formData.prescriptionDetails}
                      onChange={e => setFormData({ ...formData, prescriptionDetails: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="h-48 rounded-[2rem] overflow-hidden relative group">
                    <img 
                      src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1000" 
                      alt="Consent" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter text-slate-900">Digital Consent Form</h2>
                  <p className="text-slate-500">Please review and sign the authorization below to proceed with your collection request.</p>
                  
                  <div className="space-y-6 p-8 bg-teal-50/30 rounded-[2.5rem] border border-teal-100/50 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-teal-600/60">Patient Full Name</label>
                        <input 
                          type="text"
                          className="w-full px-0 py-2 bg-transparent border-b-2 border-teal-100 focus:border-teal-600 focus:ring-0 transition-all font-bold text-slate-900"
                          placeholder="Your full name"
                          value={formData.patientName}
                          onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-teal-600/60">Authorized Pharmacy</label>
                        <input 
                          type="text"
                          readOnly
                          className="w-full px-0 py-2 bg-transparent border-b-2 border-teal-100 font-bold text-slate-900 cursor-not-allowed opacity-60"
                          value={formData.pharmacyName}
                        />
                      </div>
                    </div>

                    <div className="p-6 bg-white/60 rounded-3xl border border-teal-100/50">
                      <p className="text-sm leading-relaxed text-slate-600 italic">
                        "I, <span className="font-bold text-slate-900 underline decoration-teal-200">{formData.patientName || '[Name]'}</span>, hereby authorize MediRoute™ and its verified agents to collect my prescription medication from <span className="font-bold text-slate-900 underline decoration-teal-200">{formData.pharmacyName || '[Pharmacy]'}</span> and deliver it to my specified address. I understand that MediRoute™ is a logistics provider and not a pharmacy, and I am responsible for ensuring the accuracy of the medication details provided."
                      </p>
                    </div>

                    <div className="space-y-4 pt-4">
                      <label className="flex items-start gap-4 cursor-pointer group">
                        <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all shrink-0 mt-1 ${
                          formData.consentGiven ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-slate-200 group-hover:border-teal-600'
                        }`}>
                          {formData.consentGiven && <Check size={18} />}
                        </div>
                        <input 
                          type="checkbox"
                          className="hidden"
                          checked={formData.consentGiven}
                          onChange={e => setFormData({ ...formData, consentGiven: e.target.checked })}
                        />
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900">I confirm the details above are correct</p>
                          <p className="text-xs text-slate-400">By checking this box, I provide my legally binding digital signature.</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest px-4">
                    <ShieldCheck size={14} className="text-teal-600" />
                    POPIA & SAPC Compliant Authorization
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-100">
            <button 
              onClick={prevStep}
              disabled={step === 1 || loading}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                step === 1 ? 'opacity-0 pointer-events-none' : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              <ArrowLeft size={18} />
              Back
            </button>
            
            {step < 4 ? (
              <button 
                onClick={nextStep}
                disabled={step === 1 && !formData.pharmacyName}
                className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all disabled:opacity-30"
              >
                Next
                <ArrowRight size={18} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={!formData.consentGiven || !formData.patientName || loading}
                className="flex items-center gap-2 px-12 py-3 bg-teal-600 text-white rounded-full font-bold hover:bg-teal-700 transition-all disabled:opacity-30 shadow-xl shadow-teal-600/20"
              >
                {loading ? 'Processing...' : 'Submit Request'}
                <Check size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
