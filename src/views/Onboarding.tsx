import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../App';
import { db, handleFirestoreError } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { UserRole, OperationType } from '../types';
import { User, Truck, Building2, ShieldCheck, MapPin, Phone, Check, ScanFace } from 'lucide-react';
import BiometricAuth from '../components/BiometricAuth';

export default function Onboarding() {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>('patient');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [zone, setZone] = useState('Central Paarl');
  const [loading, setLoading] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);

  const zones = ['Central Paarl', 'Northern Paarl', 'Southern Paarl', 'Mbekweni', 'Wellington'];

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        role,
        phone,
        address,
        zone,
        isBoarded: true,
        updatedAt: new Date().toISOString(),
        biometricVerified: role === 'rider' ? true : false
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setLoading(false);
    }
  };

  const onContinue = () => {
    if (step === 2 && role === 'rider') {
      setShowBiometric(true);
    } else if (step === 2) {
      handleComplete();
    } else {
      setStep(2);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 p-8 md:p-12 space-y-12"
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">
            {step === 1 ? 'Select your role' : 'Complete your profile'}
          </h1>
          <p className="text-slate-500">
            {step === 1 ? 'Tell us how you\'ll be using MediRoute™.' : 'Provide your contact and delivery details.'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setRole('patient')}
                  className={`p-6 rounded-3xl border-2 transition-all text-left flex items-start gap-4 ${
                    role === 'patient' ? 'border-teal-600 bg-teal-50/50' : 'border-slate-100 hover:border-teal-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${role === 'patient' ? 'bg-teal-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                    <User size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-slate-900">Patient</p>
                    <p className="text-sm text-slate-500">I need my medication delivered.</p>
                  </div>
                </button>

                <button
                  onClick={() => setRole('rider')}
                  className={`p-6 rounded-3xl border-2 transition-all text-left flex items-start gap-4 ${
                    role === 'rider' ? 'border-teal-600 bg-teal-50/50' : 'border-slate-100 hover:border-teal-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${role === 'rider' ? 'bg-teal-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                    <Truck size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-slate-900">Rider</p>
                    <p className="text-sm text-slate-500">I want to deliver medication.</p>
                  </div>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <label className="block text-sm font-bold uppercase tracking-widest text-slate-400">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="tel"
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-600 transition-all"
                    placeholder="082 123 4567"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold uppercase tracking-widest text-slate-400">Default Address</label>
                <div className="relative">
                  <MapPin className="absolute left-6 top-6 text-slate-400" size={18} />
                  <textarea 
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-600 transition-all min-h-[100px]"
                    placeholder="Street address, suburb, Paarl"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold uppercase tracking-widest text-slate-400">Primary Zone</label>
                <select 
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-teal-600 transition-all appearance-none"
                  value={zone}
                  onChange={e => setZone(e.target.value)}
                >
                  {zones.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between pt-8 border-t border-slate-100">
          {step === 2 && (
            <button 
              onClick={() => setStep(1)}
              className="px-6 py-3 rounded-full font-bold hover:bg-slate-50 text-slate-600 transition-all"
            >
              Back
            </button>
          )}
          <div className={step === 1 ? 'w-full' : ''}>
            {step === 1 ? (
              <button 
                onClick={onContinue}
                className="w-full py-5 bg-slate-900 text-white rounded-full text-xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={onContinue}
                disabled={loading || !phone || !address}
                className="px-12 py-5 bg-teal-600 text-white rounded-full text-xl font-bold hover:bg-teal-700 transition-all disabled:opacity-30 shadow-xl shadow-teal-600/20 flex items-center justify-center gap-3"
              >
                {loading ? 'Saving...' : role === 'rider' ? 'Verify Identity' : 'Complete Setup'}
                {role === 'rider' ? <ScanFace size={24} /> : <Check size={24} />}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-widest">
          <ShieldCheck size={14} />
          Your data is protected under POPIA
        </div>
      </motion.div>

      <AnimatePresence>
        {showBiometric && (
          <BiometricAuth 
            onVerified={() => {
              setShowBiometric(false);
              handleComplete();
            }}
            onCancel={() => setShowBiometric(false)}
            title="Rider Identity Verification"
            description="Please scan your face to verify your rider identity for MediRoute™."
          />
        )}
      </AnimatePresence>
    </div>
  );
}
