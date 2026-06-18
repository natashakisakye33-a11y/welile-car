import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '@/config';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, useSelectCarDetails, useRequestFinancing } from '@/hooks/useProfile';
import { motion } from 'framer-motion';
import { carsData, Car } from '@/data/cars';
import { formatUGX } from '@/lib/format';
import { toast } from 'sonner';
import { 
  ChevronLeft, CheckCircle2, ShieldCheck, MapPin, Star, 
  Settings, Fuel, Calendar, Car as CarIcon, Gauge, Users, 
  Droplet, AlertCircle, PhoneCall, CalendarPlus, ChevronRight, X
} from 'lucide-react';

const CarDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { data: profile } = useProfile();
  const selectCar = useSelectCarDetails();
  const requestFinancing = useRequestFinancing();
  
  const [car, setCar] = useState<Car | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [userSavings, setUserSavings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paymentFreq, setPaymentFreq] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'plan' | 'method'>('plan');

  useEffect(() => {
    const foundCar = carsData.find(c => c.id === id);
    if (foundCar) {
      setCar(foundCar);
    } else {
      navigate('/vehicles');
    }
  }, [id, navigate]);

  useEffect(() => {
    if (session?.access_token) {
      fetch(`${API_URL}/dashboard/summary`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.savings) {
          setUserSavings(data.savings.totalSaved);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [session]);

  if (!car || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const requiredDeposit = car.priceUgx * 0.3;
  const financedAmount = car.priceUgx * 0.7;
  const remainingNeeded = Math.max(0, requiredDeposit - userSavings);
  const isEligible = remainingNeeded === 0;

  const monthlyLoan = (financedAmount * 1.28) / 36;
  const monthlyInsurance = car.estimatedCosts.insurance || (car.priceUgx * 0.08 / 12);
  const totalMonthly = monthlyLoan + monthlyInsurance;

  const weeklyLoan = monthlyLoan / 4;
  const weeklyInsurance = monthlyInsurance / 4;
  const totalWeekly = weeklyLoan + weeklyInsurance;

  const dailyLoan = monthlyLoan / 30;
  const dailyInsurance = monthlyInsurance / 30;
  const totalDaily = dailyLoan + dailyInsurance;

  const divisor = paymentFreq === 'daily' ? 30 : paymentFreq === 'weekly' ? 4 : 1;
  const periodLabel = paymentFreq === 'daily' ? 'Daily' : paymentFreq === 'weekly' ? 'Weekly' : 'Monthly';

  const installment = monthlyLoan / divisor;
  const insurance = monthlyInsurance / divisor;
  const totalCost = installment + insurance;

  return (
    <>
    <div className="bg-slate-50 min-h-screen pb-24 font-sans text-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/vehicles')} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-bold text-lg">{car.name}</h1>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        
        {/* 1. Vehicle Images */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
          <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden relative mb-4 flex items-center justify-center">
            <img src={car.gallery[currentImageIdx]} alt={car.name} className="object-contain w-full h-full mix-blend-multiply" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {car.gallery.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentImageIdx(idx)}
                className={`w-20 h-14 rounded-xl border-2 flex items-center justify-center shrink-0 overflow-hidden ${currentImageIdx === idx ? 'border-primary' : 'border-transparent bg-slate-50'}`}
              >
                <img src={img} alt="thumbnail" className="w-full h-full object-contain mix-blend-multiply" />
              </button>
            ))}
          </div>
        </div>

        {/* Top Recommendation Info (Most important stuff first) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Basic Info & Pricing */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 leading-tight">{car.name}</h2>
                  <p className="text-slate-500 font-medium">{car.specs.year} Model • {car.type} • {car.specs.transmission}</p>
                </div>
              </div>
              <div className="mt-6 mb-8">
                <div className="bg-gradient-to-br from-primary to-purple-900 rounded-2xl p-5 text-white relative overflow-hidden shadow-lg shadow-primary/20 border border-white/10">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500 opacity-20 rounded-full blur-2xl"></div>
                  <h4 className="font-extrabold text-lg mb-1 flex items-center gap-2 relative z-10">
                    <Star className="text-yellow-400 fill-yellow-400" size={18} /> Dream Big, Start Small
                  </h4>
                  <p className="text-white text-xl font-black leading-relaxed relative z-10">
                    Use <span className="text-yellow-400">UGX 5,000</span> to own this car!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Start Saving Widget */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col justify-center text-center h-full">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="text-primary fill-primary" size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">Your Journey Starts Here</h3>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              Don't let big price tags hold you back. Start saving towards your {car.name} today and watch your money grow!
            </p>
            
            <div className="mt-auto">
              <button 
                onClick={() => {
                  setPaymentStep('plan');
                  setShowPaymentModal(true);
                }}
                className="w-full font-bold py-4 rounded-xl transition-all bg-primary hover:bg-purple-800 text-white shadow-lg shadow-primary/30 text-lg"
              >
                Start  with UGX 5,000
              </button>
            </div>
          </div>
        </div>

        {/* Condition & Verification */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {car.condition.verified && (
            <div className="bg-blue-50 text-blue-700 border border-blue-100 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shrink-0">
              <CheckCircle2 size={16} /> Verified
            </div>
          )}
          {car.condition.inspected && (
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shrink-0">
              <CheckCircle2 size={16} /> Inspected
            </div>
          )}
          {car.condition.serviceRecords && (
            <div className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shrink-0">
              <CheckCircle2 size={16} /> Service Records Available
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Specifications */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Vehicle Specifications</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex gap-3">
                <Settings className="text-slate-400 shrink-0" size={20} />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Engine</p>
                  <p className="font-bold text-slate-900 text-sm">{car.specs.engine}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Fuel className="text-slate-400 shrink-0" size={20} />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Fuel</p>
                  <p className="font-bold text-slate-900 text-sm">{car.specs.fuel}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Gauge className="text-slate-400 shrink-0" size={20} />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Transmission</p>
                  <p className="font-bold text-slate-900 text-sm">{car.specs.transmission}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CarIcon className="text-slate-400 shrink-0" size={20} />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Mileage</p>
                  <p className="font-bold text-slate-900 text-sm">{car.specs.mileage}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Users className="text-slate-400 shrink-0" size={20} />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Seats</p>
                  <p className="font-bold text-slate-900 text-sm">{car.specs.seats}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Droplet className="text-slate-400 shrink-0" size={20} />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Color</p>
                  <p className="font-bold text-slate-900 text-sm">{car.specs.color}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Key Features</h3>
            <div className="flex flex-wrap gap-2">
              {car.features.map((feature, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Estimated Costs / Payment Plans */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Select Payment Plan</h3>
            <div className="space-y-4">
              {[
                { id: 'daily', label: 'Daily Payment', divisor: 30 },
                { id: 'weekly', label: 'Weekly Payment', divisor: 4 },
                { id: 'monthly', label: 'Monthly Payment', divisor: 1 },
              ].map(plan => {
                const pLoan = Math.round(monthlyInstallment / plan.divisor);
                const pIns = Math.round(car.estimatedCosts.insurance / plan.divisor);
                const pTotal = pLoan + pIns;
                const isSelected = paymentFreq === plan.id;

                return (
                  <div 
                    key={plan.id}
                    onClick={() => setPaymentFreq(plan.id as any)}
                    className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                      isSelected ? 'border-primary bg-primary/5 shadow-inner' : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary' : 'border-slate-300'}`}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                        <h4 className="font-bold text-slate-900">{plan.label}</h4>
                      </div>
                      <span className="font-black text-primary text-lg">{formatUGX(pTotal)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 text-xs font-medium text-slate-500 pl-8">
                      <div className="flex justify-between pr-4"><span>Loan:</span> <span className="text-slate-700">{formatUGX(pLoan)}</span></div>
                      <div className="flex justify-between"><span>Insurance:</span> <span className="text-slate-700">{formatUGX(pIns)}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
            

          </div>

          <div className="space-y-6">
            {/* Verification Section */}
            <div 
              className="w-full text-left bg-slate-900 rounded-3xl p-6 text-white shadow-sm flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                <ShieldCheck size={24} className="text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold mb-1">{car.verification.status}</h4>
                <p className="text-sm text-slate-400 font-medium">Inspected by {car.verification.inspector} on {car.verification.date}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setShowInspectionForm(true)}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <CalendarPlus size={18} /> Schedule Inspection
          </button>
          <button 
            onClick={() => {
              toast.info("Connecting to dealer...");
              window.location.href = `tel:${car.dealer.phone}`;
            }}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <PhoneCall size={18} /> Contact Dealer
          </button>
        </div>

      </div>
    </div>

    {/* Inspection Modal */}
    {showInspectionForm && (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowInspectionForm(false)}>
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-xl text-slate-900">Schedule Inspection</h3>
              <p className="text-sm text-slate-500">Pick a date to view this vehicle.</p>
            </div>
            <button onClick={() => setShowInspectionForm(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Date</label>
              <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Time</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none">
                <option>Morning (9AM - 12PM)</option>
                <option>Afternoon (1PM - 4PM)</option>
                <option>Evening (4PM - 6PM)</option>
              </select>
            </div>
          </div>

          <button 
            onClick={() => {
              setShowInspectionForm(false);
              toast.success("Inspection Scheduled!", { description: "We've notified the dealer. You'll receive a confirmation SMS shortly." });
            }}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all cursor-pointer"
          >
            Confirm Appointment
          </button>
        </motion.div>
      </div>
    )}

    {showPaymentModal && (
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowPaymentModal(false)}>
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {paymentStep === 'plan' ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-2xl text-slate-900">Select Payment Plan</h3>
                <button onClick={() => setShowPaymentModal(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Daily */}
                <div onClick={() => setPaymentFreq('daily')} className={`border rounded-2xl p-4 cursor-pointer transition-all ${paymentFreq === 'daily' ? 'border-primary ring-1 ring-primary bg-purple-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentFreq === 'daily' ? 'border-primary' : 'border-slate-300'}`}>
                        {paymentFreq === 'daily' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <span className="font-bold text-slate-800 text-lg">Daily Payment</span>
                    </div>
                    <span className="font-bold text-primary text-xl">UGX {formatUGX(totalDaily)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm pl-8">
                    <span className="text-slate-500">Loan: <span className="font-medium text-slate-700">UGX {formatUGX(dailyLoan)}</span></span>
                    <span className="text-slate-500">Insurance: <span className="font-medium text-slate-700">UGX {formatUGX(dailyInsurance)}</span></span>
                  </div>
                </div>

                {/* Weekly */}
                <div onClick={() => setPaymentFreq('weekly')} className={`border rounded-2xl p-4 cursor-pointer transition-all ${paymentFreq === 'weekly' ? 'border-primary ring-1 ring-primary bg-purple-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentFreq === 'weekly' ? 'border-primary' : 'border-slate-300'}`}>
                        {paymentFreq === 'weekly' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <span className="font-bold text-slate-800 text-lg">Weekly Payment</span>
                    </div>
                    <span className="font-bold text-primary text-xl">UGX {formatUGX(totalWeekly)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm pl-8">
                    <span className="text-slate-500">Loan: <span className="font-medium text-slate-700">UGX {formatUGX(weeklyLoan)}</span></span>
                    <span className="text-slate-500">Insurance: <span className="font-medium text-slate-700">UGX {formatUGX(weeklyInsurance)}</span></span>
                  </div>
                </div>

                {/* Monthly */}
                <div onClick={() => setPaymentFreq('monthly')} className={`border rounded-2xl p-4 cursor-pointer transition-all ${paymentFreq === 'monthly' ? 'border-primary ring-1 ring-primary bg-purple-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentFreq === 'monthly' ? 'border-primary' : 'border-slate-300'}`}>
                        {paymentFreq === 'monthly' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <span className="font-bold text-slate-800 text-lg">Monthly Payment</span>
                    </div>
                    <span className="font-bold text-primary text-xl">UGX {formatUGX(totalMonthly)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm pl-8">
                    <span className="text-slate-500">Loan: <span className="font-medium text-slate-700">UGX {formatUGX(monthlyLoan)}</span></span>
                    <span className="text-slate-500">Insurance: <span className="font-medium text-slate-700">UGX {formatUGX(monthlyInsurance)}</span></span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setPaymentStep('method')}
                className="w-full font-bold py-4 rounded-xl transition-all bg-primary hover:bg-purple-800 text-white shadow-lg shadow-primary/30 text-lg"
              >
                Continue
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-xl text-slate-900">Select Payment Method</h3>
                  <p className="text-sm text-slate-500">How would you like to pay?</p>
                </div>
                <button onClick={() => setShowPaymentModal(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <button onClick={() => navigate(`/payment-details?method=wallet&carId=${car.id}&plan=${paymentFreq}`)} className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all">
                  <span className="font-bold text-slate-700">Welile Wallet</span>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
                <button onClick={() => navigate(`/payment-details?method=mobile_money&carId=${car.id}&plan=${paymentFreq}`)} className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all">
                  <span className="font-bold text-slate-700">Mobile Money</span>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
                <button onClick={() => navigate(`/payment-details?method=card&carId=${car.id}&plan=${paymentFreq}`)} className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all">
                  <span className="font-bold text-slate-700">Bank Card</span>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
                <button onClick={() => navigate(`/payment-details?method=bank&carId=${car.id}&plan=${paymentFreq}`)} className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all">
                  <span className="font-bold text-slate-700">Bank Transfer</span>
                  <ChevronRight size={18} className="text-slate-400" />
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    )}

  </>
  );
};

const StoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
)

export default CarDetailsPage;
