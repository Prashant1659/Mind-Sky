import React, { useState } from 'react';
import { FiAlertCircle, FiX, FiCheckCircle } from 'react-icons/fi';

const CrisisButton = ({ user }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrigger = async () => {
    setLoading(true);
    let lat = null;
    let lng = null;

    if (navigator.geolocation) {
      try {
        const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch (e) {
        console.warn('Geolocation denied or timeout');
      }
    }

    try {
      const token = localStorage.getItem('token');
      
      await fetch('/api/crisis/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          userId: user._id || user.id, 
          userName: user.fullName || 'User',
          crisisType: 'manual_button', 
          latitude: lat, 
          longitude: lng 
        })
      });

      setTriggered(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={() => !triggered && setShowConfirm(true)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all cursor-pointer group relative ${triggered ? 'bg-gray-400' : 'bg-red-500 shadow-[0_10px_40px_rgba(239,68,68,0.5)] animate-pulse hover:scale-110 active:scale-95'}`}
        >
          <FiAlertCircle size={26} />
          <span className="absolute right-16 bg-[#0D1B2A] text-white text-[9px] px-3 py-1.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all font-black uppercase tracking-widest pointer-events-none shadow-xl">
            {triggered ? 'Alert Sent' : 'Immediate Support'}
          </span>
        </button>
      </div>

      {showConfirm && !triggered && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative">
            <button onClick={() => setShowConfirm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black cursor-pointer">
              <FiX size={24} />
            </button>
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <FiAlertCircle size={32} />
            </div>
            <h3 className="text-2xl font-black text-red-600 mb-2">Trigger SOS?</h3>
            <p className="text-gray-600 text-sm mb-6">
              Are you in immediate danger? This will instantly alert your emergency contacts with your current location.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={handleTrigger}
                disabled={loading}
                className="flex-1 bg-red-500 text-white rounded-full py-3 font-bold hover:bg-red-600 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Sending...' : 'YES, HELP ME'}
              </button>
            </div>
          </div>
        </div>
      )}

      {triggered && showConfirm && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative">
              <button onClick={() => setShowConfirm(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black cursor-pointer">
                <FiX size={24} />
              </button>
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                 <FiCheckCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-green-600 mb-2">Help is on the way</h3>
              <p className="text-gray-600 text-sm">
                Your emergency contacts have been notified. Please stay safe. We are here for you.
              </p>
            </div>
         </div>
      )}
    </>
  );
};
export default CrisisButton;
