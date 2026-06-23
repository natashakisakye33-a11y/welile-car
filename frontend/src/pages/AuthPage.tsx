/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Car } from 'lucide-react';

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
    <div className="min-h-screen bg-surface font-body-md text-on-surface selection:bg-primary-fixed selection:text-primary">
      {/* TopAppBar Shell */}
      <header className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-xl shadow-sm border-b border-outline-variant/30 transition-all">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">directions_car</span>
            </div>
            <span className="font-chewy text-3xl text-primary tracking-wide">Welile Car</span>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 items-center">
            <a href="#" className="text-on-surface-variant font-medium hover:text-primary-container transition-colors font-label-md">Buy</a>
            <a href="#" className="text-on-surface-variant font-medium hover:text-primary-container transition-colors font-label-md">Sell</a>
            <a href="#" className="text-on-surface-variant font-medium hover:text-primary-container transition-colors font-label-md">Finance</a>
            <a href="#" className="text-on-surface-variant font-medium hover:text-primary-container transition-colors font-label-md">Support</a>
          </nav>
          
          {/* Removed mobile menu */}
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 pt-24 md:pt-28 pb-12">
        <div className="bg-surface rounded-3xl shadow-[0px_12px_40px_rgba(0,0,0,0.06)] w-full max-w-[1000px] flex flex-col md:flex-row overflow-hidden border border-outline-variant/50 relative z-10">
          
          {/* Left Hero Side (Desktop Only) */}
          <div className="hidden md:flex md:w-1/2 bg-surface-variant relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/20 to-surface-variant/40 mix-blend-multiply z-10"></div>
            
            {/* Abstract Shapes */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
            <div className="absolute top-40 -right-20 w-80 h-80 bg-secondary-container/30 rounded-full blur-[100px]"></div>
            
            <img 
              src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80" 
              alt="Luxury Car Interior" 
              className="w-full h-full object-cover grayscale-[30%] contrast-[1.1] opacity-90 mix-blend-overlay absolute inset-0"
            />
            
            <div className="relative z-20 p-12 flex flex-col justify-between h-full w-full bg-gradient-to-t from-inverse-surface/80 via-inverse-surface/20 to-transparent">
              <div>
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20 shadow-lg">
                  <span className="material-symbols-outlined text-white text-[28px]">directions_car</span>
                </div>
                <h2 className="text-white font-headline-lg text-headline-lg mb-4 leading-tight">
                  Premium Automotive <br/> Financing
                </h2>
                <p className="text-inverse-on-surface/90 text-body-lg font-body-lg max-w-sm">
                  Experience seamless digital approvals and exclusive rates tailored to your lifestyle.
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-surface-container border-2 border-surface"></div>
                  <div className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-surface"></div>
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center border-2 border-surface text-white text-xs font-bold">+2k</div>
                </div>
                <p className="text-white text-label-sm font-label-sm font-medium">Joined this month</p>
              </div>
            </div>
          </div>

          {/* Right Form Side */}
          <div className="w-full md:w-1/2 flex flex-col relative bg-surface">
            
            {/* Top Tabs */}
            <div className="flex w-full border-b border-outline-variant/30 pt-2 px-8">
              <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-4 text-center font-bold font-label-md transition-all border-b-2 ${
                  isLogin 
                    ? 'text-primary border-primary' 
                    : 'text-on-surface-variant border-transparent hover:bg-surface-container-lowest'
                }`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-4 text-center font-bold font-label-md transition-all border-b-2 ${
                  !isLogin 
                    ? 'text-primary border-primary' 
                    : 'text-on-surface-variant border-transparent hover:bg-surface-container-lowest'
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="p-8 md:p-12 flex-grow flex flex-col justify-center">
              {/* Header */}
              <div className="mb-8">
                <h1 className="font-headline-lg-mobile md:font-headline-lg text-[28px] text-primary mb-2">
                  {show2FA ? 'Two-Factor Authentication' : (isLogin ? 'Welcome Back' : 'Create an account')}
                </h1>
                <p className="text-on-surface-variant font-body-md">
                  {show2FA ? 'Enter the 6-digit code sent to your phone.' : (isLogin ? 'Securely access your personalized automotive portal.' : 'Start your journey to car ownership today.')}
                </p>
              </div>

            {show2FA ? (
              <form onSubmit={handle2FASubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="relative border-b-2 border-outline-variant focus-within:border-primary transition-all group">
                  <div className="flex items-center gap-3 py-2">
                    <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">pin</span>
                    <input 
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-on-surface placeholder:text-outline-variant font-body-md outline-none tracking-[0.5em] font-mono text-xl" 
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
                  className="w-full bg-primary-container text-white py-4 rounded-xl font-bold text-body-lg shadow-lg hover:shadow-primary-container/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4" 
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
              <form onSubmit={handleSubmit} className="space-y-6 transition-all duration-300">
                {!isLogin && (
                  <>
                    <div className="relative border-b-2 border-outline-variant focus-within:border-primary transition-all group">
                      <div className="flex items-center gap-3 py-2">
                        <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">person</span>
                        <input 
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-on-surface placeholder:text-outline-variant font-body-md outline-none" 
                          placeholder="Full Name" 
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="relative border-b-2 border-outline-variant focus-within:border-primary transition-all group">
                      <div className="flex items-center gap-3 py-2">
                        <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">location_on</span>
                        <input 
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-on-surface placeholder:text-outline-variant font-body-md outline-none" 
                          placeholder="Residence" 
                          type="text"
                          value={residence}
                          onChange={e => setResidence(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="relative border-b-2 border-outline-variant focus-within:border-primary transition-all group">
                      <div className="flex items-center gap-3 py-2">
                        <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">mail</span>
                        <input 
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-on-surface placeholder:text-outline-variant font-body-md outline-none" 
                          placeholder="Email Address (Optional)" 
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="relative border-b-2 border-outline-variant focus-within:border-primary transition-all group">
                  <div className="flex items-center gap-3 py-2">
                    <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">call</span>
                    <input 
                      className="w-full bg-transparent border-none focus:ring-0 p-0 text-on-surface placeholder:text-outline-variant font-body-md outline-none" 
                      placeholder="Phone Number" 
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="relative border-b-2 border-outline-variant focus-within:border-primary transition-all group">
                  <div className="flex items-center justify-between gap-3 py-2">
                    <div className="flex items-center gap-3 w-full">
                      <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">lock</span>
                      <input 
                        className="w-full bg-transparent border-none focus:ring-0 p-0 text-on-surface placeholder:text-outline-variant font-body-md outline-none" 
                        placeholder="Password" 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                      />
                    </div>
                    <span 
                      className="material-symbols-outlined text-outline cursor-pointer hover:text-primary transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </div>
                </div>

                {isLogin && (
                  <div className="flex justify-end">
                    <a className="text-primary font-bold text-label-md hover:underline" href="#">Forgot Password?</a>
                  </div>
                )}

                {(error || authError) && (
                  <p className="text-error text-sm font-bold text-center bg-error-container/50 p-2 rounded-md">
                    {error || authError}
                  </p>
                )}

                <button 
                  className="w-full bg-primary-container text-white py-4 rounded-xl font-bold text-body-lg shadow-lg hover:shadow-primary-container/20 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 disabled:opacity-50 disabled:hover:scale-100" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
                </button>
              </form>
            )}
            </div>

            {/* Social Login Section */}
            <div className="p-8 bg-surface-container-low/50 border-t border-outline-variant/10 text-center rounded-br-3xl md:rounded-bl-none rounded-bl-3xl">
              <p className="text-label-md text-on-surface-variant mb-4 uppercase tracking-widest font-semibold text-xs">Or continue with</p>
              <div className="flex justify-center gap-4">
                <button className="p-3 bg-white rounded-full border border-outline-variant/30 hover:border-primary/50 transition-all shadow-sm hover:-translate-y-1">
                  <img alt="Google" className="w-6 h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0kbTo4OFWdzf6hLh25OgrYMywaiqZ4C81omnWRel688SUO-KH2tJ9tvpmskl9ZaqAlJ7Mk9s6iVB1PX8zCrkVAHergenB4jd4xDLQ8TIyrUfeZ4S1MPAh6XM0U1UtWTXwxW0gS5q6sLg6G4nPAAGsN1yEtrVaeeXM3PmEhK9CmVSEbpnTSHDbM6t31NE8hE2rpvVZnC4rX38IpxiTPBHjRkBPOtPVRDdiS6uSHFzsyGb5s7mV5rPDOli61iT_qems_H-F5r97QYfi"/>
                </button>
                <button className="p-3 bg-white rounded-full border border-outline-variant/30 hover:border-primary/50 transition-all shadow-sm flex items-center justify-center hover:-translate-y-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.093 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.294h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.093 24 12.073z"/>
                  </svg>
                </button>
                <button className="p-3 bg-white rounded-full border border-outline-variant/30 hover:border-primary/50 transition-all shadow-sm flex items-center justify-center hover:-translate-y-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.92 19.38c-.89.87-1.87.73-2.8-.32-.99-.42-1.9-.44-2.95 0-1.31.56-2 .4-2.78-.32-3.13-2.68-2.48-9.67 2.68-9.92 1.23.04 2.3.62 2.86.62.59 0 1.84-.68 3.32-.57 1.36.05 2.51.56 3.2 1.48-2.68 1.54-2.23 5.03.46 6.07-.64 1.6-1.43 3.15-2.57 4.2zm-1.84-16.5c-.55.69-1.35 1.14-2.21 1.11-.15-.96.3-1.89.88-2.48.55-.67 1.4-.14 2.23-.14.12.95-.3 1.85-.9 2.51z"/>
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-4 md:px-8 py-8 mt-12 flex flex-col md:flex-row justify-between items-center max-w-[1280px] mx-auto border-t border-outline-variant/50 bg-surface">
        <div className="flex flex-col items-center md:items-start gap-4 mb-8 md:mb-0">
          <span className="font-chewy text-3xl text-primary mb-2">Welile Car</span>
          <p className="text-on-surface-variant font-body-md max-w-xs text-center md:text-left">© 2026 Welile Cars. Premium Automotive Finance. All Rights Reserved.</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-12 md:gap-16">
          <div className="flex flex-col gap-3">
            <span className="font-bold text-primary mb-2 font-label-md tracking-wider uppercase text-sm">Legal</span>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors font-body-md">Privacy Policy</a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors font-body-md">Terms of Service</a>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-bold text-primary mb-2 font-label-md tracking-wider uppercase text-sm">Company</span>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors font-body-md">Security</a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors font-body-md">Cookie Settings</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
