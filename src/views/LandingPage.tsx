import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Truck, Clock, MapPin, ArrowRight, UserCheck, FileCheck } from 'lucide-react';

interface LandingPageProps {
  onStartOrder: () => void;
  onPartner: () => void;
}

export default function LandingPage({ onStartOrder, onPartner }: LandingPageProps) {
  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at center, #0D9488 0%, transparent 70%)',
          }}
        />
        
        <div className="z-10 max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-50 text-teal-700 rounded-full text-sm font-bold tracking-widest uppercase border border-teal-100"
          >
            <ShieldCheck size={16} />
            Legally Compliant
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-slate-900"
          >
            Your prescription, collected & delivered with <span className="text-teal-600">full legal consent</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-[#1a1a1a]/60 max-w-2xl mx-auto leading-relaxed"
          >
            We don't sell medicine. We connect you with verified agents who collect your prescription from your pharmacy — legally, safely, and on time.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <button 
              onClick={onStartOrder}
              className="w-full sm:w-auto px-10 py-5 bg-teal-600 text-white rounded-2xl text-lg font-bold hover:bg-teal-700 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-teal-600/20"
            >
              Request a Collection
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onPartner}
              className="w-full sm:w-auto px-10 py-5 bg-white border border-slate-200 text-slate-600 rounded-2xl text-lg font-bold hover:bg-slate-50 transition-all"
            >
              Partner as a Pharmacy
            </button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-8 pt-12 text-sm text-[#1a1a1a]/40 font-bold uppercase tracking-widest"
          >
            <div className="flex items-center gap-2">
              <Clock size={16} />
              Avg. 45 min delivery
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              Paarl, Western Cape
            </div>
          </motion.div>
        </div>
      </section>

      {/* Image Section */}
      <section className="px-4">
        <div className="max-w-6xl mx-auto relative group">
          <div className="absolute -inset-4 bg-teal-600/5 rounded-[4rem] blur-3xl group-hover:bg-teal-600/10 transition-all" />
          <img 
            src="https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&q=80&w=2069" 
            alt="MediRoute Pharmaceutical Logistics" 
            className="relative w-full h-[600px] object-cover rounded-[3rem] shadow-2xl"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-12 left-12 bg-white/95 backdrop-blur-md p-10 rounded-[2.5rem] shadow-2xl max-w-md border border-white/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-600/20">
                <UserCheck size={28} />
              </div>
              <div>
                <h4 className="font-black text-xl text-slate-900 leading-none">SAHPRA Compliant</h4>
                <p className="text-teal-600 text-sm font-bold uppercase tracking-widest mt-1">Verified Logistics</p>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed text-lg">
              Our agents are vetted and follow strict pharmaceutical handling protocols to ensure your safety and privacy at every step.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="max-w-7xl mx-auto px-4 py-24 space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900">How MediRoute™ Works</h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">Three simple steps to get your medication delivered to your door.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              step: "01",
              title: "Request Collection",
              desc: "Provide your pharmacy details and medication info through our secure portal.",
              img: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=1000"
            },
            {
              step: "02",
              title: "Digital Consent",
              desc: "Sign our legally binding digital consent form to authorize our agent to collect on your behalf.",
              img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1000"
            },
            {
              step: "03",
              title: "Safe Delivery",
              desc: "Our verified agent collects your meds and delivers them to your doorstep in under 60 minutes.",
              img: "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=1000"
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="space-y-6 group"
            >
              <div className="relative h-80 overflow-hidden rounded-[2.5rem] shadow-xl">
                <img 
                  src={item.img} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6 w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-xl text-teal-600 shadow-lg">
                  {item.step}
                </div>
              </div>
              <div className="space-y-2 px-4">
                <h3 className="text-2xl font-black text-slate-900">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-2">
            <p className="text-teal-600 font-bold uppercase tracking-[0.3em] text-sm">Trusted by Industry Leaders</p>
            <h2 className="text-3xl font-black text-slate-900">Partnering with Local Pharmacies</h2>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all">
            <div className="text-3xl font-black tracking-tighter text-slate-400">CLICKS</div>
            <div className="text-3xl font-black tracking-tighter text-slate-400">DIS-CHEM</div>
            <div className="text-3xl font-black tracking-tighter text-slate-400">MEDI-RITE</div>
            <div className="text-3xl font-black tracking-tighter text-slate-400">LOCAL PHARMACY</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6 p-10 bg-white rounded-[2.5rem] border border-slate-100 hover:border-teal-200 transition-all hover:shadow-xl hover:shadow-teal-600/5 group">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <FileCheck size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Digital Consent</h3>
            <p className="text-slate-500 leading-relaxed">
              Legally authorize our agents to collect on your behalf using our secure, POPIA-compliant digital consent flow.
            </p>
          </div>
          
          <div className="space-y-6 p-10 bg-white rounded-[2.5rem] border border-slate-100 hover:border-emerald-200 transition-all hover:shadow-xl hover:shadow-emerald-600/5 group">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Truck size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Verified Agents</h3>
            <p className="text-slate-500 leading-relaxed">
              Every rider is background-checked and trained in the safe transportation of chronic and acute medication.
            </p>
          </div>
          
          <div className="space-y-6 p-10 bg-white rounded-[2.5rem] border border-slate-100 hover:border-blue-200 transition-all hover:shadow-xl hover:shadow-blue-600/5 group">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Full Audit Trail</h3>
            <p className="text-slate-500 leading-relaxed">
              Track your medication from the moment it leaves the pharmacy shelf to your doorstep with real-time updates.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <div className="bg-slate-900 rounded-[4rem] p-12 md:p-24 text-center text-white space-y-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-600 rounded-full blur-[160px]" />
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black leading-[0.9] relative z-10 tracking-tighter">
            Ready to skip the <br /><span className="text-teal-400">pharmacy queue?</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto relative z-10 leading-relaxed">
            Join thousands of patients in Paarl who trust MediRoute for their medication logistics. Fast, secure, and legally compliant.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
            <button 
              onClick={onStartOrder}
              className="w-full sm:w-auto px-12 py-5 bg-teal-600 text-white rounded-2xl text-lg font-bold hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20"
            >
              Get Started Now
            </button>
            <button 
              onClick={onPartner}
              className="w-full sm:w-auto px-12 py-5 bg-white/10 text-white rounded-2xl text-lg font-bold hover:bg-white/20 transition-all backdrop-blur-md border border-white/10"
            >
              Partner with Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
