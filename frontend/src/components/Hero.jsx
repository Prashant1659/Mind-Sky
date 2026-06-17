import React, { useState } from 'react';
import { FaInstagram, FaFacebookF, FaTwitter, FaEnvelope } from 'react-icons/fa';

const Hero = ({ onGuestLoginSuccess }) => {
  const [guestLoading, setGuestLoading] = useState(false);

  const handleGuestLogin = () => {
    setGuestLoading(true);
    fetch('/api/auth/guest-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(({ status, body }) => {
      setGuestLoading(false);
      if (status === 201) {
        localStorage.setItem('token', body.token);
        localStorage.setItem('user', JSON.stringify(body.user));
        if (onGuestLoginSuccess) {
          setTimeout(onGuestLoginSuccess, 500);
        }
      } else {
        alert(body.message || 'Guest login failed');
      }
    })
    .catch((err) => {
      console.error(err);
      setGuestLoading(false);
      alert('Network error. Please try again later.');
    });
  };

  return (
    <main className="flex-1 flex flex-col md:flex-row items-center justify-between px-8 md:px-16 lg:px-24 w-full gap-12 lg:gap-20 pb-12 pt-6 h-full z-10">
      
      {/* Left Image Section */}
      <div className="w-full md:w-1/2 flex justify-center items-center relative group min-h-[400px]">
        {/* Soft blob decoration behind the image */}
        <div className="absolute w-[120%] h-[120%] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-white/10 blur-2xl z-0 transition-transform duration-700 group-hover:scale-105"></div>
        
        {/* Glow Ring Wrapper & Image */}
        <div 
          className="relative z-10 w-full max-w-[32rem] lg:max-w-[40rem] rounded-[40%_60%_60%_40%/50%_40%_50%_60%] bg-transparent flex items-center justify-center animate-[float_6s_ease-in-out_infinite] mix-blend-multiply overflow-visible"
          style={{ 
            boxShadow: '0 8px 48px rgba(0,0,0,0.18)',
            outline: '3px solid rgba(255,255,255,0.15)'
          }}
        >
          <img 
            src="/hero-illustration.png" 
            alt="Serene mind illustration" 
            className="w-full object-cover rounded-[40%_60%_60%_40%/50%_40%_50%_60%]"
          />
        </div>
      </div>

      {/* Right Content Section */}
      <div className="w-full md:w-1/2 flex flex-col items-center text-center md:items-start md:text-left justify-center h-full pt-4 md:pt-0">
        
        {/* Staggered Headline */}
        <h1 
          className="font-serif text-[#0D3D56] leading-[0.95] mb-8 drop-shadow-sm flex flex-wrap justify-center md:justify-start gap-x-3"
          style={{ fontSize: 'clamp(3.8rem, 8vw, 96px)' }}
        >
          <span className="inline-block animate-fade-in-up font-normal">Calm</span>
          <span className="inline-block animate-fade-in-up animation-delay-150 font-normal">Your</span>
          <span className="block mt-2 w-full animate-fade-in-up animation-delay-300">
            <span className="font-normal">Entire</span> <span className="font-bold">Self</span>
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-[#0D3D56]/80 font-medium mb-12 max-w-lg leading-relaxed mix-blend-multiply animate-fade-in-up animation-delay-450">
          Our mental health affects the way you think, act, and feel. It is an absolutely important aspect in our life which determine how we handle stress and also how we make choice in life.
        </p>

        {/* Call to Actions - Glassmorphism Guest Button */}
        <div className="flex flex-col gap-4 w-full md:max-w-md items-center md:items-start mb-[50px] mt-4 animate-fade-in-up animation-delay-600">
          <button 
            type="button"
            onClick={handleGuestLogin}
            disabled={guestLoading}
            className="w-full sm:w-auto px-10 py-4 rounded-[1.25rem] font-semibold active:scale-95 flex items-center justify-center gap-3 group disabled:opacity-50 cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
              border: '1px solid rgba(0,0,0,0.07)'
            }}
          >
            <span className="text-[#0D3D56] text-lg">{guestLoading ? 'Starting...' : 'Continue as Guest'}</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-[#0D3D56] opacity-80 transition-transform duration-200 ease-out group-hover:translate-x-1" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L13.586 11H3a1 1 0 110-2h10.586l-3.293-3.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <span className="text-sm text-[#0D3D56]/60 font-medium pl-3 opacity-90">
            No account needed. Explore freely.
          </span>
        </div>

        {/* Social Icons row */}
        <div className="flex items-center gap-6 text-[#0D3D56]/70 animate-fade-in-up animation-delay-800">
          {[FaInstagram, FaFacebookF, FaEnvelope, FaTwitter].map((Icon, idx) => (
            <a key={idx} href="#" 
               className="p-3.5 bg-white/40 backdrop-blur-sm rounded-full shadow-sm transition-all duration-200 ease-in-out hover:bg-[#F5A623] hover:text-white hover:scale-110 hover:shadow-md hover:-translate-y-1">
              <Icon className="text-xl" />
            </a>
          ))}
        </div>
      </div>

    </main>
  );
};

export default Hero;
