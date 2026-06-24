import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '@/config';
import { fetchWithTimeout } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { formatUGX } from '@/lib/format';
import { PlusCircle, Wallet, FileText, Car, CarFront, LifeBuoy, CheckCircle2, Circle, TrendingUp, Target, Clock, ArrowRight, MapPin, ExternalLink } from 'lucide-react';
import { carsData } from '@/data/cars';
import { useProfile } from '@/hooks/useProfile';

interface DashboardData {
  health: {
    riskLevel: string;
    creditScore: number;
    qualificationStatus: string;
  };
  savings: {
    totalSaved: number;
    targetAmount: number;
    interestEarned: number;
    monthlyContribution: number;
    progressPercent: number;
    nextMilestone: {
      amountNeeded: number;
      message: string;
    };
  };
  journey: {
    currentStep: string;
    completedSteps: string[];
  };
}

const JOURNEY_STEPS = [
  'Registered', 
  'Saving', 
  'Qualified', 
  'Financing Approved', 
  'Vehicle Released', 
  'Repayment Active'
];

const DashboardPage = () => {
  const { user, session, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: profile } = useProfile();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetchWithTimeout(`${API_URL}/dashboard/summary`);
        if (res.ok) {
          const json = await res.json();
          // Map backend data to our new layout structure if necessary, or just use as is
          setData({
            ...json,
            health: json.health || {
              riskLevel: 'Low',
              creditScore: 85,
              qualificationStatus: 'Building Deposit'
            },
            savings: {
              ...json.savings,
              monthlyContribution: 500000,
              nextMilestone: json.savings?.nextMilestone || {
                amountNeeded: 6600000,
                message: "Keep saving!"
              }
            }
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, session, authLoading, navigate]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 font-medium">Loading Dashboard...</div>
      </div>
    );
  }

  const isQualified = data.health.creditScore >= 70 && data.savings.progressPercent >= 30;

  const walletDeduction = Number(localStorage.getItem('mockWalletDeduction') || 0);
  const availableBalance = data.savings.totalSaved - walletDeduction;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Header / Hero */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative bg-primary text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-primary/30 overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="absolute top-[-50%] right-[-10%] w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] bg-fuchsia-500/20 rounded-full blur-[60px] pointer-events-none"></div>
        
        <div className="relative z-10 w-full md:w-1/2">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
            <span className="text-xs font-bold uppercase tracking-wider text-white/90">Active Account</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
          <p className="text-white/70 font-medium text-lg">Your vehicle ownership journey is looking great.</p>
        </div>

        <div className="relative z-10 w-full md:w-1/2 flex justify-end">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl w-full max-w-sm text-center transform hover:scale-105 transition-transform duration-500">
            <p className="text-sm font-bold text-white/70 uppercase tracking-widest mb-1">Total Savings Balance</p>
            <p className="text-4xl font-black tracking-tight">{formatUGX(availableBalance)}</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                +{formatUGX(data.savings.interestEarned)} Earned
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Location Map */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <MapPin size={24} className="text-primary" /> Company Headquarters
            </h2>
            <p className="text-slate-500 text-sm mt-1">Visit our main office for formal inquiries, document drops, or a cup of coffee.</p>
          </div>
          <a href="https://maps.google.com/?q=Palm+Lane+Kabaale+Entebbe" target="_blank" rel="noreferrer" className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shrink-0">
            Open in Maps <ExternalLink size={16} />
          </a>
        </div>
        
        <div className="w-64 mx-auto aspect-square bg-slate-100 rounded-[2rem] overflow-hidden relative border border-slate-200">
          <iframe 
            src="https://maps.google.com/maps?q=Palm+Lane+Kabaale,+Entebbe&t=&z=15&ie=UTF8&iwloc=&output=embed" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0"
          ></iframe>
        </div>
        <div className="mt-6 flex items-start gap-4 p-4 bg-slate-50 rounded-xl w-64 mx-auto">
          <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center shrink-0 text-primary">
            <MapPin size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs">Welile Technologies</h4>
            <p className="text-slate-600 text-[10px]">Palm Lane Kabaale, Entebbe</p>
            <p className="text-slate-400 text-[10px] mt-1">Open Mon-Fri: 9AM-5PM</p>
          </div>
        </div>
      </motion.div>

      {/* Target/Featured Vehicle */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} >
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-slate-900">{profile?.selected_car_id ? "Your Target Vehicle" : "Featured Vehicles"}</h3>
          <button onClick={() => navigate('/vehicles')} className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">{profile?.selected_car_id ? "Change Vehicle" : "View All"} <ArrowRight size={12} /></button>
        </div>
        {(() => {
          if (profile?.selected_car_id) {
            const targetCar = carsData.find(c => c.id === profile.selected_car_id);
            if (!targetCar) return null;
            return (
              <div className="bg-white rounded-[32px] border border-slate-100 p-6 md:p-8 shadow-sm hover:card-shadow-lg transition-all duration-500 group flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none -z-10 group-hover:bg-primary/10 transition-colors duration-700"></div>
                <div className="w-full md:w-1/2 h-64 md:h-80 flex items-center justify-center bg-gradient-to-br from-slate-50 to-white rounded-[2rem] p-6 overflow-hidden border border-slate-50">
                  <img 
                    src={targetCar.image} 
                    alt={targetCar.name} 
                    className="w-full h-full object-contain mix-blend-multiply drop-shadow-2xl group-hover:scale-105 transition-transform duration-700 ease-out" 
                  />
                </div>
                
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary font-black uppercase tracking-widest px-3 py-1 rounded-full text-[10px] mb-4 w-fit">
                    <Target size={12} /> Target Goal
                  </div>
                  <h4 className="font-black text-slate-900 text-3xl md:text-5xl tracking-tight mb-2">
                    {targetCar.name}
                  </h4>
                  <p className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-fuchsia-500 font-black text-2xl md:text-3xl mb-8">
                    {formatUGX(targetCar.priceUgx)}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 group-hover:border-primary/20 transition-colors">
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Deposit (30%)</span>
                      <span className="block text-xl font-black text-slate-900">
                        {formatUGX(targetCar.priceUgx * 0.3)}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 group-hover:border-primary/20 transition-colors">
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Est. Monthly (36m)</span>
                      <span className="block text-xl font-black text-slate-900">
                        {formatUGX((targetCar.priceUgx * 0.7 * 1.28) / 36)}
                      </span>
                    </div>
                  </div>
                  
                  <button onClick={() => navigate('/financing')} className="w-full shimmer-btn bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                    Manage Financing <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {carsData.slice(0, 3).map(car => (
                <div key={car.id} className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className="h-48 flex items-center justify-center mb-6 bg-gradient-to-b from-slate-50 to-white rounded-2xl p-4 overflow-hidden">
                    <img src={car.image} alt={car.name} className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-xl leading-tight mb-1">{car.name}</h4>
                  <p className="text-primary font-black text-sm mb-4">{formatUGX(car.priceUgx)}</p>
                  
                  <div className="space-y-2 mb-4 bg-slate-50 p-3 rounded-xl">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-500">Required Deposit (30%)</span>
                      <span className="text-slate-900">{formatUGX(car.priceUgx * 0.3)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-500">Est. Monthly (36m)</span>
                      <span className="text-slate-900">{formatUGX((car.priceUgx * 0.7 * 1.28) / 36)}</span>
                    </div>
                  </div>

                  <button onClick={() => navigate('/vehicles/' + car.id)} className="w-full border-2 border-slate-100 hover:border-primary hover:bg-primary hover:text-white text-slate-700 font-bold py-2 rounded-xl text-xs transition-all">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          );
        })()}
      </motion.div>

      {/* Section 2: Ownership Journey Tracker */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}  className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] pointer-events-none -z-10"></div>
        <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Ownership Journey</h3>
        <div className="flex justify-between items-start min-w-[600px] relative mt-4">
          <div className="absolute top-4 left-6 right-6 h-1.5 bg-slate-100 rounded-full z-0 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-fuchsia-500 transition-all duration-1000" style={{ width: `${(data.journey.completedSteps.length / (JOURNEY_STEPS.length - 1)) * 100}%` }}></div>
          </div>
          {JOURNEY_STEPS.map((step, idx) => {
            const isCompleted = idx < 2 || (idx === 2 && isQualified);
            const isCurrent = (idx === 1 && !isQualified) || (idx === 2 && isQualified) || (idx === 3 && data.journey.currentStep === 'Financing Approved');
            
            return (
              <div key={step} className="relative z-10 flex flex-col items-center w-24 text-center group cursor-default">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 border-4 bg-white transition-all duration-300 ${
                  isCompleted ? 'border-primary text-primary shadow-[0_0_15px_rgba(78,21,142,0.3)] scale-110' : isCurrent ? 'border-fuchsia-500 text-fuchsia-500 shadow-[0_0_0_4px_rgba(217,70,239,0.2)]' : 'border-slate-100 text-slate-300'
                }`}>
                  {isCompleted ? <CheckCircle2 size={18} strokeWidth={3} /> : <Circle size={12} className={isCurrent ? 'fill-fuchsia-500' : 'fill-slate-200'} />}
                </div>
                <span className={`text-[10px] uppercase tracking-widest font-bold transition-colors ${isCurrent ? 'text-fuchsia-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 3: Qualification Status */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}  className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:card-shadow transition-shadow">
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2 tracking-tight"><Target size={24} className="text-primary" /> Qualification Status</h3>
          <div className="flex gap-6 items-center mb-8">
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90 drop-shadow-md" viewBox="0 0 36 36">
                <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className={`${isQualified ? 'text-primary' : 'text-fuchsia-500'} transition-all duration-1000 ease-out`} strokeWidth="3" strokeDasharray={`${data.health.creditScore}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Score</span>
                <span className="text-2xl font-black text-slate-900 leading-none mt-1">{data.health.creditScore}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Risk Level: <span className={`font-black ml-1 ${data.health.riskLevel === 'Low' ? 'text-emerald-500' : 'text-amber-500'}`}>{data.health.riskLevel}</span></p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status: <span className={`font-black ml-1 ${isQualified ? 'text-primary' : 'text-fuchsia-500'}`}>{isQualified ? 'Eligible for Financing' : 'Building Deposit'}</span></p>
            </div>
          </div>
          
          {!isQualified && (
            <div className="bg-gradient-to-r from-fuchsia-50 to-fuchsia-100/50 border border-fuchsia-100 rounded-2xl p-5 text-sm font-medium text-fuchsia-900 shadow-sm">
              Keep pushing! You need <span className="font-black text-fuchsia-600">{formatUGX(data.savings.nextMilestone.amountNeeded)}</span> more savings to qualify.
            </div>
          )}
        </motion.div>

        {/* Section 4: Savings Goals */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}  className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:card-shadow transition-shadow flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2 tracking-tight"><TrendingUp size={24} className="text-primary" /> Savings Goals</h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deposit Target</span>
                <span className="font-black text-slate-900 text-lg">{formatUGX(data.savings.targetAmount)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remaining Amount</span>
                <span className="font-black text-slate-900 text-lg">{formatUGX(data.savings.targetAmount - availableBalance)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Est. Completion</span>
                <span className="font-black text-emerald-500 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl"><Clock size={16} /> December 2026</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Section 6: Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} >
        <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Quick Actions</h3>
        <div className="flex flex-col gap-4">
          <button onClick={() => navigate('/vehicles')} className="w-full bg-gradient-to-r from-primary to-fuchsia-600 text-white p-6 md:p-8 rounded-[2rem] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group overflow-hidden relative">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-white/20 transition-colors duration-700"></div>
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                <CarFront size={32} className="text-white drop-shadow-md" />
              </div>
              <div className="text-left">
                <span className="block text-xs md:text-sm font-black uppercase tracking-widest text-white/80 mb-1">Ready to own?</span>
                <span className="block text-2xl md:text-3xl font-black tracking-tight drop-shadow-md">Purchase a Vehicle</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md relative z-10 group-hover:bg-white/20 transition-colors">
              <ArrowRight size={24} className="group-hover:translate-x-1.5 transition-transform text-white" />
            </div>
          </button>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button onClick={() => navigate('/wallet')} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:card-shadow hover:border-primary/20 transition-all duration-300 flex flex-col items-center justify-center gap-4 group">
              <div className="w-14 h-14 rounded-full bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300"><Wallet size={24} /></div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Wallet</span>
            </button>
            <button onClick={() => navigate('/applications')} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:card-shadow hover:border-primary/20 transition-all duration-300 flex flex-col items-center justify-center gap-4 group">
              <div className="w-14 h-14 rounded-full bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300"><FileText size={24} /></div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Applications</span>
            </button>
            <button onClick={() => navigate('/my-vehicle')} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:card-shadow hover:border-primary/20 transition-all duration-300 flex flex-col items-center justify-center gap-4 group">
              <div className="w-14 h-14 rounded-full bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300"><Car size={24} /></div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">My Vehicle</span>
            </button>
            <button onClick={() => navigate('/support')} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:card-shadow hover:border-primary/20 transition-all duration-300 flex flex-col items-center justify-center gap-4 group">
              <div className="w-14 h-14 rounded-full bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-300"><LifeBuoy size={24} /></div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Support</span>
            </button>
          </div>
        </div>
      </motion.div>


    </div>
  );
};

export default DashboardPage;
