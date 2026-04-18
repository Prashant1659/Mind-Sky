import React, { useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { FiUser, FiEye, FiEyeOff, FiLock, FiArrowLeft, FiMail, FiPhone, FiCalendar, FiGlobe, FiMessageCircle, FiCheck } from 'react-icons/fi';
import Logo from './Logo';
import { guides } from '../utils/constants';

const OnboardingFlow = ({ onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dob: '',
    location: '',
    language: 'English',
    gender: '',
    selectedGuide: null,
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const updateForm = (key, value) => setFormData({ ...formData, [key]: value });

  if (step === 1) {
    return <Step1Credentials formData={formData} updateForm={updateForm} onNext={nextStep} onBack={onBack} />;
  }

  if (step === 2) {
    return <Step2ChooseGuide formData={formData} updateForm={updateForm} onNext={nextStep} onBack={prevStep} />;
  }

  if (step === 9) {
    return <CompletionScreen formData={formData} onFinish={onComplete || (() => window.location.reload())} />;
  }

  // Steps 3 to 8
  return (
    <SharedOnboardingLayout
      step={step}
      formData={formData}
      onNext={nextStep}
      onBack={prevStep}
      updateForm={updateForm}
    />
  );
};

// ==========================================
// STEP 1: CREDENTIALS
// ==========================================
const Step1Credentials = ({ formData, updateForm, onNext, onBack }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleContinue = (e) => {
    e.preventDefault();
    let valid = true;
    let newErrors = {};

    if (!formData.fullName) { newErrors.fullName = 'Required'; valid = false; }
    if (!formData.email) { newErrors.email = 'Required'; valid = false; }
    if (!formData.password) { newErrors.password = 'Required'; valid = false; }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    if (valid) {
      onNext();
    }
  };

  return (
    <div
      className="flex w-full min-h-screen font-sans overflow-hidden relative fade-in"
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
          <span>Back</span>
        </button>
      )}

      {/* 55% Left Panel - Illustration Area */}
      <div className="hidden lg:flex flex-col w-[55%] relative items-center justify-center p-12 overflow-hidden">
        {/* Navy/Purple Bio blobs */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <svg viewBox="0 0 800 1000" className="absolute top-0 left-[-10%] w-[120%] h-full opacity-80" preserveAspectRatio="none">
            <path fill="#3D3D8F" d="M -100 0 C 150 50, 400 200, 350 500 C 300 800, 600 900, 500 1000 L -100 1000 Z" className="animate-blob" />
            <path fill="rgba(61, 61, 143, 0.5)" d="M -100 -100 C 300 100, 500 400, 450 700 C 400 1000, 700 800, 600 1200 L -100 1200 Z" className="animate-blob animation-delay-2000" />
          </svg>
        </div>

        {/* DotLottie Animation via dotlottie-react */}
        <div className="relative z-10 w-full max-w-[800px] xl:max-w-[900px] h-auto flex justify-center items-center drop-shadow-2xl animate-fade-in-up transform scale-110 xl:scale-125">
          <DotLottieReact
            src="https://lottie.host/e39e1a12-03ab-4245-9a40-3d67140d3c8e/D80sYDpnTt.lottie"
            loop
            autoplay
            backgroundColor="transparent"
            style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
          />
        </div>
      </div>

      {/* 45% Right Panel - Form Area */}
      <div
        className="w-full lg:w-[45%] p-6 sm:p-12 relative z-10 overflow-y-auto max-h-screen"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {/* Amber Card */}
        <div
          className="w-full max-w-lg rounded-[24px] p-8 sm:p-10 shadow-2xl animate-slide-in-left my-8"
          style={{ backgroundColor: '#F5A623', color: '#0D1B2A' }}
        >

          {/* Title */}
          <div className="text-center mb-8 animate-fade-in-up">
            <h1
              className="font-serif text-4xl sm:text-5xl font-bold leading-tight mb-2 tracking-wide"
              style={{ color: '#0D1B2A' }}
            >
              Create Account
            </h1>
          </div>

          <form onSubmit={handleContinue} className="space-y-4" noValidate>

            {/* Full Name */}
            <div className="relative text-[#0D1B2A] animate-fade-in-up animation-delay-150">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiUser className="opacity-60 text-lg" style={{ color: '#0D1B2A' }} />
              </div>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) => { updateForm('fullName', e.target.value); if (errors.fullName) setErrors({ ...errors, fullName: null }) }}
                className="w-full pl-11 pr-4 py-3.5 rounded-full outline-none transition-shadow placeholder:text-[#0D1B2A] placeholder:opacity-70 focus:ring-2 focus:ring-[#0D1B2A] border border-transparent h-[50px] shadow-sm"
                style={{ backgroundColor: '#ffffff', color: '#0D1B2A' }}
              />
              {errors.fullName && <p className="text-red-700 text-[13px] mt-1 ml-4 font-bold">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div className="relative text-[#0D1B2A] animate-fade-in-up animation-delay-150">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiMail className="opacity-60 text-lg" style={{ color: '#0D1B2A' }} />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => { updateForm('email', e.target.value); if (errors.email) setErrors({ ...errors, email: null }) }}
                className="w-full pl-11 pr-4 py-3.5 rounded-full outline-none transition-shadow placeholder:text-[#0D1B2A] placeholder:opacity-70 focus:ring-2 focus:ring-[#0D1B2A] border border-transparent h-[50px] shadow-sm"
                style={{ backgroundColor: '#ffffff', color: '#0D1B2A' }}
              />
              {errors.email && <p className="text-red-700 text-[13px] mt-1 ml-4 font-bold">{errors.email}</p>}
            </div>

            {/* Mobile Number */}
            <div className="relative text-[#0D1B2A] animate-fade-in-up animation-delay-150">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiPhone className="opacity-60 text-lg" style={{ color: '#0D1B2A' }} />
              </div>
              <input
                type="tel"
                placeholder="Mobile Number"
                value={formData.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-full outline-none transition-shadow placeholder:text-[#0D1B2A] placeholder:opacity-70 focus:ring-2 focus:ring-[#0D1B2A] border border-transparent h-[50px] shadow-sm"
                style={{ backgroundColor: '#ffffff', color: '#0D1B2A' }}
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up animation-delay-300">
              <div className="relative text-[#0D1B2A]">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="opacity-60 text-lg" style={{ color: '#0D1B2A' }} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => { updateForm('password', e.target.value); if (errors.password) setErrors({ ...errors, password: null }) }}
                  className="w-full pl-11 pr-10 py-3.5 rounded-full outline-none transition-shadow placeholder:text-[#0D1B2A] placeholder:opacity-70 focus:ring-2 focus:ring-[#0D1B2A] border border-transparent h-[50px] shadow-sm"
                  style={{ backgroundColor: '#ffffff', color: '#0D1B2A' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center opacity-60 hover:opacity-100 cursor-pointer" style={{ color: '#0D1B2A' }}>
                  {showPassword ? <FiEye /> : <FiEyeOff />}
                </button>
                {errors.password && <p className="text-red-700 text-[13px] mt-1 ml-4 font-bold">{errors.password}</p>}
              </div>

              <div className="relative text-[#0D1B2A]">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="opacity-60 text-lg" style={{ color: '#0D1B2A' }} />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => { updateForm('confirmPassword', e.target.value); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null }) }}
                  className={`w-full pl-11 pr-10 py-3.5 rounded-full outline-none transition-shadow placeholder:text-[#0D1B2A] placeholder:opacity-70 focus:ring-2 focus:ring-[#0D1B2A] h-[50px] shadow-sm ${errors.confirmPassword ? 'border-2 border-red-600' : 'border border-transparent'}`}
                  style={{ backgroundColor: '#ffffff', color: '#0D1B2A' }}
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center opacity-60 hover:opacity-100 cursor-pointer" style={{ color: '#0D1B2A' }}>
                  {showConfirmPassword ? <FiEye /> : <FiEyeOff />}
                </button>
                {errors.confirmPassword && <p className="text-red-700 text-[13px] mt-1 ml-4 font-bold max-w-[150px] leading-tight">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Date of Birth & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up animation-delay-450">
              <div className="relative text-[#0D1B2A]">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiCalendar className="opacity-60 text-lg" style={{ color: '#0D1B2A' }} />
                </div>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => updateForm('dob', e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-full outline-none transition-shadow focus:ring-2 focus:ring-[#0D1B2A] border border-transparent h-[50px] shadow-sm"
                  style={{ backgroundColor: '#ffffff', color: '#0D1B2A' }}
                />
              </div>

              <div className="relative text-[#0D1B2A]">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiGlobe className="opacity-60 text-lg" style={{ color: '#0D1B2A' }} />
                </div>
                <input
                  type="text"
                  placeholder="City / Country"
                  value={formData.location}
                  onChange={(e) => updateForm('location', e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-full outline-none transition-shadow placeholder:text-[#0D1B2A] placeholder:opacity-70 focus:ring-2 focus:ring-[#0D1B2A] border border-transparent h-[50px] shadow-sm"
                  style={{ backgroundColor: '#ffffff', color: '#0D1B2A' }}
                />
              </div>
            </div>

            {/* Language Dropdown */}
            <div className="relative text-[#0D1B2A] animate-fade-in-up animation-delay-600">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiMessageCircle className="opacity-60 text-lg" style={{ color: '#0D1B2A' }} />
              </div>
              <select
                value={formData.language}
                onChange={(e) => updateForm('language', e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-full outline-none transition-shadow focus:ring-2 focus:ring-[#0D1B2A] border border-transparent appearance-none cursor-pointer h-[50px] shadow-sm"
                style={{ backgroundColor: '#ffffff', color: '#0D1B2A' }}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Mandarin">Mandarin</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 opacity-60" style={{ color: '#0D1B2A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            {/* Gender Radio */}
            <div className="animate-fade-in-up animation-delay-600 pl-2">
              <div className="flex flex-wrap gap-2 sm:gap-4 mt-2">
                {['Male', 'Female', 'Other', 'Prefer not to say'].map(opt => (
                  <label key={opt} className="flex items-center space-x-2 cursor-pointer group bg-white/40 px-3 py-2 rounded-full border border-black/5 hover:bg-white transition-colors">
                    <input
                      type="radio"
                      name="gender"
                      value={opt}
                      checked={formData.gender === opt}
                      onChange={(e) => updateForm('gender', e.target.value)}
                      className="w-4 h-4 border-[#0D1B2A] focus:ring-[#0D1B2A] bg-white accent-[#0D1B2A] cursor-pointer"
                    />
                    <span className="text-[13px] font-bold opacity-80 group-hover:opacity-100" style={{ color: '#0D1B2A' }}>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 animate-fade-in-up animation-delay-800">
              <button
                type="submit"
                className="w-full text-white font-bold text-[17px] py-[15px] h-[50px] rounded-full transition-all duration-300 hover:bg-opacity-90 hover:shadow-[0_8px_20px_rgba(13,27,42,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2"
                style={{ backgroundColor: '#0D1B2A' }}
              >
                Continue <FiArrowLeft className="rotate-180" />
              </button>
            </div>

            {/* Already have an account? */}
            <div className="text-center mt-4 animate-fade-in-up animation-delay-1000">
              <span className="text-sm font-semibold opacity-80" style={{ color: '#0D1B2A' }}>Already have an account? </span>
              <button type="button" onClick={onBack} className="text-sm font-bold hover:underline decoration-2 underline-offset-4" style={{ color: '#0D1B2A' }}>
                Login
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// GUIDE CARD COMPONENT (3D Tilt & Glassmorphism)
// ==========================================
const GuideCard = ({ guide, isSelected, onClick }) => {
  const [tiltStyle, setTiltStyle] = useState({});

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    const multiplier = 15;
    const xRotate = (-y / rect.height) * multiplier;
    const yRotate = (x / rect.width) * multiplier;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${xRotate}deg) rotateY(${yRotate}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease-out'
    });
  };

  return (
    <div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className={`relative cursor-pointer rounded-[24px] lg:rounded-[32px] p-3 sm:p-4 md:p-5 flex flex-col items-center justify-center transition-all duration-300 group overflow-hidden border backdrop-blur-xl
        ${isSelected 
          ? 'border-[#F5A622] bg-[#F5A622]/5 shadow-[0_15px_30px_rgba(245,166,34,0.3)] z-10 scale-105' 
          : 'border-white/20 hover:border-[#F5A622]/40 bg-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_35px_rgba(245,166,34,0.15)] hover:-translate-y-1'}`}
    >
      {isSelected && (
        <div className="absolute inset-0 rounded-[24px] border-4 border-[#F5A622]/20 pointer-events-none z-0"></div>
      )}
      
      {isSelected && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[#F5A622] text-white rounded-full p-1 sm:p-1.5 animate-fade-in z-20 shadow-[0_0_15px_rgba(245,166,34,0.4)]">
          <FiCheck className="text-xs sm:text-sm font-bold" />
        </div>
      )}

      <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-2 flex items-center justify-center pointer-events-none">
        <img 
          src={guide.image} 
          alt={guide.name} 
          className="w-full h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-lg" 
        />
      </div>
      
      <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-[#0D1B2A] text-center mb-0.5 leading-tight">{guide.name}</h3>
      <p className={`${isSelected ? 'text-[#F5A622]' : 'text-[#0D1B2A]/70'} font-bold text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest text-center transition-colors duration-300`}>{guide.tag}</p>
    </div>
  );
};

// ==========================================
// STEP 2: CHOOSE YOUR GUIDE
// ==========================================
const Step2ChooseGuide = ({ formData, updateForm, onNext, onBack }) => {
  const selectedGuide = guides.find(g => g.id === formData.selectedGuide);

  return (
    <div className="h-[100dvh] w-full flex flex-col items-center py-2 sm:py-4 px-2 sm:px-4 relative font-sans overflow-hidden bg-gradient-to-br from-[#E0F2FE] via-[#BAE6FD] to-[#7DD3FC] animate-gradient-x text-[#0D1B2A]">

      {/* Noise Texture & Atmosphere */}
      <div className="absolute inset-0 bg-noise z-0 mix-blend-overlay"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-white/50 blur-[120px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#0284C7]/20 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Header Container (Top) */}
      <div className="w-full flex justify-between items-center relative z-50 mb-1 sm:mb-2 px-2 sm:px-6 mt-1 sm:mt-2">
         <Logo withGlass lightText={false} className="drop-shadow-md scale-75 md:scale-100 origin-left" onClick={onBack} />
         <button
          onClick={onBack}
          className="flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-full font-bold cursor-pointer transition-all duration-300 bg-white/40 backdrop-blur-xl border border-white/60 shadow-sm hover:bg-white/70 text-[#0D1B2A] text-xs sm:text-base"
        >
          <FiArrowLeft className="text-base" />
          <span className="hidden sm:inline">Back</span>
        </button>
      </div>

      {/* Main Content (Flex-1 properly bounds height) */}
      <div className="flex-1 w-full max-w-5xl flex flex-col items-center justify-evenly relative z-10 px-1 py-1">
        
        {/* Header Texts */}
        <div className="text-center w-full px-2 mt-[-10px] sm:mt-[-15px] md:mt-[-30px]">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0D1B2A] mb-1 tracking-tight drop-shadow-sm animate-fade-in-up">
            Choose your guide
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-[#0D1B2A]/70 font-medium animate-fade-in-up animation-delay-150">
            This companion will guide your journey and stay with you.
          </p>
        </div>

        {/* Grid Container ALWAYS 3 cols to save vertical space */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6 w-full px-1 animate-fade-in-up animation-delay-300">
          {guides.map((guide) => (
            <GuideCard 
              key={guide.id}
              guide={guide}
              isSelected={formData.selectedGuide === guide.id}
              onClick={() => updateForm('selectedGuide', guide.id)}
            />
          ))}
        </div>

        {/* Footer Area with static height to prevent jumping */}
        <div className="h-16 sm:h-24 flex items-end justify-center w-full">
          {selectedGuide ? (
            <div className="w-full flex flex-col items-center justify-center animate-fade-in-up">
              <p className="text-[#0D1B2A] text-sm sm:text-base md:text-lg font-medium mb-1.5 sm:mb-3 drop-shadow-sm text-center">
                <span className="font-bold text-[#F5A622]">{selectedGuide.name}</span> will guide your journey!
              </p>
              <button
                onClick={onNext}
                className="px-6 py-2 sm:px-10 sm:py-4 rounded-full font-bold text-sm sm:text-xl bg-[#F5A622] text-white hover:bg-[#d98f1a] transition-all duration-300 shadow-[0_8px_20px_rgba(245,166,34,0.3)] hover:shadow-[0_12px_25px_rgba(245,166,34,0.5)] hover:-translate-y-1 active:scale-95 flex items-center gap-2 cursor-pointer group"
              >
                Let's go <FiArrowLeft className="rotate-180 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          ) : (
            <div className="h-full w-full"></div> /* Placeholder to keep layout stable */
          )}
        </div>

      </div>

    </div>
  );
};

// ==========================================
// SHARED LAYOUT (STEPS 3 - 8)
// ==========================================
const SharedOnboardingLayout = ({ step, formData, onNext, onBack, updateForm }) => {
  const selectedGuide = guides.find(g => g.id === formData.selectedGuide) || guides[0];

  const stepMessages = {
    3: "Let's capture your academic journey.",
    4: "Tell me about your lifestyle habits.",
    5: "How are you feeling right now?",
    6: "A quick psychological screening.",
    7: "What are your specific goals?",
    8: "Let's review the final consents."
  };

  const currentMsg = stepMessages[step];
  const progressRatio = ((step - 2) / 6) * 100;

  const renderCurrentStep = () => {
    switch (step) {
      case 3: return <Step3Academic formData={formData} updateForm={updateForm} />;
      case 4: return <Step4Lifestyle formData={formData} updateForm={updateForm} />;
      case 5: return <Step5Baseline formData={formData} updateForm={updateForm} />;
      case 6: return <Step6Screening formData={formData} updateForm={updateForm} />;
      case 7: return <Step7Goals formData={formData} updateForm={updateForm} />;
      case 8: return <Step8Consent formData={formData} updateForm={updateForm} />;
      default: return null;
    }
  };

  // Determine if next is allowed based on consent primarily, or basic validation
  const canProceed = () => {
    if (step === 8) {
      return formData.consent1 && formData.consent2 && formData.consent3 && formData.consent4;
    }
    return true;
  };

  return (
    <div className="flex w-full min-h-[100dvh] font-sans relative overflow-hidden bg-gradient-to-br from-[#E0F2FE] via-[#E9D5FF] to-[#FFEDD5] text-[#0D1B2A] animate-gradient-x">
      
      {/* Noise Texture & Enhanced Sky Atmosphere */}
      <div className="absolute inset-0 bg-noise z-0 mix-blend-overlay opacity-40"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-white/60 blur-[130px] rounded-full pointer-events-none animate-pulse-slow z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#BAE6FD]/40 blur-[150px] rounded-full pointer-events-none z-0"></div>
      
      {/* Parallax Floating Particles */}
      <div className="absolute top-[15%] right-[20%] w-2 h-2 bg-white rounded-full blur-[1px] shadow-[0_0_10px_white] opacity-60 animate-float pointer-events-none z-0" style={{ animationDuration: '7s' }}></div>
      <div className="absolute bottom-[25%] left-[15%] w-3 h-3 bg-white rounded-full blur-[2px] shadow-[0_0_15px_white] opacity-40 animate-float pointer-events-none z-0" style={{ animationDuration: '9s', animationDelay: '1s' }}></div>
      <div className="absolute top-[45%] left-[8%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white] opacity-70 animate-float pointer-events-none z-0" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>

      {/* Top Progress Indicator */}
      <div className="absolute top-0 left-0 w-full h-[6px] bg-white/40 z-[100] flex">
        <div
          className="h-full bg-gradient-to-r from-[#F5A622] to-[#FB923C] transition-all duration-700 ease-in-out shadow-[0_0_15px_rgba(245,166,34,0.5)] relative"
          style={{ width: `${progressRatio}%` }}
        >
          {/* Active Glow Head */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_#F5A622]"></div>
        </div>
      </div>

      {/* Header Container (Top) */}
      <div className="absolute top-0 left-0 w-full px-4 sm:px-8 py-4 sm:py-6 flex justify-between items-center z-50 pointer-events-none">
        <Logo withGlass lightText={false} onClick={onBack} className="drop-shadow-sm scale-75 md:scale-90 origin-left pointer-events-auto" />
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold cursor-pointer transition-all duration-300 bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:bg-white/90 hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 text-[#0D1B2A] text-sm sm:text-base pointer-events-auto group"
        >
          <FiArrowLeft className="text-lg transition-transform group-hover:-translate-x-1" /> <span className="hidden sm:inline">Back</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="w-full h-full flex flex-col md:flex-row items-center justify-center relative z-10 pt-20 sm:pt-24 px-4 sm:px-6 md:px-8 gap-4 md:gap-8 lg:gap-10">
        
        {/* Mascot / Guide Companion */}
        <div className="hidden md:flex flex-col items-center w-[25%] max-w-[280px] animate-fade-in-up">
          <div className="relative mb-6 group">
            {/* Guide Bubble / Soft Float */}
            <div className="w-56 h-56 lg:w-[260px] lg:h-[260px] flex items-center justify-center transition-all duration-500 overflow-visible relative z-10 animate-pulse-slow">
              <img src={selectedGuide.image} alt={selectedGuide.name} className="w-full h-full object-contain pointer-events-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-transform duration-500 group-hover:scale-[1.05]" />
            </div>
            {/* Soft shadow underneath to float */}
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-32 h-6 bg-black/[0.08] blur-xl rounded-full transition-all duration-500 group-hover:w-40 group-hover:opacity-60"></div>
          </div>

          {/* Contextual Speech Bubble */}
          <div className="bg-white/80 backdrop-blur-2xl border border-white/80 rounded-[24px] p-5 shadow-[0_20px_40px_rgba(0,0,0,0.08)] w-full relative mt-2 animate-fade-in-up animation-delay-300">
             {/* Speech Tail pointing UP */}
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white/80 backdrop-blur-2xl border-t border-l border-white/80 rotate-45 z-0"></div>
             
             <h2 className="text-xl lg:text-2xl font-serif font-bold text-[#0D1B2A] mb-1.5 text-center drop-shadow-sm tracking-wide relative z-10">
                {selectedGuide.name}
             </h2>
             <p className="text-sm lg:text-[15px] text-[#0D1B2A]/70 text-center font-medium leading-relaxed italic relative z-10">
                "{currentMsg}"
             </p>
          </div>
        </div>

        {/* Central Form Card */}
        <div className="w-full max-w-[650px] bg-white/70 backdrop-blur-3xl border border-white/80 rounded-[40px] p-6 sm:p-10 md:p-14 shadow-[0_30px_80px_rgba(0,0,0,0.1),inset_0_2px_20px_rgba(255,255,255,0.8)] relative animate-fade-in-up md:w-[65%] flex-shrink-0 transition-transform duration-500 hover:shadow-[0_40px_100px_rgba(0,0,0,0.12),inset_0_2px_20px_rgba(255,255,255,0.9)]">
          
          <div className="mb-8 sm:mb-10 text-center relative z-20">
            <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-serif font-bold text-[#0D1B2A] mb-2 sm:mb-4 tracking-wide drop-shadow-sm leading-tight">
              {step === 3 && 'Academic Profile'}
              {step === 4 && 'Lifestyle & Habits'}
              {step === 5 && 'Mental Health Baseline'}
              {step === 6 && 'Psychological Screening'}
              {step === 7 && 'Personal Goals'}
              {step === 8 && 'Terms & Consent'}
            </h2>
            <p className="text-[#0D1B2A]/50 font-bold text-[11px] sm:text-xs uppercase tracking-[0.2em]">Step {step - 2} of 6</p>
          </div>

          <div className="min-h-[280px] relative z-20 w-full overflow-y-auto max-h-[50vh] sm:max-h-none overflow-x-hidden px-1 py-1">
            {renderCurrentStep()}
          </div>

          {/* Premium CTA Button */}
          <div className="mt-10 flex justify-center items-center relative z-20 pt-2 sm:pt-4">
            <button
              onClick={onNext}
              disabled={!canProceed()}
              className="px-8 sm:px-12 py-4 sm:py-5 rounded-full font-bold text-lg sm:text-[20px] bg-gradient-to-r from-[#F5A622] to-[#FB923C] text-white transition-all duration-300 shadow-[0_10px_30px_rgba(245,166,34,0.4)] hover:shadow-[0_15px_40px_rgba(245,166,34,0.6)] hover:-translate-y-1.5 active:scale-95 flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none disabled:cursor-not-allowed w-full sm:w-[85%]"
            >
              {step === 8 ? 'Complete Setup' : 'Let\'s go'} 
              <FiArrowLeft className="rotate-180 transition-transform duration-500 group-hover:translate-x-3 text-xl" />
            </button>
          </div>
          
        </div>

      </div>
    </div>
  );
};

// ==========================================
// PREMIUM INPUT COMPONENTS
// ==========================================
const PremiumFloatingInput = ({ label, value, onChange, placeholder, type = "text" }) => {
  const [isFocused, setIsFocused] = useState(false);
  const isActive = isFocused || (value && value.toString().length > 0);

  return (
    <div className="relative group w-full">
      {/* Pill Input (Matches Step 2 guide card glass) */}
      <div className={`relative bg-white/50 backdrop-blur-xl border transition-all duration-300 rounded-[20px] shadow-[0_4px_15px_rgba(0,0,0,0.03)] ${isFocused ? 'border-[#F5A622]/60 shadow-[0_0_20px_rgba(245,166,34,0.15)] bg-white/80' : 'border-white/60 hover:bg-white/70 hover:border-[#F5A622]/30'}`}>
        <label 
          className={`absolute left-5 transition-all duration-300 pointer-events-none font-bold ${
            isActive 
              ? 'top-2 text-[10px] text-[#F5A622] uppercase tracking-widest' 
              : 'top-1/2 -translate-y-1/2 text-sm sm:text-base text-[#0D1B2A]/50 tracking-wide'
          }`}
        >
          {label}
        </label>
        <input
          type={type}
          value={value || ''}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full bg-transparent outline-none px-5 pb-2.5 pt-6 text-[#0D1B2A] font-bold transition-opacity duration-300 ${isActive || isFocused ? 'opacity-100' : 'opacity-0'}`}
          placeholder={isFocused ? placeholder : ''}
        />
      </div>
    </div>
  );
};

// Premium Slider Hookup
const PremiumSlider = ({ value, onChange, min, max, label = "Current Semester", showMarks = false }) => {
  const safeVal = value || min;
  const percentage = ((safeVal - min) / (max - min)) * 100;
  
  return (
    <div className="w-full relative animate-fade-in-up py-4 mt-2">
      <div className="flex justify-between items-center mb-14 px-1 relative">
        <p className="font-bold text-[#0D1B2A]/60 text-xs uppercase tracking-[0.15em]">{label}</p>
      </div>
      
      <div className="relative h-3 w-full bg-black/5 backdrop-blur-xl border border-black/5 rounded-full shadow-inner overflow-visible mt-2">
         {/* Floating Pill Indicator perfectly centered dynamically above the physical thumb */}
         <div 
           className="absolute -top-[42px] transform -translate-x-1/2 px-5 py-2 min-w-[60px] bg-white backdrop-blur-xl border border-[#F5A622]/30 rounded-full text-[#F5A622] font-extrabold text-sm shadow-[0_10px_25px_rgba(245,166,34,0.25)] flex items-center justify-center z-30 pointer-events-none transition-all duration-[50ms]"
           style={{ left: `calc(${percentage}%)` }}
         >
           {safeVal}{showMarks ? 'h' : ''}
           {/* Arrow pointing down */}
           <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white"></div>
         </div>
         {/* Active Track */}
         <div 
           className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#F5A622] to-[#FB923C] rounded-full shadow-[0_0_15px_rgba(245,166,34,0.4)] transition-all duration-[50ms]"
           style={{ width: `${percentage}%` }}
         ></div>
         
         {/* Tick Marks */}
         {showMarks && [5, 7, 9].map(tick => {
           const tickP = ((tick - min) / (max - min)) * 100;
           return (
             <div key={tick} className="absolute top-1/2 -translate-y-1/2 w-1 h-3 bg-white/70 rounded-full pointer-events-none z-10" style={{ left: `calc(${tickP}%)` }}></div>
           );
         })}

         {/* Draggable Thumb */}
         <div 
            className="absolute top-1/2 w-8 h-8 bg-white border-4 border-[#F5A622] rounded-full shadow-[0_5px_15px_rgba(245,166,34,0.4)] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20 transition-all duration-[50ms] scale-100 peer-active:scale-90"
            style={{ left: `calc(${percentage}%)` }}
         >
             <div className="w-2.5 h-2.5 bg-[#F5A622] rounded-full animate-pulse-slow"></div>
         </div>
         
         {/* Native Input Range Overlay */}
         <input
           type="range"
           min={min}
           max={max}
           value={safeVal}
           onChange={onChange}
           className="peer absolute inset-0 -top-4 w-full h-10 opacity-0 cursor-pointer z-30"
         />
      </div>
      
      <div className="flex justify-between mt-6 px-1 text-xs font-bold text-[#0D1B2A]/40 uppercase tracking-widest">
        <span>{min}{showMarks ? 'h' : ' Year 1'}</span>
        <span>{max}{showMarks ? 'h' : ' Year 4'}</span>
      </div>
    </div>
  );
};

// ==========================================
// PREMIUM CHIPS
// ==========================================
const PremiumChip = ({ label, selected, onClick, icon, subtext }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-5 py-3.5 rounded-[24px] font-bold text-sm sm:text-[15px] cursor-pointer transition-all duration-300 flex items-center gap-3 border shadow-sm hover:-translate-y-0.5 group
      ${selected 
        ? 'bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] text-white border-transparent shadow-[0_12px_25px_rgba(14,165,233,0.3)] scale-[1.02]' 
        : 'bg-white/60 backdrop-blur-xl text-[#0D1B2A]/80 border-white/80 hover:bg-white/90 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]'}`}
  >
    {icon && <span className="text-xl sm:text-2xl drop-shadow-sm group-hover:scale-110 transition-transform">{icon}</span>}
    <div className="flex flex-col items-start leading-tight text-left">
      <span>{label}</span>
      {subtext && <span className={`text-[10px] sm:text-[11px] font-medium mt-0.5 tracking-wide ${selected ? 'text-white/80' : 'text-[#0D1B2A]/50'}`}>{subtext}</span>}
    </div>
  </button>
);

const Step3Academic = ({ formData, updateForm }) => (
  <div className="space-y-6 sm:space-y-8 animate-fade-in text-[#0D1B2A] mt-2 sm:mt-6 px-1 pb-4 relative z-30">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
      <PremiumFloatingInput 
        label="Institution"
        value={formData.institution}
        onChange={(e) => updateForm('institution', e.target.value)}
        placeholder="e.g. Stanford University"
      />
      <PremiumFloatingInput 
        label="Course / Major"
        value={formData.course}
        onChange={(e) => updateForm('course', e.target.value)}
        placeholder="e.g. Computer Science"
      />
    </div>
    
    <div className="w-full">
      <PremiumSlider 
        min={1} 
        max={8} 
        value={formData.semester} 
        onChange={(e) => updateForm('semester', parseInt(e.target.value))} 
      />
    </div>

    <div className="w-full">
      <PremiumFloatingInput 
        label="Student ID (Optional)"
        value={formData.studentId}
        onChange={(e) => updateForm('studentId', e.target.value)}
        placeholder="e.g. 190422X"
      />
    </div>
  </div>
);

const Step4Lifestyle = ({ formData, updateForm }) => {
  const togglePill = (key, val) => {
    updateForm(key, val);
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#0D1B2A]">
      <div>
        <label className="block text-sm font-semibold mb-2 opacity-80">Average Sleep (Hours/Night): <span className="font-bold text-[#F5A623]">{formData.sleep || 7}h</span></label>
        <input type="range" min="3" max="12" value={formData.sleep || 7} onChange={e => updateForm('sleep', e.target.value)} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#F5A623]" />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-3 opacity-80">Activity Level</label>
        <div className="flex flex-wrap gap-3">
          {['Sedentary', 'Light', 'Active', 'Athlete'].map(level => (
            <button key={level} onClick={() => togglePill('activity', level)} className={`px-5 py-2.5 rounded-full font-bold transition-all text-sm cursor-pointer ${formData.activity === level ? 'bg-[#0D1B2A] text-[#F5A623]' : 'bg-[#EFF3F8] text-[#0D1B2A] hover:bg-gray-200'}`}>{level}</button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-3 opacity-80">Social Interaction</label>
        <div className="flex flex-wrap gap-3">
          {['Introvert', 'Ambivert', 'Extrovert'].map(si => (
            <button key={si} onClick={() => togglePill('social', si)} className={`px-5 py-2.5 rounded-full font-bold transition-all text-sm cursor-pointer ${formData.social === si ? 'bg-[#0D1B2A] text-[#F5A623]' : 'bg-[#EFF3F8] text-[#0D1B2A] hover:bg-gray-200'}`}>{si}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Step5Baseline = ({ formData, updateForm }) => {
  const questions = [
    { id: 'q1', text: "Over the last week, how often did you feel overwhelmed?" },
    { id: 'q2', text: "How would you rate your general mood?" },
    { id: 'q3', text: "How easily do you can you concentrate on tasks?" }
  ];

  const handleRating = (qid, rating) => {
    updateForm('baselineRatings', { ...formData.baselineRatings, [qid]: rating });
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#0D1B2A]">
      <p className="opacity-70 text-sm mb-6">Rate the following from 1 (Negative) to 5 (Positive). This helps us tailor the experience.</p>
      {questions.map(q => {
        const val = formData.baselineRatings?.[q.id] || 3;
        const emojis = ['😔', '😟', '😐', '🙂', '😊'];
        return (
          <div key={q.id} className="p-5 bg-[#EFF3F8] rounded-[16px]">
            <label className="block text-[15px] font-bold mb-4">{q.text}</label>
            <div className="flex justify-between items-center px-2">
              {emojis.map((emoji, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRating(q.id, idx + 1)}
                  className={`text-3xl transition-transform cursor-pointer ${val === idx + 1 ? 'scale-125 filter drop-shadow-md' : 'opacity-40 hover:opacity-100 hover:scale-110'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Step6Screening = ({ formData, updateForm }) => {
  const qns = [
    { id: 's1', text: "Have you experienced prolonged periods of low energy recently?" },
    { id: 's2', text: "Do you often feel anxious about exams or assignments?" },
    { id: 's3', text: "Have you noticed changes in your appetite or sleep?" },
    { id: 's4', text: "Do you struggle to detach from academic pressure?" },
    { id: 's5', text: "Would you benefit from talking to someone right now?" }
  ];

  const getS = (id) => formData.screening?.[id];
  const setS = (id, val) => updateForm('screening', { ...formData.screening, [id]: val });

  const yesCount = Object.values(formData.screening || {}).filter(Boolean).length;

  return (
    <div className="space-y-6 animate-fade-in text-[#0D1B2A]">
      <div className="space-y-4">
        {qns.map(q => (
          <div key={q.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-[16px] hover:shadow-sm">
            <span className="font-semibold text-[15px] w-3/4">{q.text}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setS(q.id, true)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold cursor-pointer transition-colors ${getS(q.id) === true ? 'bg-[#0D1B2A] text-white' : 'bg-gray-100 text-[#0D1B2A] hover:bg-gray-200'}`}
              >Yes</button>
              <button
                onClick={() => setS(q.id, false)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold cursor-pointer transition-colors ${getS(q.id) === false ? 'bg-[#0D1B2A] text-white' : 'bg-gray-100 text-[#0D1B2A] hover:bg-gray-200'}`}
              >No</button>
            </div>
          </div>
        ))}
      </div>

      {yesCount >= 3 && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-[16px] animate-fade-in-up mt-6 flex items-start gap-4">
          <div className="text-2xl mt-1">🧡</div>
          <p className="text-sm font-medium text-orange-900 leading-relaxed">
            We gently recommend keeping an eye on these feelings. Once you are inside Mind Sky, your guide can help connect you with professional campus counselors privately.
          </p>
        </div>
      )}
    </div>
  );
};

const Step7Goals = ({ formData, updateForm }) => {
  const goals = ["Better sleep", "Reduced anxiety", "Improved focus", "Time management", "Self-discovery", "Academic success", "More energy", "Mindfulness"];

  const toggleGoal = (g) => {
    const list = formData.goals || [];
    if (list.includes(g)) {
      updateForm('goals', list.filter(item => item !== g));
    } else {
      updateForm('goals', [...list, g]);
    }
  };

  return (
    <div className="animate-fade-in text-[#0D1B2A]">
      <p className="mb-6 opacity-70 font-semibold">Select all that apply to shape your path.</p>
      <div className="flex flex-wrap gap-3">
        {goals.map(g => {
          const active = (formData.goals || []).includes(g);
          return (
            <button
              key={g}
              onClick={() => toggleGoal(g)}
              className={`px-5 py-3 rounded-full font-bold text-sm cursor-pointer transition-all border ${active ? 'bg-[#0D1B2A] text-[#F5A623] border-[#0D1B2A] shadow-md' : 'bg-[#EFF3F8] text-[#0D1B2A] border-transparent hover:border-[#0D1B2A]/30'}`}
            >
              {g}
            </button>
          )
        })}
      </div>
    </div>
  );
};

const Step8Consent = ({ formData, updateForm }) => {
  const toggleC = (id) => updateForm(id, !formData[id]);
  return (
    <div className="space-y-5 animate-fade-in text-[#0D1B2A]">
      <p className="opacity-70 text-sm mb-4">Just a few checkboxes to ensure your security & privacy.</p>

      {[
        { id: 'consent1', lbl: "I agree to the Terms of Service and Privacy Policy." },
        { id: 'consent2', lbl: "I consent to Mind Sky securely storing my wellness baseline data locally to personalize my experience without sending it to third parties." },
        { id: 'consent3', lbl: "I understand Mind Sky is a supportive tool, not a replacement for professional psychological or medical intervention." },
        { id: 'consent4', lbl: "I am aged 16 or above." },
      ].map(c => (
        <label key={c.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-[16px] cursor-pointer hover:bg-[#EFF3F8] transition-colors group">
          <div className="flex-shrink-0">
            <input type="checkbox" checked={formData[c.id] || false} onChange={() => toggleC(c.id)} className="rounded border-[#0D1B2A] text-[#0D1B2A] focus:ring-[#0D1B2A] accent-[#F5A623] cursor-pointer" style={{ width: '20px', height: '20px', minWidth: '20px', minHeight: '20px' }} />
          </div>
          <span className="text-sm font-semibold opacity-80 group-hover:opacity-100 leading-snug">{c.lbl} <span className="text-red-500">*</span></span>
        </label>
      ))}

      <label className="flex items-center gap-4 p-4 border border-gray-100 rounded-[16px] cursor-pointer hover:bg-[#EFF3F8] transition-colors group">
        <div className="flex-shrink-0">
          <input type="checkbox" checked={formData.consent5 || false} onChange={() => toggleC('consent5')} className="rounded border-[#0D1B2A] text-[#0D1B2A] focus:ring-[#0D1B2A] accent-[#F5A623] cursor-pointer" style={{ width: '20px', height: '20px', minWidth: '20px', minHeight: '20px' }} />
        </div>
        <span className="text-sm font-semibold opacity-80 group-hover:opacity-100 leading-snug">Optional: Send me rare, positive affirmations to my email inbox once a week.</span>
      </label>
    </div>
  );
};


// ==========================================
// COMPLETION SCREEN
// ==========================================
const CompletionScreen = ({ formData, onFinish }) => {
  const selectedGuide = guides.find(g => g.id === formData.selectedGuide) || guides[0];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFinish = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      setLoading(false);
      if (res.ok || res.status === 201) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (onFinish) onFinish();
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen font-sans overflow-hidden relative fade-in bg-gradient-to-b from-[#E0F2FE] via-[#BAE6FD] to-[#38BDF8]">

      <Logo withGlass lightText={false} className="absolute top-8 left-8" />

      {/* Simple inline CSS confetti simulation using absolute pseudo-dots (or just emojis falling for a fun effect) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50 flex justify-around">
        {['✨', '🎉', '🌟', '🎊', '✨'].map((emoji, i) => (
          <div key={i} className="animate-fade-in-up text-4xl mt-10" style={{ animationDelay: `${i * 200}ms` }}>{emoji}</div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-8 group animate-fade-in-up">
          <div className="absolute inset-0 bg-white blur-[80px] opacity-60 rounded-full animate-pulse"></div>
          <div className="w-64 h-64 bg-white/40 border border-white/60 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.6)] relative z-10 transition-transform duration-700 hover:scale-110 overflow-hidden p-8 backdrop-blur-md">
            <img src={selectedGuide.image} alt={selectedGuide.name} className="w-full h-full object-contain pointer-events-none drop-shadow-xl" />
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-serif font-bold text-[#0D1B2A] mb-6 animate-fade-in-up animation-delay-300 text-center px-4">
          You're all set, <span className="text-[#0284C7]">{formData.fullName || 'friend'}</span>!
        </h1>

        <p className="text-xl text-[#0D1B2A]/80 mb-8 animate-fade-in-up animation-delay-450 text-center px-4 max-w-md font-medium">
          {selectedGuide.name} is ready to guide your journey. Let's create your account.
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-700 px-6 py-3 rounded-xl mb-6 text-sm max-w-md text-center animate-fade-in">
            {error}
          </div>
        )}

        <button
          onClick={handleFinish}
          disabled={loading}
          className="px-12 py-5 rounded-full font-bold text-lg bg-[#0D1B2A] text-white hover:bg-[#0D1B2A]/90 transition-all duration-300 shadow-[0_10px_30px_rgba(13,27,42,0.3)] hover:-translate-y-1 hover:scale-105 active:scale-95 animate-fade-in-up animation-delay-600 cursor-pointer disabled:opacity-70 disabled:hover:scale-100 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : (
            <>Enter Mind Sky <FiArrowLeft className="rotate-180 inline-block ml-2" /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default OnboardingFlow;
