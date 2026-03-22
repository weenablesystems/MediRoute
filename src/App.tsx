import React, { useState, useEffect, createContext, useContext } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile, UserRole } from './types';
import LandingPage from './views/LandingPage';
import OrderForm from './views/OrderForm';
import Dashboard from './views/Dashboard';
import Onboarding from './views/Onboarding';
import AdminPanel from './views/AdminPanel';
import EmmaAgent from './components/EmmaAgent';
import LegalOverlay from './components/LegalOverlay';
import AuthOverlay from './components/AuthOverlay';
import { Layout, LogOut, User as UserIcon, ShieldCheck, Truck, PlusCircle, LayoutDashboard, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'landing' | 'order' | 'dashboard' | 'admin'>('landing');
  const [legalAccepted, setLegalAccepted] = useState<boolean>(() => {
    return localStorage.getItem('mediroute_legal_accepted') === 'true';
  });
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setLoading(true); // Ensure loading is true while fetching profile
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        } else {
          // Create default profile
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || '',
            role: 'patient',
            isBoarded: false,
            createdAt: new Date().toISOString(),
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setShowAuthOverlay(false);
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleAcceptLegal = () => {
    setLegalAccepted(true);
    localStorage.setItem('mediroute_legal_accepted', 'true');
    if (!user) {
      setShowAuthOverlay(true);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setView('landing');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logout }}>
      <div className={`min-h-screen bg-slate-50 font-sans text-slate-900 transition-all duration-700 ${(!legalAccepted || (showAuthOverlay && !user)) ? 'blur-md grayscale scale-105 overflow-hidden' : ''}`}>
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setView('landing')}
            >
              <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-600/20 group-hover:rotate-12 transition-transform">
                <Truck size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight">MediRoute<span className="text-teal-600">™</span></span>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  {profile?.role === 'admin' && (
                    <button 
                      onClick={() => setView('admin')}
                      className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-[#1a1a1a]/5 transition-colors"
                    >
                      <Settings size={18} />
                      <span className="hidden sm:inline">Admin</span>
                    </button>
                  )}
                  <button 
                    onClick={() => setView('dashboard')}
                    className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-[#1a1a1a]/5 transition-colors"
                  >
                    <LayoutDashboard size={18} />
                    <span className="hidden sm:inline">Dashboard</span>
                  </button>
                  {profile?.role === 'patient' && (
                    <button 
                      onClick={() => setView('order')}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors shadow-sm"
                    >
                      <PlusCircle size={18} />
                      <span className="hidden sm:inline">Request Collection</span>
                    </button>
                  )}
                  <div className="h-8 w-px bg-[#1a1a1a]/10" />
                  <button 
                    onClick={logout}
                    className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setShowAuthOverlay(true)}
                  className="px-6 py-2 bg-[#1a1a1a] text-white rounded-full hover:bg-[#333] transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {user && profile && !profile.isBoarded ? (
              <motion.div
                key="onboarding"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Onboarding />
              </motion.div>
            ) : (
              <>
                {view === 'landing' && (
                  <motion.div
                    key="landing"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <LandingPage 
                      onStartOrder={() => {
                        if (!user) setShowAuthOverlay(true);
                        else setView('order');
                      }} 
                      onPartner={() => {
                        if (!user) setShowAuthOverlay(true);
                        else setView('dashboard');
                      }} 
                    />
                  </motion.div>
                )}
                {view === 'order' && (
                  <motion.div
                    key="order"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <OrderForm onComplete={() => setView('dashboard')} />
                  </motion.div>
                )}
                {view === 'dashboard' && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Dashboard />
                  </motion.div>
                )}
                {view === 'admin' && profile?.role === 'admin' && (
                  <motion.div
                    key="admin"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <AdminPanel />
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </main>

        {/* Emma-i Agent */}
        <EmmaAgent />

        {/* Footer */}
        <footer className="border-top border-[#1a1a1a]/10 py-12 px-4 bg-white mt-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">⚕️MediRoute™</h3>
              <p className="text-sm text-[#1a1a1a]/60 leading-relaxed">
                Regulated last-mile pharmaceutical logistics platform. Not a pharmacy — A logistics platform.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-4">Powered By</h4>
              <p className="text-sm text-[#1a1a1a]/60">🌐SA-iLabs™</p>
              <p className="text-sm text-[#1a1a1a]/60">Modular Identity Continuity Agent &lt;&gt;Emma-i™</p>
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest mb-4">Legal</h4>
              <ul className="text-sm text-[#1a1a1a]/60 space-y-2">
                <li>SAPC Compliant</li>
                <li>POPIA Compliant</li>
                <li>Digital Consent Flow</li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[#1a1a1a]/10 text-center text-xs text-[#1a1a1a]/40">
            © 2026 MediRoute™. All rights reserved. Paarl, Western Cape.
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {!legalAccepted && (
          <LegalOverlay onAccept={handleAcceptLegal} />
        )}
        {legalAccepted && showAuthOverlay && !user && (
          <AuthOverlay onSignIn={signIn} onGuest={() => setShowAuthOverlay(false)} />
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  );
}
