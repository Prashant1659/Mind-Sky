import React from 'react';
import { FaBrain } from 'react-icons/fa';
import Logo from './Logo';

const Navbar = ({ onLoginClick, onSignUpClick }) => {
  return (
    <nav className="w-full flex items-center justify-between px-8 py-5 md:px-16 lg:px-24 mb-4 z-20 backdrop-blur-md bg-white/20 border-b border-white/30 sticky top-0 transition-all duration-300">
      {/* Logo Section */}
      <Logo />

      {/* Buttons */}
      <div className="flex items-center gap-5 animate-fade-in animation-delay-300">
        <button onClick={onLoginClick} className="hidden sm:block px-8 py-2 rounded-full border-[3px] border-custom-teal text-custom-teal font-semibold hover:bg-custom-teal hover:text-white transition-colors duration-300 shadow-sm cursor-pointer">
          Login
        </button>
        <button onClick={onSignUpClick} className="px-8 py-2.5 rounded-full bg-brand-amber text-white font-bold tracking-wide hover:bg-yellow-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md cursor-pointer">
          Sign Up
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
