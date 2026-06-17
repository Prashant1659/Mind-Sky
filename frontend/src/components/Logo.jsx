import React from 'react';
import { FaBrain } from 'react-icons/fa';

const Logo = ({ className = '', lightText = false, onClick, withGlass = false }) => {
  const baseTextClass = lightText ? 'text-white' : 'text-[#0D1B2A]';
  
  const glassClasses = withGlass
    ? `pl-2 pr-5 py-2 rounded-full backdrop-blur-md border shadow-[0_4px_24px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_32px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 ${lightText ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-white/30 border-white/40 hover:bg-white/40'}`
    : 'transition hover:opacity-80';

  return (
    <div 
      onClick={onClick} 
      className={`flex items-center gap-3 cursor-pointer z-[100] ${baseTextClass} ${glassClasses} ${className}`}
      style={withGlass ? { WebkitBackdropFilter: 'blur(12px)' } : {}}
    >
      <div className={`flex items-center justify-center w-[2.75rem] h-[2.75rem] rounded-full text-white shadow-sm ring-4 ${lightText ? 'bg-[#F5A623] ring-[#F5A623]/40' : 'bg-[#F5A623] ring-[#F5A623]/20'} shrink-0`}>
        <FaBrain className="text-2xl" />
      </div>
      <span className="font-serif font-bold text-[1.65rem] md:text-3xl tracking-wide animate-fade-in whitespace-nowrap">Mind Sky</span>
    </div>
  );
};

export default Logo;
