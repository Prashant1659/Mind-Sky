import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LoginPage from './components/LoginPage';
import OnboardingFlow from './components/OnboardingFlow';
import Dashboard from './components/Dashboard';

function App() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    return localStorage.getItem('token') ? 'dashboard' : 'home';
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentRoute('home');
  };

  if (currentRoute === 'dashboard') {
    return <Dashboard onLogout={handleLogout} />;
  }

  if (currentRoute === 'login') {
    return <LoginPage onBack={() => setCurrentRoute('home')} onSignUp={() => setCurrentRoute('onboarding')} onLoginSuccess={() => setCurrentRoute('dashboard')} />;
  }
  
  if (currentRoute === 'onboarding') {
    return <OnboardingFlow onBack={() => setCurrentRoute('home')} onComplete={() => setCurrentRoute('dashboard')} />;
  }

  return (
    <div className="bg-white min-h-screen w-full relative overflow-hidden flex flex-col">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">

        {/* Main left split shape with sky radial gradient */}
        <div
          className="absolute top-[-30%] left-[-20%] w-[80%] md:w-[60%] h-[160%] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] opacity-90 transition-transform duration-1000 ease-in-out"
          style={{ backgroundImage: 'radial-gradient(ellipse at 60% 40%, #BAE6FD 0%, #0369A1 100%)' }}
        ></div>

        {/* Golden Sun Glow behind the illustration */}
        <div className="absolute top-[10%] md:top-[20%] left-[5%] md:left-[10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-[radial-gradient(circle,_rgba(245,166,35,0.25)_0%,_transparent_60%)] rounded-full z-0 mix-blend-multiply"></div>

      </div>

      {/* Content container */}
      <div className="relative z-10 flex flex-col flex-1 h-full max-w-[1600px] mx-auto w-full pt-4 md:pt-6">
        <Navbar onLoginClick={() => setCurrentRoute('login')} onSignUpClick={() => setCurrentRoute('onboarding')} />
        <Hero onGuestLoginSuccess={() => setCurrentRoute('dashboard')} />
      </div>
    </div>
  );
}

export default App;
