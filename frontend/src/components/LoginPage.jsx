import React, { useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { FiUser, FiEye, FiEyeOff, FiLock, FiArrowLeft } from 'react-icons/fi';
import { FaFacebookF, FaTwitter } from 'react-icons/fa';
import Logo from './Logo';

const LoginPage = ({ onBack, onSignUp, onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    let valid = true;
    let newErrors = { email: '', password: '' };

    if (!email) {
      newErrors.email = 'Username/Email is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
      valid = false;
    }
    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    }

    setErrors(newErrors);

    if (valid) {
      setLoading(true);
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      .then(res => res.json().then(data => ({ status: res.status, body: data })))
      .then(({ status, body }) => {
        setLoading(false);
        if (status === 200) {
          localStorage.setItem('token', body.token);
          localStorage.setItem('user', JSON.stringify(body.user));
          setSuccess(true);
          if (onLoginSuccess) {
            setTimeout(onLoginSuccess, 1000);
          }
        } else {
          setErrors({ ...newErrors, email: body.message || 'Login failed' });
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        setErrors({ ...newErrors, email: 'Network error. Please try again later.' });
      });
    }
  };

  return (
    <div
      className="flex w-full min-h-screen font-sans overflow-hidden relative"
      style={{ backgroundColor: '#EFF3F8', color: '#0D1B2A' }}
    >

      {/* Logo */}
      <Logo withGlass className="absolute top-6 left-6 md:top-8 md:left-8" onClick={onBack} />

      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 right-6 md:top-8 md:right-8 z-50 flex items-center gap-2 px-5 py-2.5 rounded-full font-bold cursor-pointer transition-all duration-300 bg-white/30 backdrop-blur-md border border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.1)] hover:bg-white/40 hover:shadow-[0_6px_32px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          style={{ color: '#0D1B2A', WebkitBackdropFilter: 'blur(12px)' }}
        >
          <FiArrowLeft className="text-xl" />
          <span>Back to Home</span>
        </button>
      )}

      {/* 55% Left Panel - Illustration Area */}
      <div className="hidden lg:flex flex-col w-[55%] relative items-center justify-center p-12">
        {/* Organic Flowing Blob Shapes Background (Navy/Purple) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Using SVG paths for exact blob shapes blending from left to center */}
          <svg viewBox="0 0 800 1000" className="absolute top-0 left-[-10%] w-[120%] h-full opacity-80" preserveAspectRatio="none">
            <path fill="#3D3D8F" d="M -100 0 C 150 50, 400 200, 350 500 C 300 800, 600 900, 500 1000 L -100 1000 Z" className="animate-blob" />
            <path fill="rgba(61, 61, 143, 0.5)" d="M -100 -100 C 300 100, 500 400, 450 700 C 400 1000, 700 800, 600 1200 L -100 1200 Z" className="animate-blob animation-delay-2000" />
          </svg>
        </div>

        {/* DotLottie Animation via dotlottie-react */}
        <div className="relative z-10 w-full max-w-[1000px] xl:max-w-[1000px] h-auto flex justify-center items-center drop-shadow-2xl animate-fade-in-up transform scale-110 xl:scale-125">
          <DotLottieReact
            src="https://lottie.host/07a0beeb-6751-4c77-abc0-59fee3e4be87/sis6kDBEL9.lottie"
            loop
            autoplay
            backgroundColor="transparent"
            style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
          />
        </div>
      </div>

      {/* 45% Right Panel - Form Area */}
      <div
        className="w-full lg:w-[45%] p-6 sm:p-12 relative z-10"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {/* Amber Card */}
        <div
          className="w-full max-w-md rounded-[24px] p-8 sm:p-10 shadow-2xl animate-slide-in-left"
          style={{ backgroundColor: '#F5A623', color: '#0D1B2A' }}
        >

          {/* Title */}
          <div className="text-center mb-8 animate-fade-in-up animation-delay-150">
            <h1
              className="font-serif text-4xl sm:text-5xl font-bold leading-tight mb-2 tracking-wide"
              style={{ color: '#0D1B2A' }}
            >
              Login to continue
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Email Field */}
            <div className="animate-fade-in-up animation-delay-300">
              <div className="relative text-[#0D1B2A]">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiUser className="opacity-60 text-lg" style={{ color: '#0D1B2A' }} />
                </div>
                <input
                  type="email"
                  placeholder="Username/Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  className={`w-full pl-11 pr-4 py-3.5 rounded-full outline-none transition-shadow placeholder:text-[#0D1B2A] placeholder:opacity-70 ${errors.email ? 'border-2 border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]' : 'border border-transparent focus:ring-2 focus:ring-[#0D1B2A]'}`}
                  style={{ backgroundColor: '#ffffff', color: '#0D1B2A' }}
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-[13px] mt-1.5 ml-4 font-bold">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="animate-fade-in-up animation-delay-450">
              <div className="relative text-[#0D1B2A]">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="opacity-60 text-lg" style={{ color: '#0D1B2A' }} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  className={`w-full pl-11 pr-12 py-3.5 rounded-full outline-none transition-shadow placeholder:text-[#0D1B2A] placeholder:opacity-70 ${errors.password ? 'border-2 border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]' : 'border border-transparent focus:ring-2 focus:ring-[#0D1B2A]'}`}
                  style={{ backgroundColor: '#ffffff', color: '#0D1B2A' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                  tabIndex="-1"
                  style={{ color: '#0D1B2A' }}
                >
                  {showPassword ? <FiEye className="text-xl" /> : <FiEyeOff className="text-xl" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-[13px] mt-1.5 ml-4 font-bold">{errors.password}</p>
              )}
            </div>

            {/* Options Row */}
            <div className="flex items-center justify-between px-2 pt-1 animate-fade-in-up animation-delay-600">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input type="checkbox" className="w-[18px] h-[18px] rounded border-[#0D1B2A] focus:ring-[#0D1B2A] bg-white accent-[#0D1B2A] cursor-pointer" />
                <span className="text-sm font-semibold group-hover:opacity-80 transition-opacity" style={{ color: '#0D1B2A' }}>Remember me</span>
              </label>
              <a href="#" className="text-sm font-semibold hover:underline decoration-2 underline-offset-4" style={{ color: '#0D1B2A' }}>
                Forget password?
              </a>
            </div>

            {/* Submit Button */}
            <div className="pt-4 animate-fade-in-up animation-delay-800">
              <button
                type="submit"
                disabled={loading || success}
                className="w-full text-white font-bold text-[17px] py-[15px] rounded-full transition-all duration-300 hover:bg-opacity-90 hover:shadow-[0_8px_20px_rgba(13,27,42,0.3)] active:scale-[0.98] flex items-center justify-center disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100"
                style={{ backgroundColor: '#0D1B2A' }}
              >
                {loading ? (
                  <svg className="animate-spin h-[26px] w-[26px] text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : success ? (
                  <span className="animate-fade-in">Success!</span>
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </form>

          {/* Social Divider */}
          <div className="mt-8 flex items-center justify-center animate-fade-in-up animation-delay-1000 mb-6">
            <div className="h-[2px] opacity-15 flex-1" style={{ backgroundColor: '#0D1B2A' }}></div>
            <span className="px-4 text-[13px] font-bold tracking-wider uppercase opacity-80" style={{ color: '#0D1B2A' }}>New to Mind Sky?</span>
            <div className="h-[2px] opacity-15 flex-1" style={{ backgroundColor: '#0D1B2A' }}></div>
          </div>

          {/* Sign Up Glass Button */}
          <div className="flex items-center justify-center animate-fade-in-up animation-delay-1000">
            <button
              type="button"
              onClick={onSignUp}
              className="w-full px-5 py-[15px] rounded-full font-bold cursor-pointer transition-all duration-300 bg-white/20 backdrop-blur-md border border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.1)] hover:bg-white/30 hover:shadow-[0_6px_32px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-[17px] flex items-center justify-center gap-2"
              style={{ color: '#0D1B2A', WebkitBackdropFilter: 'blur(12px)' }}
            >
              Sign Up
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default LoginPage;
