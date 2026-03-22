import React from 'react';
import { motion } from 'motion/react';
import { User, ShieldCheck, Truck, Eye, LogIn, UserPlus, ArrowRight, X } from 'lucide-react';

interface AuthOverlayProps {
  onSignIn: () => void;
  onGuest: () => void;
}

export default function AuthOverlay({ onSignIn, onGuest }: AuthOverlayProps) {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/20 relative"
      >
        {/* Close Button */}
        <button 
          onClick={onGuest}
          className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="p-12 text-center space-y-4">
          <div className="w-20 h-20 bg-teal-600 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-teal-600/20 mb-6">
            <Truck size={40} />
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900">Welcome to MediRoute™</h2>
          <p className="text-slate-500 font-medium">Select your access level to continue</p>
        </div>

        {/* Options */}
        <div className="p-8 pt-0 space-y-4">
          <button 
            onClick={onSignIn}
            className="w-full group p-6 bg-slate-900 text-white rounded-[2rem] flex items-center gap-6 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
          >
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <LogIn size={28} />
            </div>
            <div className="text-left flex-1">
              <p className="font-black uppercase tracking-widest text-xs opacity-60">Registered Access</p>
              <h3 className="text-xl font-bold">Sign In with Google</h3>
              <p className="text-sm opacity-60">Patients, Riders & Administrators</p>
            </div>
            <ArrowRight size={24} className="opacity-40 group-hover:translate-x-2 transition-transform" />
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={onGuest}
              className="group p-6 bg-white border-2 border-slate-100 rounded-[2rem] flex flex-col items-center gap-4 hover:border-teal-600 hover:bg-teal-50/30 transition-all"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
                <Eye size={24} />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-slate-900">Visitor</h3>
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Guest Access</p>
              </div>
            </button>

            <button 
              onClick={onSignIn}
              className="group p-6 bg-white border-2 border-slate-100 rounded-[2rem] flex flex-col items-center gap-4 hover:border-teal-600 hover:bg-teal-50/30 transition-all"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
                <UserPlus size={24} />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-slate-900">Register</h3>
                <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">New Patient</p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-3 text-slate-400">
          <ShieldCheck size={16} />
          <p className="text-[10px] font-black uppercase tracking-widest">Secure Regulatory Access Portal</p>
        </div>
      </motion.div>
    </div>
  );
}
