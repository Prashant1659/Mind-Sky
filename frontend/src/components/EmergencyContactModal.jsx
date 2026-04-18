import React, { useState } from 'react';
import { FiUser, FiPhone, FiStar, FiAlertCircle, FiX } from 'react-icons/fi';

const EmergencyContactModal = ({ userId, onComplete, onClose }) => {
  const [contacts, setContacts] = useState([
    { priority: 'primary', fullName: '', relationship: '', phoneNumber: '' },
    { priority: 'secondary', fullName: '', relationship: '', phoneNumber: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  React.useEffect(() => {
    let isMounted = true;
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/crisis/emergency-contacts/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.contacts && data.contacts.length > 0) {
            const mapped = [
              { priority: 'primary', fullName: '', relationship: '', phoneNumber: '' },
              { priority: 'secondary', fullName: '', relationship: '', phoneNumber: '' }
            ];
            data.contacts.forEach((c) => {
              if (c.priority === 'primary') {
                mapped[0] = { priority: 'primary', fullName: c.fullName || '', relationship: c.relationship || '', phoneNumber: c.phoneNumber || '' };
              } else {
                mapped[1] = { priority: 'secondary', fullName: c.fullName || '', relationship: c.relationship || '', phoneNumber: c.phoneNumber || '' };
              }
            });
            if (isMounted) setContacts(mapped);
          }
        }
      } catch (err) {
        console.error('Failed to fetch existing contacts:', err);
      } finally {
        if (isMounted) setFetching(false);
      }
    };
    fetchContacts();
    return () => { isMounted = false; };
  }, [userId]);

  const handleUpdate = (index, field, value) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate primary contact at least
    const primary = contacts[0];
    if (!primary.fullName || !primary.phoneNumber || !primary.relationship) {
      setError('Primary contact is required.');
      return;
    }

    // Validate any partially filled contacts
    for (let c of contacts) {
      const isPartiallyFilled = c.fullName || c.phoneNumber || c.relationship;
      if (isPartiallyFilled && (!c.fullName || !c.phoneNumber || !c.relationship)) {
        setError(`Please fill all fields for ${c.priority} contact, or leave them completely blank.`);
        return;
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/crisis/emergency-contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, contacts })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save contacts');
      
      onComplete();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white/80 backdrop-blur-2xl border border-white/80 rounded-[32px] p-8 md:p-10 shadow-2xl max-w-lg w-full relative animate-fade-in-up">
        
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h2 className="text-3xl font-serif font-black text-[#0D1B2A] mb-2">{onClose ? 'Emergency Contacts' : 'Safety First'}</h2>
            <p className="text-[#0D1B2A]/60 text-sm font-medium pr-4">
              {onClose 
                ? 'Update your safety net. We only contact them if a severe crisis is detected.' 
                : 'Before you access your dashboard, we require at least one emergency contact. We only contact them if a severe crisis is detected.'}
            </p>
          </div>

          {onClose ? (
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer shrink-0"
            >
              <FiX size={24} />
            </button>
          ) : (
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center shadow-inner shrink-0">
              <FiAlertCircle size={32} />
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl mb-4 font-bold text-center">
            {error}
          </div>
        )}

        {fetching ? (
          <div className="flex justify-center mb-8">
            <div className="animate-pulse w-8 h-8 rounded-full bg-red-100"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
          {contacts.map((c, idx) => (
            <div key={idx} className="bg-white/50 p-4 rounded-2xl border border-black/5">
              <h4 className="text-xs font-black uppercase tracking-widest text-[#0D1B2A]/50 mb-3 flex items-center gap-2">
                {idx === 0 ? <FiStar className="text-amber-500" /> : null}
                {c.priority} Contact {idx === 0 && <span className="text-red-500">*</span>}
              </h4>
              <div className="space-y-3">
                <div className="relative text-[#0D1B2A]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="opacity-40" />
                  </div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={c.fullName}
                    onChange={(e) => handleUpdate(idx, 'fullName', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none border border-transparent focus:border-[#F5A623] bg-white shadow-sm text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Relationship (e.g. Parent)"
                    value={c.relationship}
                    onChange={(e) => handleUpdate(idx, 'relationship', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl outline-none border border-transparent focus:border-[#F5A623] bg-white shadow-sm text-sm"
                  />
                  <div className="relative text-[#0D1B2A]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiPhone className="opacity-40" />
                    </div>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={c.phoneNumber}
                      onChange={(e) => handleUpdate(idx, 'phoneNumber', e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl outline-none border border-transparent focus:border-[#F5A623] bg-white shadow-sm text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0D1B2A] text-white py-4 rounded-full font-black mt-2 transition-transform hover:-translate-y-1 active:scale-95 shadow-xl disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? 'Saving securely...' : 'Save Contacts & Continue'}
          </button>
        </form>
        )}
      </div>
    </div>
  );
};

export default EmergencyContactModal;
