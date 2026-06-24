 
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_URL } from '@/config';
import { fetchWithTimeout } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { carsData, Car } from '@/data/cars';
import { useProfile, useTransactions, useDeposit, useWithdraw } from '@/hooks/useProfile';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedNumber from '@/components/AnimatedNumber';
import BottomNav from '@/components/BottomNav';
import { formatUGX, formatDate } from '@/lib/format';
import { ArrowDownLeft, ArrowUpRight, Sparkles, X, Check, Wallet, PlusCircle, MinusCircle, TrendingUp, ShieldCheck, Calculator, Printer, ChevronDown, Plus } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { PageLoader } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';

const paymentMethods = [
  { id: 'mtn', name: 'MTN MoMo', color: '#FFCC00', icon: '📱' },
  { id: 'airtel', name: 'Airtel Money', color: '#ED1C24', icon: '📱' },
];

const withdrawalMethods = [
  { id: 'mtn', name: 'MTN MoMo', color: '#FFCC00', icon: '📱' },
  { id: 'airtel', name: 'Airtel Money', color: '#ED1C24', icon: '📱' },
  { id: 'bank', name: 'Bank Transfer', color: '#4C158D', icon: '🏦' },
];

const quickAmounts = [50000, 100000, 200000, 500000];

const purchasePaymentMethods = [
  { id: 'wallet', name: 'Fund from Wallet', icon: '👛' },
  { id: 'mtn', name: 'MTN MoMo', icon: '📱' },
  { id: 'airtel', name: 'Airtel Money', icon: '📱' },
  { id: 'bank', name: 'Bank Transfer', icon: '🏦' },
  { id: 'card', name: 'Credit Card', icon: '💳' },
];

const WalletPage = () => {
  const { user, loading: authLoading, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: profile, isLoading } = useProfile();
  const { data: transactions = [] } = useTransactions();
  const deposit = useDeposit();
  
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('mtn');
  const [transactionId, setTransactionId] = useState('');
  const [transactionTime, setTransactionTime] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);

  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('personal');

  const withdraw = useWithdraw();
  const [withdrawalPhone, setWithdrawalPhone] = useState('');
  const [withdrawalName, setWithdrawalName] = useState('');
  const [withdrawalBank, setWithdrawalBank] = useState('');
  const [withdrawalAccount, setWithdrawalAccount] = useState('');

  // Live Data State
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Purchase State
  const searchParams = new URLSearchParams(location.search);
  const purchaseCarId = searchParams.get('purchaseCarId');
  const [purchaseCar, setPurchaseCar] = useState<Car | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseMethod, setPurchaseMethod] = useState('wallet');
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (purchaseCarId) {
      const car = carsData.find(c => c.id === purchaseCarId);
      if (car) {
        setPurchaseCar(car);
        setShowPurchaseModal(true);
      }
    }
  }, [purchaseCarId]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        setDashboardError(null);
        const res = await fetchWithTimeout(`${API_URL}/dashboard/summary`);
        if (res.ok) {
          const json = await res.json();
          setDashboardData(json);
        } else {
          setDashboardError("Failed to fetch wallet data.");
        }
      } catch (e) {
        console.error(e);
        setDashboardError("Network error occurred while loading wallet.");
      } finally {
        setLoadingDashboard(false);
      }
    };
    fetchData();
  }, [user, session]);

  // Calculator State (Sliders)
  const [calcTarget, setCalcTarget] = useState<number[]>([15000000]);
  const [calcMonthly, setCalcMonthly] = useState<number[]>([500000]);
  const [calcResult, setCalcResult] = useState<any>(null);

  // Auto-calculate when sliders change
  useEffect(() => {
    const target = calcTarget[0];
    const monthly = calcMonthly[0];
    if (target > 0 && monthly > 0) {
      const months = Math.ceil(target / monthly);
      const totalInterest = Math.round(target * 0.05);
      setCalcResult({
        estimatedMonths: months,
        estimatedInterest: totalInterest
      });
    }
  }, [calcTarget, calcMonthly]);

  if (!authLoading && !user) { navigate('/'); return null; }
  if (isLoading || loadingDashboard) {
    return <PageLoader message="Loading Wallet..." />;
  }

  if (dashboardError || !profile || !dashboardData) {
    return <ErrorState message={dashboardError || "Wallet data could not be loaded."} onRetry={() => setLoadingDashboard(true)} />;
  }

  const walletDeduction = Number(localStorage.getItem('mockWalletDeduction') || 0);
  const availableBalance = dashboardData.savings.totalSaved - walletDeduction;

  const handleDeposit = async () => {
    const val = parseInt(amount);
    if (!val || val < 1000) return;
    if (!transactionId || !transactionTime || !transactionDate) {
      toast.error("Missing Details", { description: "Please provide the transaction ID, time, and date." });
      return;
    }
    
    setIsDepositing(true);
    try {
      await deposit.mutateAsync({ amount: val, method, transactionId, transactionTime, transactionDate });
      
      setIsDepositing(false);
      setDepositSuccess(true);
      toast.success("Deposit Submitted", { description: `Your deposit of ${formatUGX(val)} is pending verification.` });
      
      setTimeout(() => {
        setDepositSuccess(false);
        setAmount('');
        setTransactionId('');
        setTransactionTime('');
        setShowDeposit(false);
      }, 3000);
    } catch (e) {
      console.error(e);
      setIsDepositing(false);
      toast.error("Deposit Failed", { description: "An error occurred during the transaction." });
    }
  };

  const handleWithdraw = async () => {
    const val = parseInt(amount);
    if (!val || val < 1000) {
      toast.error("Invalid Amount", { description: "Minimum withdrawal is 1000 UGX." });
      return;
    }
    if (val > availableBalance) {
      toast.error("Insufficient Funds", { description: "You cannot withdraw more than your available balance." });
      return;
    }
    
    setIsWithdrawing(true);
    try {
      await withdraw.mutateAsync({
        amount: val,
        method,
        withdrawalPhone,
        withdrawalName,
        withdrawalBank,
        withdrawalAccount
      });
      
      setIsWithdrawing(false);
      setWithdrawSuccess(true);
      toast.success("Withdrawal Requested", { description: "Your request is pending verification by the Finance Department." });
      
      setTimeout(() => {
        setWithdrawSuccess(false);
        setAmount('');
        setShowWithdraw(false);
      }, 2500);
    } catch (e: any) {
      console.error(e);
      setIsWithdrawing(false);
      toast.error("Withdrawal Failed", { description: e.message || "An error occurred." });
    }
  };

  const handlePurchase = () => {
    setShowPurchaseModal(false);
    const deficit = purchaseCar && availableBalance < purchaseCar.priceUgx 
      ? purchaseCar.priceUgx - availableBalance 
      : 0;
    navigate(`/payment-details?method=${purchaseMethod}&carId=${purchaseCar?.id}&deficit=${deficit}`);
  };

  const iconForType = (type: string) => {
    if (type === 'deposit') return <ArrowDownLeft size={18} className="text-emerald-500" />;
    if (type === 'growth') return <Sparkles size={18} className="text-primary" />;
    return <ArrowUpRight size={18} className="text-rose-500" />;
  };

  // Mock expected payment (either calculated from car or a default)
  const expectedPayment = dashboardData?.vehicle?.priceUgx ? Math.round(dashboardData.vehicle.priceUgx / 36) : 450000;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8 p-4 md:p-0 pt-8 md:pt-0">
        
        {/* Header */}
        <div className="print:hidden">
          <h1 className="text-2xl font-extrabold text-slate-900">Wallet</h1>
          <p className="text-slate-500 font-medium">Manage your savings, deposits, and growth.</p>
        </div>

        {/* Print-Only Header */}
        <div className="hidden print:block mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Account Statement</h1>
          <p className="text-slate-500">Welile Car Financing</p>
          <div className="mt-4 p-4 border border-slate-200 rounded-xl">
            <p className="font-bold">Total Balance: {formatUGX(availableBalance)}</p>
            <p className="text-sm text-slate-500">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Hero Wallet Card Redesigned */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="print:hidden relative bg-[#4C158D] text-white rounded-[3rem] p-8 min-h-[440px] flex flex-col items-center justify-between shadow-2xl shadow-[#4C158D]/30 overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-[-50%] right-[-20%] w-[400px] h-[400px] bg-white/10 rounded-full blur-[60px] pointer-events-none"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] bg-fuchsia-500/20 rounded-full blur-[50px] pointer-events-none"></div>
          
          {/* Top section */}
          <div className="relative z-10 flex flex-col items-center w-full mt-4">
            <button className="text-white/70 hover:text-white font-medium flex items-center gap-1 mb-6 transition-colors">
              Wallet 1 <ChevronDown size={16} />
            </button>
            
            <AnimatedNumber value={availableBalance} className="text-5xl md:text-6xl font-black drop-shadow-lg text-center tracking-tight" />
            
            <p className="text-sm text-white/60 mt-3 font-medium flex items-center gap-2">
              {profile.savings_locked ? (
                <><ShieldCheck size={14} /> Savings Locked</>
              ) : (
                <>{formatUGX(dashboardData.savings.interestEarned)} Earned <TrendingUp size={14} /></>
              )}
            </p>
          </div>
          
          {/* Bottom actions */}
          <div className="relative z-10 flex flex-col items-center w-full mt-10 space-y-8">
            <div className="flex items-center justify-center gap-3 w-full max-w-sm">
              {/* Deposit Button */}
              <button 
                onClick={() => { setAmount(''); setShowDeposit(true); }} 
                disabled={profile.savings_locked}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium px-5 py-3.5 rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-50 flex-1 backdrop-blur-md"
              >
                <ArrowDownLeft size={16} /> <span className="text-sm">Deposit</span>
              </button>
              
              {/* Center Plus Button */}
              <button 
                onClick={() => { setAmount(''); setShowDeposit(true); }} 
                disabled={profile.savings_locked}
                className="w-[60px] h-[60px] bg-white/5 border border-white/10 hover:bg-white/10 rounded-full flex items-center justify-center transition-all shrink-0 disabled:opacity-50 backdrop-blur-md text-white"
              >
                <Plus size={24} />
              </button>
              
              {/* Withdraw Button */}
              <button 
                onClick={() => { setAmount(''); setShowWithdraw(true); }} 
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium px-5 py-3.5 rounded-full transition-all flex items-center justify-center gap-2 disabled:opacity-50 flex-1 backdrop-blur-md"
              >
                <ArrowUpRight size={16} /> <span className="text-sm">Withdraw</span>
              </button>
            </div>
            
            {/* Status indicator */}
            <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
              <span className="text-xs font-medium text-white/70 tracking-wide">Synchronized</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4 md:gap-6 print:hidden">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <ArrowDownLeft size={24} />
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Deposits</p>
            <p className="text-2xl font-black text-slate-900">{formatUGX(availableBalance)}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="w-12 h-12 bg-fuchsia-50 text-fuchsia-600 rounded-full flex items-center justify-center mb-4">
              <TrendingUp size={24} />
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Growth Earned</p>
            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-[#4C158D]">+{formatUGX(dashboardData.savings.interestEarned)}</p>
          </motion.div>
        </div>

        {/* Enhanced Interactive Savings Calculator */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}  className="print:hidden bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2 space-y-6">
            <h2 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
              <Calculator size={24} className="text-primary" /> Savings Estimator
            </h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-slate-500 uppercase">Target Amount</span>
                  <span className="font-black text-primary text-lg">{formatUGX(calcTarget[0])}</span>
                </div>
                <Slider
                  defaultValue={[15000000]}
                  max={50000000}
                  min={1000000}
                  step={500000}
                  value={calcTarget}
                  onValueChange={setCalcTarget}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-bold text-slate-500 uppercase">Monthly Deposit</span>
                  <span className="font-black text-emerald-600 text-lg">{formatUGX(calcMonthly[0])}</span>
                </div>
                <Slider
                  defaultValue={[500000]}
                  max={5000000}
                  min={50000}
                  step={50000}
                  value={calcMonthly}
                  onValueChange={setCalcMonthly}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2 bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col justify-center">
            {calcResult && (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Estimated Time to Target</p>
                  <p className="text-4xl font-black text-slate-900">{calcResult.estimatedMonths} <span className="text-lg text-slate-500 font-bold">Months</span></p>
                </div>
                <div className="h-[1px] bg-slate-200 w-full"></div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Projected Interest Earned</p>
                  <p className="text-2xl font-black text-emerald-500">+{formatUGX(calcResult.estimatedInterest)}</p>
                </div>
                <div className="bg-primary/10 text-primary p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Sparkles size={16} /> 5% Annual Growth Rate applied.
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Savings Timeline / History */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm print:shadow-none print:border-none print:p-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-extrabold text-xl text-slate-900">Savings History</h2>
            <button onClick={() => window.print()} className="print:hidden text-sm flex items-center gap-2 text-primary font-bold bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition">
              <Printer size={16} /> Print Statement
            </button>
          </div>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Wallet size={48} className="mb-4 opacity-20" />
              <p className="font-medium">No savings history yet.</p>
            </div>
          ) : (
            <div className="space-y-0 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {transactions.map((tx, idx) => (
                <div key={tx.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-slate-50 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    {iconForType(tx.type)}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                      <p className="font-bold text-slate-900 capitalize">{tx.type} {tx.method ? `via ${tx.method}` : ''}</p>
                      <span className={`font-black ${tx.type === 'withdrawal' ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {tx.type === 'withdrawal' ? '-' : '+'}{formatUGX(tx.amount)}
                      </span>
                    </div>
                    <time className="text-xs font-medium text-slate-400">{formatDate(tx.date || tx.created_at || new Date().toISOString())}</time>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Deposit Modal (Glassmorphism Slide-Up) */}
      <AnimatePresence>
        {showDeposit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end justify-center md:items-center"
            onClick={() => !isDepositing && setShowDeposit(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 shadow-2xl relative"
              onClick={e => e.stopPropagation()}>
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-extrabold text-2xl text-slate-900">Deposit Money</h2>
                <button onClick={() => !isDepositing && setShowDeposit(false)} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition">
                  <X size={20} />
                </button>
              </div>

              {isDepositing ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-primary/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-3xl">📱</span>
                  </div>
                  <h3 className="text-xl font-extrabold mb-2 text-slate-900">Submitting Deposit</h3>
                  <p className="text-slate-500 font-medium px-4">Sending your deposit details to the Finance Department for verification...</p>
                </div>
              ) : depositSuccess ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Check size={40} strokeWidth={3} />
                  </motion.div>
                  <h3 className="text-2xl font-extrabold mb-2 text-slate-900">Deposit Submitted!</h3>
                  <p className="text-slate-500 font-medium">Your deposit is now pending verification by the Finance Department.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {paymentMethods.map(pm => (
                      <button 
                        key={pm.id} 
                        onClick={() => setMethod(pm.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                          method === pm.id ? 'border-primary bg-primary/5 shadow-inner' : 'border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <span className="text-2xl">{pm.icon}</span>
                        <span className="font-bold text-sm flex-1 text-left text-slate-900">{pm.name}</span>
                        {method === pm.id && <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center"><Check size={12} strokeWidth={4} /></div>}
                      </button>
                    ))}
                  </div>
                  
                  <div className="mb-4">
                    <button 
                      onClick={() => setAmount(expectedPayment.toString())}
                      className="w-full py-3 rounded-xl bg-primary/10 text-primary font-bold border border-primary/20 hover:bg-primary/20 transition flex justify-between px-4 items-center"
                    >
                      <span className="text-sm">Expected Payment</span>
                      <span>{formatUGX(expectedPayment)}</span>
                    </button>
                  </div>

                  <div className="relative mb-4">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">UGX</span>
                    <input type="number" placeholder="Enter amount" value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="w-full h-16 pl-14 pr-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xl font-black placeholder:text-slate-300 placeholder:text-lg placeholder:font-bold outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                  </div>

                  <div className="flex gap-2 mb-6">
                    {quickAmounts.map(qa => (
                      <button key={qa} onClick={() => setAmount(qa.toString())}
                        className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 hover:text-slate-900 transition">
                        {(qa / 1000)}K
                      </button>
                    ))}
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Transaction ID (TID)</label>
                      <input type="text" placeholder="e.g., 2038472948" value={transactionId}
                        onChange={e => setTransactionId(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Time</label>
                        <input type="time" value={transactionTime}
                          onChange={e => setTransactionTime(e.target.value)}
                          className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                        <input type="date" value={transactionDate}
                          onChange={e => setTransactionDate(e.target.value)}
                          className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                      </div>
                    </div>
                  </div>
                  
                  <button onClick={handleDeposit} disabled={!amount || !transactionId || !transactionTime || !transactionDate}
                    className="w-full h-14 bg-primary text-white font-bold rounded-2xl disabled:opacity-50 disabled:bg-slate-300 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all text-lg">
                    Submit for Verification
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdraw Modal (Glassmorphism Slide-Up) */}
      <AnimatePresence>
        {showWithdraw && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end justify-center md:items-center"
            onClick={() => !isWithdrawing && setShowWithdraw(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 shadow-2xl relative"
              onClick={e => e.stopPropagation()}>
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-extrabold text-2xl text-slate-900">Withdraw Money</h2>
                <button onClick={() => !isWithdrawing && setShowWithdraw(false)} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition">
                  <X size={20} />
                </button>
              </div>

              {isWithdrawing ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-rose-500/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-3xl">🏦</span>
                  </div>
                  <h3 className="text-xl font-extrabold mb-2 text-slate-900">Processing Withdrawal</h3>
                  <p className="text-slate-500 font-medium px-4">Sending <span className="font-bold text-slate-900">{formatUGX(parseInt(amount) || 0)}</span> to your selected account. This may take a moment.</p>
                </div>
              ) : withdrawSuccess ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Check size={40} strokeWidth={3} />
                  </motion.div>
                  <h3 className="text-2xl font-extrabold mb-2 text-slate-900">Withdrawal Requested!</h3>
                  <p className="text-slate-500 font-medium">Your request has been forwarded to the Finance Department for verification.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {withdrawalMethods.map(pm => (
                      <button 
                        key={pm.id} 
                        onClick={() => setMethod(pm.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                          method === pm.id ? 'border-primary bg-primary/5 shadow-inner' : 'border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <span className="text-2xl">{pm.icon}</span>
                        <span className="font-bold text-sm flex-1 text-left text-slate-900">{pm.name}</span>
                        {method === pm.id && <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center"><Check size={12} strokeWidth={4} /></div>}
                      </button>
                    ))}
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Destination Details</h4>
                    
                    {(method === 'mtn' || method === 'airtel') && (
                      <>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Registered Phone Number</label>
                          <input type="tel" value={withdrawalPhone}
                            onChange={e => setWithdrawalPhone(e.target.value)}
                            placeholder="e.g. +256 700 000000"
                            className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Full Name (as registered)</label>
                          <input type="text" value={withdrawalName}
                            onChange={e => setWithdrawalName(e.target.value)}
                            placeholder="e.g. John Doe"
                            className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                        </div>
                      </>
                    )}

                    {method === 'bank' && (
                      <>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Bank Name</label>
                          <input type="text" value={withdrawalBank}
                            onChange={e => setWithdrawalBank(e.target.value)}
                            placeholder="e.g. Centenary Bank"
                            className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Account Holder Name</label>
                          <input type="text" value={withdrawalName}
                            onChange={e => setWithdrawalName(e.target.value)}
                            placeholder="e.g. John Doe"
                            className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1">Account Number</label>
                          <input type="text" value={withdrawalAccount}
                            onChange={e => setWithdrawalAccount(e.target.value)}
                            placeholder="e.g. 1234567890"
                            className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex justify-between text-sm font-bold text-slate-500 mb-2 px-1">
                    <span>Withdrawal Amount</span>
                    <span>Available: <span className="text-primary">{formatUGX(availableBalance)}</span></span>
                  </div>
                  <div className="relative mb-6">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">UGX</span>
                    <input type="number" placeholder="Enter amount" value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="w-full h-16 pl-14 pr-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xl font-black placeholder:text-slate-300 placeholder:text-lg placeholder:font-bold outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Reason for Withdrawal</label>
                    <select value={withdrawReason} onChange={e => setWithdrawReason(e.target.value)}
                      className="w-full h-14 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition appearance-none">
                      <option value="personal">Personal Use</option>
                      <option value="emergency">Emergency Funds</option>
                      <option value="car_maintenance">Car Maintenance</option>
                      <option value="other">Other / Miscellaneous</option>
                    </select>
                  </div>
                  
                  <button onClick={handleWithdraw} disabled={withdraw.isPending || !amount || parseInt(amount) > availableBalance}
                    className="w-full h-14 bg-rose-500 text-white font-bold rounded-2xl disabled:opacity-50 disabled:bg-slate-300 shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all text-lg flex items-center justify-center gap-2">
                    {withdraw.isPending && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    Confirm Withdrawal
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout / Purchase Modal */}
      <AnimatePresence>
        {showPurchaseModal && purchaseCar && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end justify-center md:items-center"
            onClick={() => !isPurchasing && !purchaseSuccess && setShowPurchaseModal(false)}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl p-6 relative overflow-y-auto max-h-[90vh] shadow-2xl"
              onClick={e => e.stopPropagation()}>
              
              {purchaseSuccess ? (
                <div className="py-12 flex flex-col items-center text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Check size={40} strokeWidth={3} />
                  </motion.div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Purchase Successful!</h2>
                  <p className="text-slate-500 font-medium">You are now the proud owner of the {purchaseCar.name}.</p>
                  <p className="text-sm mt-4 text-primary font-bold animate-pulse">Redirecting to marketplace...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-extrabold text-2xl text-slate-900">Checkout</h2>
                    <button onClick={() => setShowPurchaseModal(false)} className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200 transition"><X size={20} /></button>
                  </div>
                  
                  <div className="bg-[#4C158D] p-6 rounded-3xl flex gap-4 items-center mb-6 text-white shadow-xl shadow-[#4C158D]/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
                    <img src={purchaseCar.image} alt={purchaseCar.name} className="w-28 h-20 object-contain drop-shadow-xl relative z-10" />
                    <div className="relative z-10">
                      <p className="font-extrabold text-lg leading-tight">{purchaseCar.name}</p>
                      <p className="text-white/90 font-black text-xl drop-shadow-sm mt-1">{formatUGX(purchaseCar.priceUgx)}</p>
                    </div>
                  </div>

                  <p className="text-xs font-bold mb-3 uppercase tracking-wider text-slate-400">Select Payment Method</p>
                  <div className="space-y-3 mb-6">
                    {purchasePaymentMethods.map(pm => (
                      <button 
                        key={pm.id} 
                        onClick={() => setPurchaseMethod(pm.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                          purchaseMethod === pm.id ? 'border-primary bg-primary/5 shadow-inner' : 'border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <span className="text-2xl">{pm.icon}</span>
                        <span className="font-bold text-sm flex-1 text-left text-slate-900">{pm.name}</span>
                        {purchaseMethod === pm.id && <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center"><Check size={12} strokeWidth={4} /></div>}
                      </button>
                    ))}
                  </div>

                  {purchaseMethod === 'wallet' && dashboardData?.savings?.totalSaved < purchaseCar.priceUgx && (
                    <div className="mb-6 bg-amber-50 text-amber-700 p-4 rounded-2xl text-sm font-semibold flex items-start gap-3 border border-amber-200">
                      <span className="material-symbols-outlined shrink-0 mt-0.5">info</span>
                      <p>Your wallet balance is low. You will be prompted to top up your wallet via Mobile Money in the next step.</p>
                    </div>
                  )}

                  <button 
                    onClick={handlePurchase}
                    disabled={isPurchasing}
                    className="w-full h-14 bg-primary text-white font-bold rounded-2xl disabled:opacity-50 text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                  >
                    Continue to Payment
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="print:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default WalletPage;
