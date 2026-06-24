/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, loading, error: authError } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [residence, setResidence] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode !== '123456') {
      setError('Invalid code. Please try 123456.');
      return;
    }
    navigate('/vehicles');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!phone || !password) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      let result;
      if (isLogin) {
        result = await signIn(phone, password);
      } else {
        if (!name) {
          setError('Please provide your name');
          return;
        }
        result = await signUp(phone, password, name, email, residence);
      }
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      if (isLogin && localStorage.getItem('2fa_enabled') === 'true') {
        setShow2FA(true);
        return;
      }
      
      navigate('/vehicles');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-body-md bg-[#f8f9ff]">
      {/* TopNavBar */}
      <header className="w-full top-0 sticky bg-surface dark:bg-on-surface border-b border-outline-variant dark:border-outline z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex justify-between items-center h-20">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-primary p-1.5 rounded-lg">
              <span className="material-symbols-outlined text-white text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
            </div>
            <span className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">Welile Car</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors" href="#">Buy</a>
            <a className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors" href="#">Sell</a>
            <a className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors" href="#">Finance</a>
            <a className="font-label-md text-label-md text-on-surface-variant dark:text-surface-variant hover:text-primary transition-colors" href="#">Support</a>
          </nav>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsLogin(true)} className="font-label-md text-label-md text-primary px-4 py-2 hover:bg-surface-container-low transition-colors rounded-lg cursor-pointer">Sign In</button>
            <button onClick={() => setIsLogin(false)} className="font-label-md text-label-md bg-primary text-on-primary px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer">Register</button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="max-w-6xl w-full bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] flex flex-col md:flex-row min-h-[700px] border border-outline-variant">
          {/* Left Side: Hero Image & Value Prop */}
          <div className="md:w-1/2 relative min-h-[400px] md:min-h-full overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC1DmtbA_3scJICx2_GITfuKrBDE7jm0bVFt-e019I-Yrf5_FTpVbgaYjnpjs5TglmxVKGBWWWxB5xBp01hYq0VfRa4ai8hpNlmOsBlzKGlAAn3xl8ZE9iD9eyvqLZWrwlMdtB4LrC4-yZrr5achd_MymvAkvMG2R0DzIYdydtPbUkX5sLtcnhAhDfKC6bcAbg_5bhvBwnjCWu4CUFtkW4A45OmEaRE5S-TJQ5ZDdPrL_AKhP6HEP1Ri6sdYomlDEEj89Z9lj9NxkU')" }}
            />
            <div className="absolute inset-0 flex flex-col justify-end p-12 text-white" style={{ background: 'linear-gradient(180deg, rgba(52, 0, 104, 0.4) 0%, rgba(52, 0, 104, 0.8) 100%)' }}>
              <div className="mb-8 bg-white/20 backdrop-blur-md w-12 h-12 flex items-center justify-center rounded-xl">
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>assured_workload</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg mb-4 leading-tight">Premium Automotive Financing</h1>
              <p className="font-body-lg text-body-lg opacity-90 max-w-md">Experience seamless digital approvals and exclusive rates tailored to your lifestyle. Secure your dream vehicle today.</p>
              <div className="mt-12 flex items-center gap-3">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-slate-200">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIamRwQgh-I-lWjcczJRtgadYG2xFW4u8PlsN73ouLecN2V59ggOx7ecHUtHD75BXG176mBl-OZriEb3cJDwa8jugqmVO9UclvtT1tXzfHJn4r1BdrmkgYnEnA8YRqnPlPRaPIaTA5wZNtWSlW2aaxnhGsXTTVebpb-fRATpoyvGFOe4y0R4P6oL5pEJcgIothRcd7aY0qWGNBRh2j004gKjeWfgfWEDjCfKxbsKunutIYw1QffpmXCXpvxQEOnO9hg9M1onRei8M" alt="User 1"/>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-slate-200">
                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBf9fnLi6l4Elbxoh2mPF83oFDjScDCJaUEeTUTaDP3N4DtCuAiV9CIxBnI2yjSrBSYDwpNgFnmwtLtonyO-wqlhVkRIfXvdSavTGmRcZrYFHoOQZDPCztW-2mZ9BpYWQeZM_HWmsUjm_8Fcdh15MdEJWLMjbRCusGGXzuIqR92rLXXS7i7iI9gJSCI9F-bNkHgXE6sm_h6YwK7DxjdSo5b14GCDSVaQ-tS6H8Khx6ycpivmyqJP7j99VZPwF0GrPtPx7cYVkoKfKo" alt="User 2"/>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-primary flex items-center justify-center text-[10px] font-bold">
                    +2k
                  </div>
                </div>
                <span className="font-label-sm text-label-sm">Joined this month</span>
              </div>
            </div>
          </div>
          
          {/* Right Side: Auth Form */}
          <div className="md:w-1/2 flex flex-col bg-surface-container-lowest">
            {/* Tabs */}
            <div className="flex border-b border-outline-variant">
              <button 
                onClick={() => setIsLogin(true)} 
                className={`flex-1 py-6 font-label-md text-label-md transition-all ${isLogin ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setIsLogin(false)} 
                className={`flex-1 py-6 font-label-md text-label-md transition-all ${!isLogin ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'}`}
              >
                Sign Up
              </button>
            </div>
            
            {/* Form Content */}
            <div className="flex-grow p-8 md:p-16 flex flex-col justify-center">
              <div className="mb-10">
                <h2 className="font-headline-md text-headline-md text-on-surface mb-2">{show2FA ? 'Two-Factor Authentication' : (isLogin ? 'Welcome Back' : 'Create Account')}</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">{show2FA ? 'Enter the 6-digit code sent to your phone.' : (isLogin ? 'Securely access your personalized automotive portal.' : 'Start your journey to premium car ownership.')}</p>
              </div>
              
              {show2FA ? (
                <form onSubmit={handle2FASubmit} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="font-label-sm text-label-sm text-on-surface-variant px-1">Verification Code</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">pin</span>
                      <input 
                        className="w-full pl-12 pr-4 py-3.5 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-mono text-xl tracking-[0.5em]" 
                        placeholder="------" 
                        type="text"
                        maxLength={6}
                        value={twoFactorCode}
                        onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant text-center">Hint: For testing, use code <strong className="text-primary">123456</strong></p>
                  
                  {(error) && (
                    <p className="text-error text-sm font-bold text-center bg-error-container/50 p-2 rounded-md">
                      {error}
                    </p>
                  )}
                  
                  <button 
                    className="w-full bg-primary text-on-primary py-4 rounded-lg font-headline-sm text-headline-sm hover:opacity-95 active:scale-[0.98] transition-all shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] mt-4" 
                    type="submit"
                  >
                    Verify & Sign In
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShow2FA(false);
                      setError(null);
                    }}
                    className="w-full text-primary font-bold text-label-md py-2 mt-2 hover:bg-surface-container rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {!isLogin && (
                    <>
                      <div className="space-y-1.5">
                        <label className="font-label-sm text-label-sm text-on-surface-variant px-1">Full Name</label>
                        <div className="relative group">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">person</span>
                          <input 
                            className="w-full pl-12 pr-4 py-3.5 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-body-md" 
                            placeholder="e.g. John Doe" 
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-label-sm text-label-sm text-on-surface-variant px-1">Residence</label>
                        <div className="relative group">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">location_on</span>
                          <input 
                            className="w-full pl-12 pr-4 py-3.5 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-body-md" 
                            placeholder="e.g. Kampala, Uganda" 
                            type="text"
                            value={residence}
                            onChange={e => setResidence(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-label-sm text-label-sm text-on-surface-variant px-1">Email Address</label>
                        <div className="relative group">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">mail</span>
                          <input 
                            className="w-full pl-12 pr-4 py-3.5 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-body-md" 
                            placeholder="e.g. john@example.com" 
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-1.5">
                    <label className="font-label-sm text-label-sm text-on-surface-variant px-1">Phone Number</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">call</span>
                      <input 
                        className="w-full pl-12 pr-4 py-3.5 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-body-md" 
                        placeholder="e.g. +256 700 000000" 
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="font-label-sm text-label-sm text-on-surface-variant px-1">Password</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                      <input 
                        className="w-full pl-12 pr-12 py-3.5 bg-surface border border-outline-variant rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-body-md" 
                        placeholder="••••••••" 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                      <button 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors cursor-pointer" 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
                      </button>
                    </div>
                  </div>
                  
                  {isLogin && (
                    <div className="flex justify-end">
                      <a className="font-label-sm text-label-sm text-primary hover:underline" href="#">Forgot Password?</a>
                    </div>
                  )}

                  {(error || authError) && (
                    <p className="text-error text-sm font-bold text-center bg-error-container/50 p-2 rounded-md">
                      {error || authError}
                    </p>
                  )}
                  
                  <button 
                    className="w-full bg-primary text-on-primary py-4 rounded-lg font-headline-sm text-headline-sm hover:opacity-95 active:scale-[0.98] transition-all shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.05)] mt-4 disabled:opacity-50" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
                  </button>
                </form>
              )}
            </div>
            
            {/* Social Login */}
            <div className="mt-8 text-center pb-8 px-8">
              <div className="relative flex items-center gap-4 mb-6">
                <div className="flex-grow h-px bg-outline-variant"></div>
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest text-[10px]">or continue with</span>
                <div className="flex-grow h-px bg-outline-variant"></div>
              </div>
              <div className="flex justify-center gap-6">
                <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-low hover:border-primary transition-all">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                </button>
                <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-low hover:border-primary transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"></path>
                  </svg>
                </button>
                <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-low hover:border-primary transition-all">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.96.95-2.06 1.11-3.13 1.11-1.07 0-2.17-.16-3.13-1.11-.96-.95-1.13-2.07-1.13-3.16 0-1.09.17-2.21 1.13-3.16.96-.95 2.06-1.11 3.13-1.11 1.07 0 2.17.16 3.13 1.11.96.95 1.13 2.07 1.13 3.16 0 1.09-.17 2.21-1.13 3.16zM12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-8 text-center bg-surface-container-low border-t border-outline-variant mt-auto">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span className="text-primary font-bold hover:underline cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? "Register Now" : "Sign In"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full mt-auto bg-surface-container-low dark:bg-inverse-surface border-t border-outline-variant">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface dark:text-inverse-on-surface">Welile Car</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a className="font-label-sm text-label-sm text-on-surface-variant dark:text-surface-variant hover:text-primary hover:underline transition-all" href="#">Privacy Policy</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant dark:text-surface-variant hover:text-primary hover:underline transition-all" href="#">Terms of Service</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant dark:text-surface-variant hover:text-primary hover:underline transition-all" href="#">Cookie Settings</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant dark:text-surface-variant hover:text-primary hover:underline transition-all" href="#">Contact Us</a>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-surface-variant">© 2026 Welile Cars. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
