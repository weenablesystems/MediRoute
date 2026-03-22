import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { RiderLocation } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Truck, MapPin, Navigation } from 'lucide-react';

// Fix for default marker icons in Leaflet with React
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom rider icon
const riderIcon = L.divIcon({
  html: `<div class="bg-teal-600 p-2 rounded-full shadow-lg border-2 border-white text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
         </div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

interface RiderTrackerProps {
  riderId: string;
  orderId: string;
  onClose: () => void;
}

function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position);
  }, [position, map]);
  return null;
}

export default function RiderTracker({ riderId, orderId, onClose }: RiderTrackerProps) {
  const [location, setLocation] = useState<RiderLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'riderLocations', riderId), (doc) => {
      if (doc.exists()) {
        setLocation(doc.data() as RiderLocation);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [riderId]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-4xl h-[80vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
              <Truck size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Track Delivery</h3>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Order #{orderId.slice(-6).toUpperCase()}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400"
          >
            <X size={24} />
          </button>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative bg-slate-100">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : location ? (
            <MapContainer 
              center={[location.latitude, location.longitude]} 
              zoom={15} 
              className="w-full h-full"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[location.latitude, location.longitude]} icon={riderIcon}>
                <Popup>
                  <div className="p-2">
                    <p className="font-bold text-teal-600">MediRoute™ Rider</p>
                    <p className="text-xs text-slate-500">Last updated: {new Date(location.updatedAt).toLocaleTimeString()}</p>
                  </div>
                </Popup>
              </Marker>
              <RecenterMap position={[location.latitude, location.longitude]} />
            </MapContainer>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                <Navigation size={40} className="opacity-20" />
              </div>
              <p className="font-medium">Rider location not yet available.</p>
              <p className="text-sm max-w-xs">Tracking will begin once the rider starts moving towards your location.</p>
            </div>
          )}

          {/* Floating Info Card */}
          {location && (
            <div className="absolute bottom-8 left-8 right-8 md:left-auto md:right-8 md:w-80 z-[1000]">
              <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/20 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Current Status</p>
                    <p className="font-bold text-slate-900">Rider is on the way</p>
                  </div>
                </div>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '60%' }}
                    className="h-full bg-teal-600"
                  />
                </div>
                <p className="text-xs text-slate-500 italic">Live tracking powered by SA-iLabs™</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
