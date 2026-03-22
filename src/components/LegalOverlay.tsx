import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, FileText, Check, AlertCircle, Scale, Gavel } from 'lucide-react';

interface LegalOverlayProps {
  onAccept: () => void;
}

export default function LegalOverlay({ onAccept }: LegalOverlayProps) {
  const [acceptedTOS, setAcceptedTOS] = useState(false);
  const [acceptedPOPIA, setAcceptedPOPIA] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      setScrolledToBottom(true);
    }
  };

  const canProceed = acceptedTOS && acceptedPOPIA && scrolledToBottom;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white/20"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 bg-teal-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <Scale size={120} />
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Legal Compliance</h2>
              <p className="text-teal-100 text-sm font-medium uppercase tracking-widest">MediRoute™ Regulatory Framework</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div 
          className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
          onScroll={handleScroll}
        >
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-teal-600">
              <FileText size={20} />
              <h3 className="font-black uppercase tracking-widest text-sm">1. Terms of Service</h3>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl text-sm text-slate-600 leading-relaxed space-y-4 border border-slate-100">
              <p className="font-bold text-slate-900">Last Updated: March 2026</p>
              <p>
                Welcome to MediRoute™. By accessing or using our platform, you agree to be bound by these Terms of Service. 
                MediRoute™ is a logistics platform that facilitates the collection and delivery of pharmaceutical products. 
                We are NOT a pharmacy and do not dispense medication.
              </p>
              <p>
                <span className="font-bold text-slate-900">1.1 Logistics Services:</span> We act as an intermediary between you and your chosen pharmacy. 
                Our riders are verified logistics agents trained in the handling of sensitive medical packages. We do not provide medical advice.
              </p>
              <p>
                <span className="font-bold text-slate-900">1.2 User Responsibility:</span> You are responsible for providing accurate prescription details 
                and ensuring that the pharmacy has your valid prescription on file. You must be 18 years or older to use this service.
              </p>
              <p>
                <span className="font-bold text-slate-900">1.3 Liability:</span> MediRoute™ is liable only for the secure transport of the package from 
                the pharmacy to your door. We are not liable for the contents of the medication or any pharmaceutical errors.
              </p>
              <p>
                <span className="font-bold text-slate-900">1.4 Payment:</span> Delivery fees are non-refundable once the collection process has been initiated 
                by a verified rider.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-teal-600">
              <ShieldCheck size={20} />
              <h3 className="font-black uppercase tracking-widest text-sm">2. POPIA Consent (South Africa)</h3>
            </div>
            <div className="bg-teal-50/30 p-6 rounded-3xl text-sm text-slate-600 leading-relaxed space-y-4 border border-teal-100/50">
              <p>
                In accordance with the Protection of Personal Information Act (POPIA), we require your consent to process your 
                personal and health-related data.
              </p>
              <p>
                <span className="font-bold text-slate-900">2.1 Data Collection:</span> We collect your name, address, contact details, 
                and medication names solely for the purpose of delivery logistics and regulatory compliance.
              </p>
              <p>
                <span className="font-bold text-teal-900">2.2 Data Sharing:</span> Your delivery details are shared with our verified 
                riders and your selected pharmacy. We do not sell your data to third parties. All riders are bound by strict non-disclosure agreements.
              </p>
              <p>
                <span className="font-bold text-teal-900">2.3 Security:</span> All data is encrypted and stored in secure cloud 
                environments compliant with South African and international standards (ISO 27001).
              </p>
              <p>
                <span className="font-bold text-teal-900">2.4 Your Rights:</span> You have the right to access, correct, or delete your personal 
                information at any time through your account settings or by contacting our information officer.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-teal-600">
              <Gavel size={20} />
              <h3 className="font-black uppercase tracking-widest text-sm">3. Regulatory Compliance</h3>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl text-sm text-slate-600 leading-relaxed space-y-4 border border-slate-100">
              <p>
                MediRoute™ operates in strict adherence to the South African Pharmacy Council (SAPC) guidelines for the 
                couriering of medicines and the National Health Act (Act No. 61 of 2003).
              </p>
              <p>
                Our platform ensures that the chain of custody for scheduled medication is maintained and that all 
                logistics agents are aware of the sensitivity of pharmaceutical products.
              </p>
            </div>
          </section>

          {!scrolledToBottom && (
            <div className="flex items-center justify-center gap-2 py-4 text-amber-600 animate-pulse">
              <AlertCircle size={16} />
              <p className="text-xs font-bold uppercase tracking-widest">Please scroll to the bottom to continue</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50 space-y-6">
          <div className="space-y-3">
            <label className="flex items-center gap-4 cursor-pointer group">
              <div 
                onClick={() => setAcceptedTOS(!acceptedTOS)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  acceptedTOS ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-slate-200 group-hover:border-teal-600'
                }`}
              >
                {acceptedTOS && <Check size={14} />}
              </div>
              <span className="text-sm font-bold text-slate-700">I accept the Terms of Service & Conditions</span>
            </label>
            <label className="flex items-center gap-4 cursor-pointer group">
              <div 
                onClick={() => setAcceptedPOPIA(!acceptedPOPIA)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  acceptedPOPIA ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-slate-200 group-hover:border-teal-600'
                }`}
              >
                {acceptedPOPIA && <Check size={14} />}
              </div>
              <span className="text-sm font-bold text-slate-700">I provide explicit POPIA consent for data processing</span>
            </label>
          </div>

          <button
            disabled={!canProceed}
            onClick={onAccept}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl ${
              canProceed 
                ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Accept & Continue
          </button>
        </div>
      </motion.div>
    </div>
  );
}
