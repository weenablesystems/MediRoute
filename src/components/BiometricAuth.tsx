import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScanFace, ShieldCheck, AlertCircle, Camera, RefreshCw, X } from 'lucide-react';

interface BiometricAuthProps {
  onVerified: () => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
}

export default function BiometricAuth({ onVerified, onCancel, title = "Biometric Verification", description = "Scan your face to verify identity" }: BiometricAuthProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'scanning' | 'verifying' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    setStatus('requesting');
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStatus('scanning');
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Could not access camera. Please check permissions.');
      setStatus('error');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleScan = () => {
    if (status !== 'scanning') return;
    
    setStatus('verifying');
    
    // Simulate verification process
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        stopCamera();
        onVerified();
      }, 1500);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl"
        onClick={onCancel}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hardware Header */}
        <div className="p-8 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-500 border border-teal-500/20">
              <ScanFace size={20} />
            </div>
            <div>
              <h3 className="text-white font-black uppercase tracking-widest text-sm">{title}</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Secure Auth v2.4</p>
            </div>
          </div>
          {onCancel && (
            <button 
              onClick={onCancel}
              className="p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-8 space-y-8">
          {/* Camera Viewport */}
          <div className="relative aspect-square bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 group">
            {status === 'idle' || status === 'error' ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-slate-600">
                  <Camera size={32} />
                </div>
                <p className="text-slate-400 text-sm font-medium">{description}</p>
                {error && <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{error}</p>}
                <button 
                  onClick={startCamera}
                  className="px-8 py-3 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/20"
                >
                  Initialize Camera
                </button>
              </div>
            ) : (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover grayscale opacity-50 contrast-125"
                />
                
                {/* Scanning Overlay */}
                <AnimatePresence>
                  {status === 'scanning' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 pointer-events-none"
                    >
                      {/* Grid Lines */}
                      <div className="absolute inset-0 opacity-20" 
                        style={{ 
                          backgroundImage: 'linear-gradient(#00ffcc 1px, transparent 1px), linear-gradient(90deg, #00ffcc 1px, transparent 1px)',
                          backgroundSize: '20px 20px'
                        }} 
                      />
                      
                      {/* Scanning Bar */}
                      <motion.div 
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-teal-400 shadow-[0_0_15px_rgba(0,255,204,0.8)] z-10"
                      />
                      
                      {/* Corner Accents */}
                      <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-teal-400 rounded-tl-lg" />
                      <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-teal-400 rounded-tr-lg" />
                      <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-teal-400 rounded-bl-lg" />
                      <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-teal-400 rounded-br-lg" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Status Overlays */}
                <AnimatePresence>
                  {status === 'verifying' && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center space-y-4"
                    >
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full"
                      />
                      <p className="text-teal-400 font-black uppercase tracking-[0.3em] text-xs animate-pulse">Analyzing Biometrics...</p>
                    </motion.div>
                  )}

                  {status === 'success' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 bg-teal-500/20 backdrop-blur-md flex flex-col items-center justify-center space-y-4"
                    >
                      <div className="w-20 h-20 bg-teal-500 text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(20,184,166,0.5)]">
                        <ShieldCheck size={40} />
                      </div>
                      <p className="text-white font-black uppercase tracking-[0.3em] text-sm">Identity Verified</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {status === 'scanning' && (
              <button 
                onClick={handleScan}
                className="w-full py-5 bg-teal-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-teal-500 transition-all shadow-2xl shadow-teal-600/20 flex items-center justify-center gap-3"
              >
                <ScanFace size={20} />
                Begin Facial Scan
              </button>
            )}
            
            {status === 'error' && (
              <button 
                onClick={startCamera}
                className="w-full py-5 bg-slate-800 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
              >
                <RefreshCw size={20} />
                Retry Connection
              </button>
            )}

            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status === 'scanning' ? 'bg-teal-500 animate-pulse' : 'bg-slate-700'}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {status === 'scanning' ? 'System Ready' : status === 'verifying' ? 'Processing' : 'Standby'}
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700">Paarl-Logistics-Node-04</span>
            </div>
          </div>
        </div>

        {/* Technical Footer */}
        <div className="p-6 bg-slate-900/50 border-t border-slate-800">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Latency', value: '14ms' },
              { label: 'Accuracy', value: '99.8%' },
              { label: 'Node', value: 'SA-iLabs' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-600 mb-1">{stat.label}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
