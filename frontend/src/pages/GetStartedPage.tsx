import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomSignIn, CustomSignUp } from './AuthPage';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car as CarIcon, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Wallet, 
  Clock, 
  BadgePercent,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Lock,
  Calendar,
  AlertCircle,
  Users,
  Briefcase,
  Check,
  Shuffle,
  Info,
  Building,
  Heart,
  ChevronLeft
} from 'lucide-react';

// Import images
import vitzImg from '@/assets/car-vitz.jpg';
import premioImg from '@/assets/car-premio.jpg';
import wishImg from '@/assets/car-wish.jpg';

interface CarModel {
  id: string;
  name: string;
  type: string;
  priceUgx: number;
  image: string;
  specs: {
    engine: string;
    fuel: string;
    seats: number;
  };
}

const CARS: CarModel[] = [
  {
    id: 'vitz',
    name: 'Toyota Vitz',
    type: 'Hatchback (Perfect for Ride-Hailing)',
    priceUgx: 18000000,
    image: vitzImg,
    specs: { engine: '1.3L VVT-i', fuel: '20 km/L', seats: 5 }
  },
  {
    id: 'wish',
    name: 'Toyota Wish',
    type: 'MPV (Ideal for Business & Cargo)',
    priceUgx: 25000000,
    image: wishImg,
    specs: { engine: '1.8L Valvematic', fuel: '14 km/L', seats: 7 }
  },
  {
    id: 'premio',
    name: 'Toyota Premio',
    type: 'Sedan (Premium Personal Vehicle)',
    priceUgx: 28000000,
    image: premioImg,
    specs: { engine: '1.8L D4-D', fuel: '16 km/L', seats: 5 }
  }
];

type TabType = 'planner' | 'benefits' | 'vision' | 'partners' | 'signin';

export default function GetStartedPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('planner');
  const [selectedCar, setSelectedCar] = useState<CarModel>(CARS[0]);
  
  // Savings Configuration
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [savingAmount, setSavingAmount] = useState<number>(150000); // Default weekly saving
  const [lockedPlan, setLockedPlan] = useState(false);

  const handleCarSelect = (car: CarModel) => {
    setSelectedCar(car);
  };

  // Auth/Sign-In State
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  // Dynamic Calculations
  const deposit30 = Math.round(selectedCar.priceUgx * 0.3);
  const platform70 = Math.round(selectedCar.priceUgx * 0.7);
  const financeInterest = Math.round(platform70 * 0.3);
  const totalAmountToAmortize = platform70 + financeInterest;
  const penaltyFee = Math.round(savingAmount * 0.2);

  const totalPeriodsToReach30 = Math.ceil(deposit30 / savingAmount);
  let timeTo30Text = '';
  if (frequency === 'daily') {
    const months = (totalPeriodsToReach30 / 30).toFixed(1);
    timeTo30Text = `${totalPeriodsToReach30} Days (~${months} Mths)`;
  } else if (frequency === 'weekly') {
    const months = (totalPeriodsToReach30 / 4.3).toFixed(1);
    timeTo30Text = `${totalPeriodsToReach30} Weeks (~${months} Mths)`;
  } else {
    timeTo30Text = `${totalPeriodsToReach30} Months`;
  }

  const getMinMaxSavings = () => {
    if (frequency === 'daily') return { min: 20000, max: 100000, step: 5000, default: 30000 };
    if (frequency === 'weekly') return { min: 100000, max: 500000, step: 10000, default: 150000 };
    return { min: 400000, max: 2000000, step: 50000, default: 600000 };
  };

  const handleFrequencyChange = (freq: 'daily' | 'weekly' | 'monthly') => {
    setFrequency(freq);
    const limits = freq === 'daily' ? { def: 30000 } : freq === 'weekly' ? { def: 150000 } : { def: 600000 };
    setSavingAmount(limits.def);
  };

  const handleLockPlan = () => {
    setLockedPlan(true);
    // Automatically transition to final Sign In dashboard tab after lock
    setTimeout(() => {
      setActiveTab('signin');
    }, 800);
  };

  const tabsConfig = [
    { id: 'planner', label: '1. Plan Planner', icon: <Wallet size={16} /> },
    { id: 'benefits', label: '2. Core Benefits', icon: <Sparkles size={16} /> },
    { id: 'vision', label: '3. Vision & Mission', icon: <Heart size={16} /> },
    { id: 'partners', label: '4. Partners Ecosystem', icon: <Building size={16} /> },
    { id: 'signin', label: '5. Access Portal', icon: <Lock size={16} /> }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans flex flex-col justify-between selection:bg-primary/20">
      
      {/* Background Decorative Mesh Blur */}
      <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] rounded-full bg-primary/8 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-4 flex items-center justify-between relative z-20 border-b border-border/40 bg-background/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <CarIcon className="text-primary-foreground" size={18} />
          </div>
          <span className="text-lg font-bold font-heading tracking-tight">Welile Cars Onboarding</span>
        </div>
        <button 
          onClick={() => setActiveTab('signin')}
          className="text-xs font-bold hover:text-primary transition flex items-center gap-1.5 py-2 px-4 rounded-lg bg-secondary/60 hover:bg-secondary"
        >
          <span>Quick Sign In</span>
          <UserCheck size={14} />
        </button>
      </header>

      {/* Main Onboarding Dashboard Workspace */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-6 relative z-10 flex flex-col justify-center">
        
        {/* Visual Progress Stepper above the Dashboard */}
        <div className="w-full max-w-5xl mx-auto mb-6 hidden md:flex justify-between items-center px-4">
          {tabsConfig.map((tab, idx) => {
            const isCompleted = tabsConfig.findIndex(t => t.id === activeTab) > idx;
            const isActive = tab.id === activeTab;
            return (
              <div key={tab.id} className="flex items-center flex-grow last:flex-grow-0">
                <button 
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 text-xs font-bold transition-all ${
                    isActive ? 'text-primary' : isCompleted ? 'text-emerald-600' : 'text-muted-foreground'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition ${
                    isActive 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : isCompleted 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600' 
                        : 'border-border bg-muted/40 text-muted-foreground'
                  }`}>
                    {isCompleted ? <Check size={10} /> : idx + 1}
                  </span>
                  <span>{tab.label.split('. ')[1]}</span>
                </button>
                {idx < tabsConfig.length - 1 && (
                  <div className={`h-[2px] flex-grow mx-4 rounded-full transition-colors duration-300 ${
                    isCompleted ? 'bg-emerald-500/60' : 'bg-border/60'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Dashboard Shell Container */}
        <div className="bg-card border border-border/80 rounded-3xl shadow-xl card-shadow-lg max-w-5xl mx-auto w-full min-h-[580px] grid grid-cols-1 md:grid-cols-12 overflow-hidden relative">
          
          {/* Dashboard Left Sidebar Navigation */}
          <aside className="md:col-span-3 border-r border-border/60 bg-secondary/25 p-5 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="font-extrabold text-xs text-muted-foreground uppercase tracking-widest block">Menu Portal</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Explore before you sign in</p>
              </div>

              {/* Sidebar Menu Item Tabs */}
              <nav className="space-y-1.5">
                {tabsConfig.map((tab) => {
                  const isActive = tab.id === activeTab;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`w-full py-2.5 px-3.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all duration-200 ${
                        isActive 
                          ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-[1.02]' 
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Live stats block at bottom of sidebar */}
            <div className="bg-card/70 border border-border/60 rounded-xl p-3 space-y-1.5">
              <span className="text-[9px] text-muted-foreground uppercase font-bold block">Welile Co-Financing</span>
              <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>30% Save / 70% Fund</span>
              </div>
            </div>
          </aside>

          {/* Dashboard Dynamic Right Content Frame */}
          <div className="md:col-span-9 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[600px] md:max-h-[580px]">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                className="flex-grow flex flex-col justify-between h-full"
              >
                {/* 1. PLANNER TAB */}
                {activeTab === 'planner' && (
                  <div className="space-y-6 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
                            <span>Vehicle Savings Target Planner</span>
                            <Sparkles size={16} className="text-primary animate-pulse" />
                          </h2>
                          <p className="text-xs text-muted-foreground mt-0.5">Customize your savings frequency and goal split</p>
                        </div>
                        <span className="bg-primary/10 text-primary text-[9px] font-black px-2.5 py-1 rounded-full uppercase">30/70 Split</span>
                      </div>

                      {/* Interactive Vehicle selector */}
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        {CARS.map(car => (
                          <button
                            key={car.id}
                            disabled={lockedPlan}
                            onClick={() => handleCarSelect(car)}
                            className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-0.5 ${
                              selectedCar.id === car.id 
                                ? 'bg-primary/5 border-primary text-foreground font-semibold shadow-sm' 
                                : 'bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            <span className="text-xs font-bold tracking-tight">{car.name.split(' ')[1]}</span>
                            <span className="text-[8px] opacity-75">{(car.priceUgx/1000000).toFixed(1)}M UGX</span>
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 items-center">
                        {/* Car thumbnail */}
                        <div className="relative rounded-xl overflow-hidden border border-border/50 bg-muted aspect-[16/10] h-28 mx-auto w-full max-w-[200px] lg:max-w-none">
                          <img src={selectedCar.image} alt={selectedCar.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className="absolute bottom-2 left-2 right-2 text-white flex justify-between text-[10px]">
                            <span className="font-extrabold">{selectedCar.name}</span>
                            <span className="opacity-80">{selectedCar.specs.engine}</span>
                          </div>
                        </div>

                        {/* Frequency Buttons */}
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Savings Frequency</label>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(['daily', 'weekly', 'monthly'] as const).map(freq => (
                              <button
                                key={freq}
                                disabled={lockedPlan}
                                onClick={() => handleFrequencyChange(freq)}
                                className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold uppercase transition ${
                                  frequency === freq ? 'bg-secondary text-primary border-primary' : 'bg-transparent text-muted-foreground border-border/40 hover:bg-secondary/40'
                                }`}
                              >
                                {freq}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Installment Slider */}
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-muted-foreground uppercase text-[10px]">Select Savings Amount</span>
                          <span className="text-primary font-black">
                            {savingAmount.toLocaleString()} UGX <span className="text-[9px] font-medium text-muted-foreground">/{frequency.substring(0,3)}</span>
                          </span>
                        </div>
                        <input
                          type="range"
                          disabled={lockedPlan}
                          min={getMinMaxSavings().min}
                          max={getMinMaxSavings().max}
                          step={getMinMaxSavings().step}
                          value={savingAmount}
                          onChange={(e) => setSavingAmount(Number(e.target.value))}
                          className="w-full h-1.5 rounded-lg bg-secondary accent-primary cursor-pointer"
                        />
                      </div>

                      {/* Co-Financing Segment Split */}
                      <div className="space-y-2 mt-4 bg-secondary/35 border border-secondary p-3 rounded-xl">
                        <div className="flex rounded-lg overflow-hidden h-4.5 p-[1px] bg-card border border-border/30">
                          <div className="bg-primary text-[8px] font-black text-primary-foreground flex items-center justify-center rounded-l-md" style={{ width: '30%' }}>
                            30% YOU SAVE
                          </div>
                          <div className="bg-indigo-600 text-[8px] font-black text-white flex items-center justify-center rounded-r-md" style={{ width: '70%' }}>
                            70% Platform
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold pt-0.5">
                          <span>30% Deposit Goal: <strong>{deposit30.toLocaleString()} UGX</strong></span>
                          <span className="text-right">70% Platform Cover: <strong className="text-indigo-600">{platform70.toLocaleString()} UGX</strong></span>
                        </div>
                        <div className="bg-emerald-50/60 border border-emerald-100 rounded-lg p-2 mt-1">
                          <p className="text-[10px] font-bold text-emerald-700">5% Compounding Installment Bonus!</p>
                          <p className="text-[9px] text-emerald-600 leading-normal mt-0.5">
                            Save in installments and watch your balance grow: every installment you pay compounds by 5% until the {deposit30.toLocaleString()} UGX target is completed.
                          </p>
                        </div>
                        <div className="border-t border-border/20 pt-1.5 grid grid-cols-2 gap-2 text-[8px] text-muted-foreground font-semibold">
                          <span>Interest Cost (30% on 70%): <strong className="text-foreground">+{financeInterest.toLocaleString()} UGX</strong></span>
                          <span className="text-right text-destructive">Delayed Installment Penalty (20%): <strong>+{penaltyFee.toLocaleString()} UGX</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex items-center justify-between border-t border-border/60">
                      <div className="flex items-center gap-2 text-xs">
                        <Clock size={16} className="text-primary" />
                        <span className="text-muted-foreground">Target Reach Duration: <strong className="text-foreground">{timeTo30Text}</strong></span>
                      </div>
                      
                      {!lockedPlan ? (
                        <button
                          onClick={handleLockPlan}
                          className="py-2.5 px-6 gradient-primary text-primary-foreground font-extrabold text-xs rounded-xl hover:opacity-95 transition flex items-center gap-1.5 shadow-sm"
                        >
                          <Lock size={12} />
                          <span>Lock Plan & Go to Sign In</span>
                          <ArrowRight size={12} />
                        </button>
                      ) : (
                        <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                          <CheckCircle2 size={14} /> Locked! Loading Secure Portal...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. BENEFITS TAB */}
                {activeTab === 'benefits' && (
                  <div className="space-y-6 flex flex-col justify-between h-full">
                    <div>
                      <h2 className="text-xl font-bold font-heading text-foreground">Why Choose Welile Cars?</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">We eliminate massive barriers to vehicle ownership in Uganda</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                        <div className="border border-border/80 rounded-2xl p-4 space-y-2 bg-secondary/10">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Wallet size={16} /></div>
                          <h4 className="font-extrabold text-xs text-foreground">Flexible Saving Options</h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">Save dynamically on a Daily, Weekly, or Monthly basis. Adjust the amount on the fly as your cashflow dictates.</p>
                        </div>
                        <div className="border border-border/80 rounded-2xl p-4 space-y-2 bg-secondary/10">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600"><BadgePercent size={16} /></div>
                          <h4 className="font-extrabold text-xs text-foreground">Simple 30/70 Co-Financing</h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">Save the initial 30% and we pay the full remaining 70% upfront, applying a flat 30% interest rate solely on our financed portion.</p>
                        </div>
                        <div className="border border-border/80 rounded-2xl p-4 space-y-2 bg-secondary/10">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600"><ShieldCheck size={16} /></div>
                          <h4 className="font-extrabold text-xs text-foreground">Full Ownership Rights</h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">No complex legal loopholes. Once the remaining loan portion is amortized, the legal logbook and registration are fully handed over.</p>
                        </div>
                        <div className="border border-border/80 rounded-2xl p-4 space-y-2 bg-secondary/10">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600"><Shuffle size={16} /></div>
                          <h4 className="font-extrabold text-xs text-foreground">Mobile Money Ease</h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">Fully integrated with Uganda's mobile money giants (MTN & Airtel) to guarantee secure, instantaneous deposit tracing.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/60 flex justify-end">
                      <button
                        onClick={() => setActiveTab('vision')}
                        className="py-2.5 px-5 bg-card border border-border hover:bg-secondary/40 text-foreground font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                      >
                        <span>Read Vision & Mission</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. VISION & MISSION TAB */}
                {activeTab === 'vision' && (
                  <div className="space-y-6 flex flex-col justify-between h-full">
                    <div>
                      <h2 className="text-xl font-bold font-heading text-foreground">Our Foundations</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">Empowering driving communities across Uganda</p>
                      
                      <div className="space-y-5 mt-6">
                        <div className="border-l-4 border-primary pl-4 space-y-1">
                          <span className="text-[10px] font-extrabold text-primary uppercase">Our Vision</span>
                          <h3 className="font-extrabold text-sm text-foreground">Affordable Transport Ownership</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            To establish Uganda's most structured, inclusive, and reliable vehicle savings and co-financing network—unlocking economic capacity for ride-hailing riders, businesses, and individuals.
                          </p>
                        </div>
                        <div className="border-l-4 border-indigo-600 pl-4 space-y-1">
                          <span className="text-[10px] font-extrabold text-indigo-600 uppercase">Our Mission</span>
                          <h3 className="font-extrabold text-sm text-foreground">Breaking Upfront Barriers</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            To dismantle the heavy upfront capital barriers of vehicle purchases by providing transparent micro-savings planners, flexible payment schedules, and secure asset financing partnerships.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/60 flex justify-end">
                      <button
                        onClick={() => setActiveTab('partners')}
                        className="py-2.5 px-5 bg-card border border-border hover:bg-secondary/40 text-foreground font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
                      >
                        <span>See Partner Network</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. PARTNERS TAB */}
                {activeTab === 'partners' && (
                  <div className="space-y-6 flex flex-col justify-between h-full">
                    <div>
                      <h2 className="text-xl font-bold font-heading text-foreground">Our Strategic Partner Ecosystem</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">A collaborative network designed to secure your vehicle allocation</p>
                      
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="border border-border/60 rounded-2xl p-4 text-center bg-secondary/5 space-y-1.5">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Dealers Partner</span>
                          <span className="font-extrabold text-sm text-foreground block">Uganda Dealers Association</span>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">Guarantees direct access to premium, fully-serviced vehicle chasses at zero dealer commissions.</p>
                        </div>
                        <div className="border border-border/60 rounded-2xl p-4 text-center bg-secondary/5 space-y-1.5">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Financing Alliance</span>
                          <span className="font-extrabold text-sm text-foreground block">Co-op Credit Alliance</span>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">Funds the upfront 70% cover immediately once you accomplish the 30% target saving milestone.</p>
                        </div>
                        <div className="border border-border/60 rounded-2xl p-4 text-center bg-secondary/5 space-y-1.5 col-span-2">
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block">Mobile Payment Tracing</span>
                          <div className="flex justify-around items-center pt-1">
                            <span className="font-black text-xs text-foreground uppercase tracking-widest">MTN Mobile Money</span>
                            <span className="text-muted-foreground opacity-30">|</span>
                            <span className="font-black text-xs text-foreground uppercase tracking-widest">Airtel Money</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground leading-relaxed pt-1">Secure escrow ledger tracking deposits and auto-generating receipts instantly.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/60 flex justify-between items-center">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <ShieldCheck size={14} className="text-emerald-500" /> Authorized Financing System
                      </span>
                      <button
                        onClick={() => setActiveTab('signin')}
                        className="py-2.5 px-5 gradient-primary text-primary-foreground font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition shadow-sm shadow-primary/20"
                      >
                        <span>Lock & Access Portal</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. SIGN IN PORTAL TAB */}
                {activeTab === 'signin' && (
                  <div className="space-y-5 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex justify-between items-start border-b border-border/60 pb-3">
                        <div>
                          <h2 className="text-xl font-bold font-heading text-foreground">Sign In to Portal</h2>
                          <p className="text-xs text-muted-foreground mt-0.5">Securely log in to manage your micro-savings account</p>
                        </div>
                        
                        {lockedPlan && (
                          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Lock size={9} /> plan secured
                          </div>
                        )}
                      </div>

                      {/* Quick summary of locked plan at the top of sign-in tab */}
                      {lockedPlan && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-3 p-3 bg-secondary/40 border border-secondary rounded-xl flex justify-between items-center text-xs font-semibold"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-7 rounded overflow-hidden bg-muted border border-border/50">
                              <img src={selectedCar.image} alt={selectedCar.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="font-extrabold text-foreground">{selectedCar.name}</span>
                              <span className="text-[9px] text-muted-foreground block">
                                Saving plan: {savingAmount.toLocaleString()} UGX / {frequency.substring(0,3)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] text-muted-foreground block uppercase font-bold">30% Save Goal:</span>
                            <span className="text-primary font-black">{deposit30.toLocaleString()} UGX</span>
                          </div>
                        </motion.div>
                      )}

                      {/* Custom Auth Component */}
                      <div className="flex justify-center mt-4 w-full">
                        {isLogin ? (
                           <CustomSignIn />
                        ) : (
                           <CustomSignUp />
                        )}
                      </div>
                    </div>

                    {/* Toggle Auth mode */}
                    <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                      <button 
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="text-primary font-bold hover:underline"
                      >
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
                      </button>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <ShieldCheck size={12} className="text-emerald-500" /> SSL Secured
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border/40 text-center relative z-10 text-[10px] text-muted-foreground">
        <p>© 2026 Welile Cars. Registered Asset Financing Provider in Uganda. Partners: Co-op Credit & MTN/Airtel Money.</p>
      </footer>

    </div>
  );
}
