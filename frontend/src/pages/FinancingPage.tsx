 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, useRequestFinancing } from '@/hooks/useProfile';
import { carsData } from '@/data/cars';
import { motion, AnimatePresence } from 'framer-motion';
import { PageLoader } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { formatUGX } from '@/lib/format';
import BottomNav from '@/components/BottomNav';
import { useState, useEffect, useRef } from 'react';
import { fetchWithTimeout } from '@/lib/api';
import { API_URL } from '@/config';
import { 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  CreditCard,
  AlertCircle,
  ChevronRight,
  UploadCloud,
  Settings,
  Camera,
  Image as ImageIcon,
  Loader2,
  Users,
  Sparkles,
  Clock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

const FinancingPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile();
  const requestFinancing = useRequestFinancing();
  const [plan, setPlan] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Live Data State
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const { session } = useAuth();

  // Custom Deposit State
  const [customDeposit, setCustomDeposit] = useState<number>(0);

  // Upload State
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [permissionRequest, setPermissionRequest] = useState<'camera' | 'gallery' | null>(null);
  const [uploadTarget, setUploadTarget] = useState<'income' | 'kyc' | null>(null);
  const [isIncomeUploaded, setIsIncomeUploaded] = useState(false);
  const [isKycUploaded, setIsKycUploaded] = useState(false);
  const [isIncomePending, setIsIncomePending] = useState(false);
  const [isKycPending, setIsKycPending] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [isGuarantorSubmitted, setIsGuarantorSubmitted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Guarantor State
  const [showGuarantorForm, setShowGuarantorForm] = useState(false);
  const [guarantors, setGuarantors] = useState({
    g1Name: '', g1Phone: '', g1Email: '',
    g2Name: '', g2Phone: '', g2Email: ''
  });
  
  // File Picker State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        setDashboardError(null);
        const res = await fetchWithTimeout(`${API_URL}/dashboard/summary`);
        if (res.ok) {
          setDashboardData(await res.json());
        } else {
          console.warn("Failed to fetch dashboard, using preview data");
          setDashboardData({ savings: { totalSaved: 0 }, vehicle: null });
        }
      } catch (e) {
        console.error("Network error fetching dashboard, using preview data", e);
        setDashboardData({ savings: { totalSaved: 0 }, vehicle: null });
      } finally {
        setLoadingDashboard(false);
      }
    };
    fetchData();
  }, [user, session]);

  const [car, setCar] = useState<any>(null);
  const [carLoading, setCarLoading] = useState(false);

  useEffect(() => {
    if (profile?.selected_car_id) {
      setCarLoading(true);
      fetch(`${API_URL}/vehicles/${profile.selected_car_id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.id) setCar(data);
          setCarLoading(false);
        })
        .catch(err => {
          console.error(err);
          setCarLoading(false);
        });
    }
  }, [profile?.selected_car_id]);

  if (!authLoading && !user) { navigate('/'); return null; }
  if (isLoading || loadingDashboard || carLoading) {
    return <PageLoader message="Loading Application..." />;
  }

  if (dashboardError || !profile || !dashboardData) {
    return <ErrorState message={dashboardError || "Application data is unavailable."} onRetry={() => setLoadingDashboard(true)} />;
  }

  const safeCar = car || {
    id: 'preview',
    name: 'Sample Vehicle (Preview)',
    priceUgx: 15000000
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-background pb-20 flex flex-col">
        <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border/40 p-4 flex items-center justify-center">
          <h1 className="text-xl font-bold font-heading">Application Status</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center mt-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 flex flex-col items-center text-center space-y-4"
          >
            <div className="w-24 h-24 bg-success/20 text-success rounded-full flex items-center justify-center mb-4">
              <Sparkles size={48} />
            </div>
            <h2 className="text-3xl font-bold font-heading">Application Successful!</h2>
            <p className="text-muted-foreground text-lg max-w-sm">Your application for the <strong>{safeCar.name}</strong> has been finalized and approved.</p>
            <p className="text-sm mt-4 text-primary font-medium animate-pulse">Redirecting to My Vehicle...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const saved = dashboardData.savings?.totalSaved || 0;
  const minDepositTarget = safeCar.priceUgx * 0.3;
  
  // Initialize custom deposit once loaded
  if (customDeposit === 0 && minDepositTarget > 0) {
    setCustomDeposit(minDepositTarget);
  }

  const isUnlocked = saved >= minDepositTarget;
  
  // Dynamic financing math
  const actualDeposit = Math.max(customDeposit, minDepositTarget);
  const remaining = safeCar.priceUgx - actualDeposit;
  const monthlyInstallment = (remaining * 1.28) / 36;
  
  const plans = [
    { id: 'daily', label: 'Daily Payment', divisor: 30, period: '36 months' },
    { id: 'weekly', label: 'Weekly Payment', divisor: 4, period: '36 months' },
    { id: 'monthly', label: 'Monthly Payment', divisor: 1, period: '36 months' },
  ];

  const handleProceed = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      await requestFinancing.mutateAsync({
        carId: safeCar.id,
        carName: safeCar.name,
        carPrice: safeCar.priceUgx,
        requestedAmount: remaining
      });
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => navigate('/my-vehicle'), 3000);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
      alert('Application failed. Please try again later.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const hasApplied = !!dashboardData?.vehicle;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:p-8 font-sans selection:bg-primary/20 selection:text-primary">
      <div className="max-w-5xl mx-auto space-y-8 p-4 md:p-0 pt-8 md:pt-0">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Application</h1>
            <p className="text-slate-500 font-medium mt-1">Finalize your financing and unlock your vehicle.</p>
          </div>
          {isUnlocked && !hasApplied && (
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full font-bold text-sm border border-emerald-200">
              <CheckCircle2 size={16} /> Eligible for Financing
            </div>
          )}
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between text-sm font-bold relative overflow-hidden">
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full"></div>
          <div className="absolute top-1/2 left-8 h-1 bg-emerald-500 -translate-y-1/2 z-0 rounded-full transition-all duration-1000" style={{ width: hasApplied ? '100%' : (isUnlocked ? '50%' : '25%') }}></div>
          
          <div className="flex flex-col items-center gap-2 z-10 w-24">
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <CheckCircle2 size={16} />
            </div>
            <span className="text-emerald-700 text-xs text-center">Vehicle Selected</span>
          </div>
          <div className="flex flex-col items-center gap-2 z-10 w-24">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-primary text-white shadow-lg shadow-primary/30'}`}>
              {isUnlocked ? <CheckCircle2 size={16} /> : <span className="text-xs">2</span>}
            </div>
            <span className={`text-xs text-center ${isUnlocked ? "text-emerald-700" : "text-primary"}`}>Deposit Target</span>
          </div>
          <div className="flex flex-col items-center gap-2 z-10 w-24">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${((isKycPending || isKycUploaded) && (isIncomePending || isIncomeUploaded) && isGuarantorSubmitted) ? (hasApplied ? 'bg-emerald-500 text-white' : 'bg-primary text-white shadow-lg shadow-primary/30') : 'bg-slate-100 text-slate-400'}`}>
              {((isKycPending || isKycUploaded) && (isIncomePending || isIncomeUploaded) && isGuarantorSubmitted) ? (hasApplied ? <CheckCircle2 size={16} /> : <span className="text-xs">3</span>) : <span className="text-xs">3</span>}
            </div>
            <span className={`text-xs text-center ${((isKycPending || isKycUploaded) && (isIncomePending || isIncomeUploaded) && isGuarantorSubmitted) ? "text-primary" : "text-slate-400"}`}>Verification</span>
          </div>
          <div className="flex flex-col items-center gap-2 z-10 w-24">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${hasApplied ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 text-slate-400'}`}>
              {hasApplied ? <CheckCircle2 size={16} /> : <span className="text-xs">4</span>}
            </div>
            <span className={`text-xs text-center ${hasApplied ? "text-emerald-700" : "text-slate-400"}`}>Final Approval</span>
          </div>
        </div>


        {/* Pre-requisites / Eligibility (Always Visible) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-indigo-50/50 rounded-[32px] p-8 border border-indigo-100 shadow-sm">
          <h3 className="text-xl font-black text-indigo-950 mb-6 flex items-center gap-2 tracking-tight">
            <CheckCircle2 size={22} className="text-indigo-600" /> Eligibility Criteria
          </h3>
          <p className="text-sm text-indigo-900/70 font-medium mb-6">
            {hasApplied 
              ? "You have successfully met the following prerequisites for your vehicle financing:" 
              : "Before you can finalize your vehicle financing, please ensure you meet the following prerequisites:"}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${hasApplied ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {hasApplied ? <CheckCircle2 size={16} /> : <Wallet size={16} />}
              </div>
              <div>
                <p className="font-bold text-indigo-950 text-sm">30% Minimum Deposit</p>
                <p className="text-xs text-indigo-900/60 font-medium">Saved at least 30% of the vehicle's total value.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${hasApplied ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {hasApplied ? <CheckCircle2 size={16} /> : <FileText size={16} />}
              </div>
              <div>
                <p className="font-bold text-indigo-950 text-sm">Valid National ID</p>
                <p className="text-xs text-indigo-900/60 font-medium">A clear copy of your National ID for KYC.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${hasApplied ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {hasApplied ? <CheckCircle2 size={16} /> : <Users size={16} />}
              </div>
              <div>
                <p className="font-bold text-indigo-950 text-sm">Two Guarantors</p>
                <p className="text-xs text-indigo-900/60 font-medium">Contact details for two trusted individuals.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${hasApplied ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {hasApplied ? <CheckCircle2 size={16} /> : <Briefcase size={16} />}
              </div>
              <div>
                <p className="font-bold text-indigo-950 text-sm">Income Proof</p>
                <p className="text-xs text-indigo-900/60 font-medium">Bank or mobile money statements.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Company Rules to Follow (Always Visible) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}  className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm mt-8">
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2 tracking-tight">
            <ShieldCheck size={22} className="text-primary" /> Welile Cars Rules & Commitments
          </h3>
          <p className="text-sm text-slate-500 font-medium mb-6">
            Please be aware of the following terms you must abide by while financing your vehicle with us:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-slate-300 transition-colors">
              <FileText size={20} className="text-primary mb-3" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">Logbook Retention</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Welile Cars holds the original vehicle logbook until 100% of the financing is cleared.</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-slate-300 transition-colors">
              <ShieldCheck size={20} className="text-primary mb-3" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">Active Insurance</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Comprehensive insurance must be maintained active on the vehicle at all times.</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-slate-300 transition-colors">
              <AlertCircle size={20} className="text-amber-500 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">Certified Maintenance</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Major vehicle servicing must be done exclusively at our verified partner garages.</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-slate-300 transition-colors">
              <AlertCircle size={20} className="text-red-500 mb-3" />
              <h4 className="font-bold text-slate-900 text-sm mb-1">Payment Defaults</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Missing your scheduled payments for 30 consecutive days may result in vehicle repossession.</p>
            </div>
          </div>
        </motion.div>

        {hasApplied ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-2 border-emerald-500 rounded-[32px] p-10 text-center shadow-2xl shadow-emerald-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 blur-[80px] rounded-full"></div>
            <div className="w-24 h-24 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 size={48} strokeWidth={3} />
            </div>
            <h2 className="text-4xl font-black text-emerald-900 mb-3 relative z-10 tracking-tight">Application Approved</h2>
            <p className="text-emerald-700 font-semibold mb-8 text-lg relative z-10">Your financing for the {safeCar.name} is active and ready.</p>
            <button onClick={() => navigate('/my-vehicle')} className="bg-emerald-600 text-white font-bold py-4 px-10 rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 hover:shadow-emerald-600/40 hover:-translate-y-1 relative z-10 text-lg">
              Go to My Vehicle Dashboard
            </button>
          </motion.div>
        ) : (
          <>
            {/* Premium Hero Card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden group">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 bg-gradient-to-br from-slate-100 to-white flex items-center justify-center p-10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-60"></div>
                  <img src={safeCar.image} alt={safeCar.name} className="max-h-[300px] object-contain drop-shadow-2xl relative z-10 mix-blend-multiply group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full w-max mb-6">
                    <FileText size={14} /> Application Draft
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">{safeCar.year} • {safeCar.make}</p>
                  <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight leading-none">{safeCar.model}</h2>
                  
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Vehicle Value</p>
                    <p className="text-3xl font-black text-slate-900">{formatUGX(safeCar.priceUgx)}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Application Locked State */}
            {!isUnlocked && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}  className="bg-amber-50 border-2 border-amber-200 rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-amber-500/5">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                    <AlertCircle size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-amber-900 tracking-tight">Application Locked</h3>
                    <p className="text-amber-700 font-medium mt-1">You need to save <span className="font-bold">{formatUGX(minDepositTarget - saved)}</span> more to hit the minimum 30% deposit and unlock financing.</p>
                  </div>
                </div>
                <button onClick={() => navigate('/wallet')} className="w-full md:w-auto px-8 py-4 bg-amber-500 text-white font-bold rounded-2xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5 shrink-0 whitespace-nowrap">
                  Continue Saving
                </button>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Financing Breakdown & Slider */}
              <div className="lg:col-span-7 space-y-8">
                
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}  className="bg-primary text-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[60px] pointer-events-none"></div>
                  <h3 className="text-xl font-black mb-8 relative z-10 tracking-tight flex items-center gap-2">
                    <Settings size={22} className="text-primary-fixed-dim" /> Configure Financing
                  </h3>
                  
                  {/* Interactive Slider */}
                  <div className="mb-10 relative z-10 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                    <div className="flex justify-between items-end mb-4">
                      <p className="text-primary-fixed-dim text-xs uppercase tracking-widest font-bold">Adjust Your Deposit</p>
                      <p className="font-black text-white text-2xl">{formatUGX(actualDeposit)}</p>
                    </div>
                    <input 
                      type="range" 
                      min={minDepositTarget} 
                      max={safeCar.priceUgx * 0.9} 
                      step={500000}
                      value={customDeposit}
                      onChange={(e) => setCustomDeposit(Number(e.target.value))}
                      disabled={!isUnlocked}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-white/50 uppercase tracking-wider">
                      <span>Min (30%)</span>
                      <span>Max (90%)</span>
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10 bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                    <h4 className="text-white font-bold mb-2 flex items-center justify-between">Financing Summary <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">36 Months</span></h4>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/70">Vehicle Price</span>
                      <span className="text-white font-bold">{formatUGX(safeCar.priceUgx)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/70">Deposit Paid</span>
                      <span className="text-emerald-300 font-bold">-{formatUGX(actualDeposit)}</span>
                    </div>
                    <div className="w-full h-[1px] bg-white/10 my-2"></div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/70">Principal Financed</span>
                      <span className="text-white font-bold">{formatUGX(remaining)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-white/70">Total Interest (28%)</span>
                      <span className="text-white font-bold">{formatUGX(remaining * 0.28)}</span>
                    </div>
                    <div className="w-full h-[1px] bg-white/10 my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold">Total Payable</span>
                      <span className="font-black text-2xl text-white tracking-tight">{formatUGX(remaining * 1.28)}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Requirements Checklist */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}  className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col">
                  <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight flex items-center justify-between">
                    Requirements
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">{isUnlocked ? '4/4 Met' : '1/4 Met'}</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${isUnlocked ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-200'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isUnlocked ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 text-slate-400'}`}>
                        {isUnlocked ? <CheckCircle2 size={20} /> : <span className="font-black text-sm">1</span>}
                      </div>
                      <div className="flex-1">
                        <p className={`font-black text-sm ${isUnlocked ? 'text-emerald-900' : 'text-slate-900'}`}>30% Deposit Reached</p>
                        <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">{isUnlocked ? 'Target met successfully. You can adjust it on the left.' : 'Keep saving to unlock this step.'}</p>
                      </div>
                    </div>

                    {!isKycUploaded && !isKycPending ? (
                      <div className="flex flex-col gap-3 p-4 rounded-2xl border border-amber-200 bg-amber-50/50 group hover:border-amber-300 transition-colors cursor-pointer" onClick={() => { setUploadTarget('kyc'); setShowUploadOptions(true); }}>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-amber-100 text-amber-600">
                            <UploadCloud size={18} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <p className="font-black text-sm text-amber-900">Identity Verified (KYC)</p>
                              <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                              </span>
                            </div>
                            <p className="text-xs text-amber-700/80 mt-1 font-medium">Please upload your National ID.</p>
                          </div>
                        </div>
                        <div className="ml-14">
                          <button 
                            className="bg-white border border-amber-200 text-amber-700 text-xs font-bold py-2 px-4 rounded-xl shadow-sm hover:bg-amber-100 transition-colors"
                            onClick={(e) => { e.stopPropagation(); setUploadTarget('kyc'); setShowUploadOptions(true); }}
                          >
                            Upload Document
                          </button>
                        </div>
                      </div>
                    ) : isKycPending ? (
                      <div className="flex items-start gap-4 p-4 rounded-2xl border bg-blue-50 border-blue-100 transition-all">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-blue-500 text-white shadow-lg shadow-blue-500/30">
                          <Clock size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-sm text-blue-900">Identity Verification</p>
                          <p className="text-xs text-blue-700/80 mt-1 font-medium">Pending Admin Review.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-4 p-4 rounded-2xl border bg-emerald-50 border-emerald-100 transition-all">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                          <CheckCircle2 size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-sm text-emerald-900">Identity Verified (KYC)</p>
                          <p className="text-xs text-emerald-700/80 mt-1 font-medium">National ID linked.</p>
                        </div>
                      </div>
                    )}

                    {!isIncomeUploaded && !isIncomePending ? (
                      <div className="flex flex-col gap-3 p-4 rounded-2xl border border-amber-200 bg-amber-50/50 group hover:border-amber-300 transition-colors cursor-pointer" onClick={() => { setUploadTarget('income'); setShowUploadOptions(true); }}>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-amber-100 text-amber-600">
                            <UploadCloud size={18} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <p className="font-black text-sm text-amber-900">
                                Income Verification 
                                <span className="text-amber-600/80 font-bold ml-2 text-[10px] uppercase tracking-widest bg-amber-200/50 px-2 py-0.5 rounded-full">Optional</span>
                              </p>
                              <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                              </span>
                            </div>
                            <p className="text-xs text-amber-700/80 mt-1 font-medium">Please upload 3 months bank statements.</p>
                          </div>
                        </div>
                        <div className="ml-14">
                          <button 
                            className="bg-white border border-amber-200 text-amber-700 text-xs font-bold py-2 px-4 rounded-xl shadow-sm hover:bg-amber-100 transition-colors"
                            onClick={(e) => { e.stopPropagation(); setUploadTarget('income'); setShowUploadOptions(true); }}
                          >
                            Upload Document
                          </button>
                        </div>
                      </div>
                    ) : isIncomePending ? (
                      <div className="flex items-start gap-4 p-4 rounded-2xl border bg-blue-50 border-blue-100 transition-all">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-blue-500 text-white shadow-lg shadow-blue-500/30">
                          <Clock size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-sm text-blue-900">Income Verification</p>
                          <p className="text-xs text-blue-700/80 mt-1 font-medium">Pending Admin Review.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-4 p-4 rounded-2xl border bg-emerald-50 border-emerald-100 transition-all">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                          <CheckCircle2 size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-sm text-emerald-900">Income Verification</p>
                          <p className="text-xs text-emerald-700/80 mt-1 font-medium">Proof of income submitted.</p>
                        </div>
                      </div>
                    )}

                    {!isGuarantorSubmitted ? (
                      <div className="flex flex-col gap-3 p-4 rounded-2xl border border-amber-200 bg-amber-50/50 group hover:border-amber-300 transition-colors cursor-pointer" onClick={() => setShowGuarantorForm(true)}>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-amber-100 text-amber-600">
                            <Users size={18} />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <p className="font-black text-sm text-amber-900">Guarantor Details</p>
                              <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                              </span>
                            </div>
                            <p className="text-xs text-amber-700/80 mt-1 font-medium">Please provide details for 2 guarantors.</p>
                          </div>
                        </div>
                        <div className="ml-14">
                          <button 
                            className="bg-white border border-amber-200 text-amber-700 text-xs font-bold py-2 px-4 rounded-xl shadow-sm hover:bg-amber-100 transition-colors"
                            onClick={(e) => { e.stopPropagation(); setShowGuarantorForm(true); }}
                          >
                            Enter Details
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-4 p-4 rounded-2xl border bg-emerald-50 border-emerald-100 transition-all">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                          <CheckCircle2 size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-sm text-emerald-900">Guarantor Details</p>
                          <p className="text-xs text-emerald-700/80 mt-1 font-medium">2 guarantors verified.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Requirements & Payment Selection */}
              <div className="lg:col-span-5 space-y-8">
                
                {/* Commitments moved to top */}

                {/* Payment Plan Selection */}
                {isUnlocked && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}  className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Payment Frequency</h3>
                    
                    <div className="space-y-3">
                      {plans.map(p => {
                        const isSelected = plan === p.id;
                        return (
                          <div 
                            key={p.id}
                            onClick={() => setPlan(p.id as any)}
                            className={`border-2 rounded-2xl p-5 cursor-pointer transition-all flex items-center justify-between group ${
                              isSelected ? 'border-primary bg-primary/5 shadow-inner' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-primary' : 'border-slate-300 group-hover:border-slate-400'}`}>
                                {isSelected && <motion.div layoutId="plan-dot" className="w-3 h-3 rounded-full bg-primary" />}
                              </div>
                              <div>
                                <p className={`font-black text-sm mb-0.5 ${isSelected ? 'text-primary' : 'text-slate-700'}`}>{p.label}</p>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{p.period}</p>
                              </div>
                            </div>
                            <p className="text-lg font-black text-slate-900">{formatUGX(Math.round(monthlyInstallment / p.divisor))}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-8 flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <input 
                        type="checkbox" 
                        id="terms"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary accent-primary" 
                      />
                      <label htmlFor="terms" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                        I have read and agree to the <span className="font-bold text-primary">Welile Cars Rules & Commitments</span> and understand that my deposit is subject to verification.
                      </label>
                    </div>

                    <button 
                      onClick={handleProceed}
                      disabled={isSubmitting || !termsAccepted || !car}
                      className="mt-4 w-full py-5 bg-primary text-white font-black rounded-2xl transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 text-lg flex items-center justify-center disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-3">
                          <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Finalize Application <ChevronRight size={20} />
                        </span>
                      )}
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Upload Options Dialog */}
      <Dialog open={showUploadOptions} onOpenChange={(open) => {
        if (!open) {
          setShowUploadOptions(false);
          setPermissionRequest(null);
          setSelectedImage(null);
        }
      }}>
        <DialogContent className="sm:max-w-sm bg-white rounded-[32px] p-8 border-0 shadow-2xl overflow-hidden">
          {/* Hidden File Input */}
          <input 
            type="file" 
            accept="image/*" 
            capture={permissionRequest === 'camera' ? 'environment' : undefined} 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
          />

          {selectedImage ? (
            <div className="text-center">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-4">Preview</h3>
              <div className="rounded-2xl overflow-hidden mb-6 border-4 border-slate-100 relative">
                <img src={selectedImage} alt="Selected" className="w-full h-48 object-cover" />
                {isUploading && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-primary" />
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setSelectedImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  disabled={isUploading}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Retake
                </button>
                <button 
                  onClick={() => {
                    setIsUploading(true);
                    setTimeout(() => { 
                      setIsUploading(false); 
                      if (uploadTarget === 'income') setIsIncomePending(true);
                      if (uploadTarget === 'kyc') setIsKycPending(true);
                      setShowUploadOptions(false); 
                      setUploadTarget(null);
                      setPermissionRequest(null);
                      setSelectedImage(null);
                    }, 1500);
                  }}
                  disabled={isUploading}
                  className="flex-[2] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  <CheckCircle2 size={20} />
                  Confirm & Upload
                </button>
              </div>
            </div>
          ) : permissionRequest ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                {permissionRequest === 'camera' ? <Camera size={32} /> : <ImageIcon size={32} />}
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                Allow Access
              </h3>
              <p className="text-slate-500 text-sm font-medium mb-8">
                Welile Car needs permission to access your {permissionRequest === 'camera' ? 'camera' : 'photo gallery'} to upload documents.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setPermissionRequest(null)}
                  className="flex-1 py-3 px-4 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Deny
                </button>
                <button 
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5"
                >
                  Allow
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Upload Document</h3>
              <p className="text-slate-500 text-sm font-medium mb-6">Choose how you want to upload your {uploadTarget === 'income' ? 'bank statements' : 'National ID'}.</p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => setPermissionRequest('camera')}
                  disabled={isUploading}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-primary hover:bg-primary/5 transition-all group disabled:opacity-50 text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    {isUploading ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Take Photo</p>
                    <p className="text-xs text-slate-500">Use your camera to scan</p>
                  </div>
                </button>

                <button 
                  onClick={() => setPermissionRequest('gallery')}
                  disabled={isUploading}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-primary hover:bg-primary/5 transition-all group disabled:opacity-50 text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    {isUploading ? <Loader2 size={24} className="animate-spin" /> : <ImageIcon size={24} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Choose from Gallery</p>
                    <p className="text-xs text-slate-500">Upload existing file</p>
                  </div>
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Guarantor Form Dialog */}
      <Dialog open={showGuarantorForm} onOpenChange={setShowGuarantorForm}>
        <DialogContent className="sm:max-w-md bg-white rounded-[32px] p-8 border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Guarantor Details</h3>
          <p className="text-slate-500 text-sm font-medium mb-6">Please provide contact information for two trusted guarantors.</p>
          
          <div className="space-y-6">
            {/* Guarantor 1 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">1</div>
                First Guarantor
              </h4>
              <div className="space-y-3">
                <input type="text" placeholder="Full Name" value={guarantors.g1Name} onChange={e => setGuarantors({...guarantors, g1Name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium" />
                <input type="tel" placeholder="Phone Number" value={guarantors.g1Phone} onChange={e => setGuarantors({...guarantors, g1Phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium" />
                <input type="email" placeholder="Email Address (Optional)" value={guarantors.g1Email} onChange={e => setGuarantors({...guarantors, g1Email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium" />
              </div>
            </div>

            {/* Guarantor 2 */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">2</div>
                Second Guarantor
              </h4>
              <div className="space-y-3">
                <input type="text" placeholder="Full Name" value={guarantors.g2Name} onChange={e => setGuarantors({...guarantors, g2Name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium" />
                <input type="tel" placeholder="Phone Number" value={guarantors.g2Phone} onChange={e => setGuarantors({...guarantors, g2Phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium" />
                <input type="email" placeholder="Email Address (Optional)" value={guarantors.g2Email} onChange={e => setGuarantors({...guarantors, g2Email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium" />
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3 text-amber-800 text-sm font-medium">
              <Clock className="shrink-0 mt-0.5" size={18} />
              <p>An SMS will be sent to your guarantors to confirm their consent before final approval.</p>
            </div>

            <button 
              onClick={() => {
                setIsUploading(true);
                setTimeout(() => { 
                  setIsUploading(false); 
                  setIsGuarantorSubmitted(true);
                  setShowGuarantorForm(false); 
                }, 1500);
              }}
              disabled={isUploading || !guarantors.g1Name || !guarantors.g1Phone || !guarantors.g2Name || !guarantors.g2Phone}
              className="w-full py-4 px-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUploading ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
              Submit Guarantors
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="print:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default FinancingPage;
