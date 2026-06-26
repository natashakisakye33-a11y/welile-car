import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { GoogleLogin } from '@react-oauth/google';

const GoogleAuthButton = ({ isLogin }: { isLogin: boolean }) => {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      const { error } = await signInWithGoogle(credentialResponse.credential);
      if (error) {
        toast.error(error);
      } else {
        toast.success(`Successfully signed ${isLogin ? 'in' : 'up'} with Google!`);
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    }
  };

  return (
    <div className="w-full flex justify-center mt-2 mb-4">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => {
          toast.error('Google Sign In failed');
        }}
        useOneTap
        shape="pill"
        width="100%"
        text={isLogin ? 'signin_with' : 'signup_with'}
      />
    </div>
  );
};

export const CustomSignIn = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(phone, password);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Successfully signed in!');
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <GoogleAuthButton isLogin={true} />
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">Or continue with</span>
        </div>
      </div>

      <div>
        <label className="block text-label-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number or Email</label>
        <input 
          type="text" 
          value={phone} 
          onChange={e => setPhone(e.target.value)} 
          required 
          placeholder="+256 700 000000 or email@domain.com"
          className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-body-md text-slate-900 dark:text-slate-100 transition-all shadow-sm"
        />
      </div>
      <div>
        <label className="block text-label-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
          placeholder="••••••••"
          className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-body-md text-slate-900 dark:text-slate-100 transition-all shadow-sm"
        />
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className="w-full h-12 mt-4 bg-primary hover:bg-primary/90 text-white font-label-lg font-bold rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-70 shadow-md hover:shadow-lg hover:-translate-y-0.5"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
};

export const CustomSignUp = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [residence, setResidence] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(phone, password, name, email, residence);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Account created successfully!');
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <GoogleAuthButton isLogin={false} />
      
      <div className="relative mb-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">Or register manually</span>
        </div>
      </div>

      <div>
        <label className="block text-label-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
        <input 
          type="text" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          required 
          placeholder="Joshua Wanda"
          className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-body-md text-slate-900 dark:text-slate-100 transition-all shadow-sm"
        />
      </div>
      <div>
        <label className="block text-label-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          placeholder="joshua@example.com"
          className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-body-md text-slate-900 dark:text-slate-100 transition-all shadow-sm"
        />
      </div>
      <div>
        <label className="block text-label-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
        <input 
          type="tel" 
          value={phone} 
          onChange={e => setPhone(e.target.value)} 
          required 
          placeholder="+256 700 000000"
          className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-body-md text-slate-900 dark:text-slate-100 transition-all shadow-sm"
        />
      </div>
      <div>
        <label className="block text-label-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Residence</label>
        <input 
          type="text" 
          value={residence} 
          onChange={e => setResidence(e.target.value)} 
          required 
          placeholder="Kampala, Uganda"
          className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-body-md text-slate-900 dark:text-slate-100 transition-all shadow-sm"
        />
      </div>
      <div>
        <label className="block text-label-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
          placeholder="••••••••"
          className="w-full h-12 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-body-md text-slate-900 dark:text-slate-100 transition-all shadow-sm"
        />
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className="w-full h-12 mt-4 bg-primary hover:bg-primary/90 text-white font-label-lg font-bold rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-70 shadow-md hover:shadow-lg hover:-translate-y-0.5"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
};

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

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
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800&auto=format&fit=crop')" }}
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
          
          {/* Right Side: Custom Auth Component */}
          <div className="md:w-1/2 flex flex-col bg-surface-container-lowest justify-center items-center py-12 px-6">
            <div className="w-full max-w-[360px] flex flex-col justify-center">
              <h2 className="text-headline-md font-bold text-on-surface mb-2">{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
              <p className="text-body-md text-on-surface-variant mb-8">{isLogin ? 'Sign in to access your dashboard' : 'Join Welile Cars to start financing'}</p>
              
              {isLogin ? <CustomSignIn /> : <CustomSignUp />}
            </div>
            
            {/* Custom Toggle */}
            <div className="mt-8 text-center text-sm text-on-surface-variant">
              {isLogin ? (
                <p>Want to register instead? <button onClick={() => setIsLogin(false)} className="text-primary font-bold hover:underline transition-colors">Click here to Sign up</button></p>
              ) : (
                <p>Already have an account? <button onClick={() => setIsLogin(true)} className="text-primary font-bold hover:underline transition-colors">Click here to Sign in</button></p>
              )}
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
