/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '@/config';
import { fetchWithTimeout } from '@/lib/api';
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

  const [car, setCar] = useState<any | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [userSavings, setUserSavings] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'amount' | 'plan' | 'method'>('amount');
  const [paymentFreq, setPaymentFreq] = useState<'daily'|'weekly'|'monthly'>('monthly');
  const [savingsAmount, setSavingsAmount] = useState('5000');

  useEffect(() => {
    fetch(`${API_URL}/vehicles/${id}`, {
      headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}
    })
    .then(res => {
      if (!res.ok) throw new Error('Vehicle not found');
      return res.json();
    })
    .then(data => {
      setCar(data);
    })
    .catch(err => {
      console.error(err);
      toast.error('Vehicle not found');
      navigate('/vehicles');
    });
  }, [id, session, navigate]);

  useEffect(() => {
    if (session?.access_token) {
      fetchWithTimeout(`${API_URL}/dashboard/summary`, {
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

  const handlePaymentMethodSelect = async (method: string) => {
    try {
      await selectCar.mutateAsync({
        carId: car?.id || id,
        condition: car?.condition || 'used',
        price: car?.priceUgx || 0
      });
      toast.success('Vehicle selected as target!');
      setShowPaymentModal(false);
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to select vehicle.');
    }
  };


  if (!car || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const requiredDeposit = car.priceUgx * 0.3;
  const financedAmount = car.priceUgx * 0.7;
  const remainingNeeded = Math.max(0, requiredDeposit - userSavings);
  const isEligible = remainingNeeded === 0;

  const monthlyLoan = (financedAmount * 1.28) / 36;
  const monthlyInsurance = car.estimatedCosts?.insurance || (car.priceUgx * 0.08 / 12);
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
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}  className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-between hover:card-shadow transition-all">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 leading-tight tracking-tight">{car.name}</h2>
                    <p className="text-slate-500 font-bold uppercase tracking-wider text-sm mt-1">{car.specs.year} Model • {car.type} • {car.specs.transmission}</p>
                  </div>
                </div>
                <div className="mt-8 mb-4">
                  <div className="bg-gradient-to-br from-primary to-fuchsia-600 rounded-[1.5rem] p-6 text-white relative overflow-hidden shadow-xl shadow-primary/20 border border-white/10 group cursor-default">
                    <div className="absolute top-[-50%] right-[-10%] w-[200px] h-[200px] bg-white/20 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="absolute bottom-[-20%] left-[-10%] w-[150px] h-[150px] bg-fuchsia-400/30 rounded-full blur-[40px] pointer-events-none"></div>
                    <h4 className="font-black text-lg mb-2 flex items-center gap-2 relative z-10 tracking-tight">
                      <Star className="text-yellow-400 fill-yellow-400" size={20} /> Dream Big, Start Small
                    </h4>
                    <p className="text-white/90 text-lg font-medium leading-relaxed relative z-10">
                      Use <span className="text-yellow-400 font-black text-2xl ml-1">UGX 5,000</span> to own this car!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Start Saving Widget */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}  className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-center text-center h-full hover:card-shadow transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/5 rounded-full blur-[40px] pointer-events-none -z-10"></div>
              <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20"></div>
                <Star className="text-primary fill-primary" size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Your Journey Starts Here</h3>
              <p className="text-slate-500 font-medium mb-8 leading-relaxed px-4">
                Don't let big price tags hold you back. Start saving towards your {car.name} today and watch your money grow!
              </p>

              <div className="mt-auto">
                <button
<<<<<<< HEAD
                  onClick={() => navigate('/wallet')}
=======
                  onClick={() => {
                    setPaymentStep('amount');
                    setShowPaymentModal(true);
                  }}
>>>>>>> acf479d709a9666d96d6618fd4c7a1bada0e966d
                  className="w-full shimmer-btn font-black py-4 rounded-2xl transition-all bg-primary hover:bg-fuchsia-700 text-white shadow-xl shadow-primary/30 text-lg hover:-translate-y-1"
                >
                  Start with UGX 5,000
                </button>
              </div>
            </motion.div>
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
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}  className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:card-shadow transition-all">
              <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Vehicle Specifications</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                    <Settings className="text-slate-500" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Engine</p>
                    <p className="font-black text-slate-900 text-sm mt-0.5">{car.specs.engine}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                    <Fuel className="text-slate-500" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Fuel</p>
                    <p className="font-black text-slate-900 text-sm mt-0.5">{car.specs.fuel}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                    <Gauge className="text-slate-500" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Transmission</p>
                    <p className="font-black text-slate-900 text-sm mt-0.5">{car.specs.transmission}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                    <CarIcon className="text-slate-500" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Mileage</p>
                    <p className="font-black text-slate-900 text-sm mt-0.5">{car.specs.mileage}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                    <Users className="text-slate-500" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Seats</p>
                    <p className="font-black text-slate-900 text-sm mt-0.5">{car.specs.seats}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                    <Droplet className="text-slate-500" size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Color</p>
                    <p className="font-black text-slate-900 text-sm mt-0.5">{car.specs.color}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Features */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}  className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:card-shadow transition-all">
              <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Key Features</h3>
              <div className="flex flex-wrap gap-2.5">
                {car.features.map((feature, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-100 hover:border-primary/30 hover:bg-primary/5 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-colors">
                    {feature}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 gap-6">

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
            {paymentStep === 'amount' ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-2xl text-slate-900">Deposit Amount</h3>
                    <p className="text-sm text-slate-500">Start saving towards your dream car.</p>
                  </div>
                  <button onClick={() => setShowPaymentModal(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-200 shadow-inner">
                  <h4 className="font-bold text-slate-800 mb-3 text-sm uppercase tracking-wider">Financing Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vehicle Price</span>
                      <span className="font-bold text-slate-900">{formatUGX(car.priceUgx)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Your Deposit (30%)</span>
                      <span className="font-bold text-slate-900">{formatUGX(requiredDeposit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Financed Amount (70%)</span>
                      <span className="font-bold text-slate-900">{formatUGX(financedAmount)}</span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between">
                      <span className="font-bold text-slate-700">Total Loan to Repay</span>
                      <span className="font-black text-primary">{formatUGX(financedAmount * 1.28)}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-bold text-slate-700 mb-2">How much do you want to start with?</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">UGX</span>
                    <input
                      type="number"
                      value={savingsAmount}
                      onChange={(e) => setSavingsAmount(e.target.value)}
                      className="w-full h-16 bg-slate-50 border-2 border-slate-200 rounded-2xl pl-16 pr-4 text-2xl font-black text-primary focus:border-primary focus:ring-0 outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setPaymentStep('plan')}
                  className="w-full font-bold py-4 rounded-xl transition-all bg-primary hover:bg-purple-800 text-white shadow-lg shadow-primary/30 text-lg"
                >
                  Continue to Payment Plan
                </button>
              </>
            ) : paymentStep === 'plan' ? (
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
                      <span className="font-bold text-primary text-xl">{formatUGX(totalDaily)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm pl-8">
                      <span className="text-slate-500">Loan: <span className="font-medium text-slate-700">{formatUGX(dailyLoan)}</span></span>
                      <span className="text-slate-500">Insurance: <span className="font-medium text-slate-700">{formatUGX(dailyInsurance)}</span></span>
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
                      <span className="font-bold text-primary text-xl">{formatUGX(totalWeekly)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm pl-8">
                      <span className="text-slate-500">Loan: <span className="font-medium text-slate-700">{formatUGX(weeklyLoan)}</span></span>
                      <span className="text-slate-500">Insurance: <span className="font-medium text-slate-700">{formatUGX(weeklyInsurance)}</span></span>
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
                      <span className="font-bold text-primary text-xl">{formatUGX(totalMonthly)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm pl-8">
                      <span className="text-slate-500">Loan: <span className="font-medium text-slate-700">{formatUGX(monthlyLoan)}</span></span>
                      <span className="text-slate-500">Insurance: <span className="font-medium text-slate-700">{formatUGX(monthlyInsurance)}</span></span>
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
<<<<<<< HEAD
                  <button onClick={() => handlePaymentMethodSelect('wallet')} className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all">
                    <span className="font-bold text-slate-700">Welile Wallet</span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>
                  <button onClick={() => handlePaymentMethodSelect('mobile_money')} className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all">
                    <span className="font-bold text-slate-700">Mobile Money</span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>
                  <button onClick={() => handlePaymentMethodSelect('card')} className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all">
                    <span className="font-bold text-slate-700">Bank Card</span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>
                  <button onClick={() => handlePaymentMethodSelect('bank')} className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all">
=======
                  <button onClick={() => navigate(`/payment-details?method=wallet&carId=${car.id}&amount=${savingsAmount}`)} className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all">
                    <span className="font-bold text-slate-700">Welile Wallet</span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>
                  <button onClick={() => navigate(`/payment-details?method=mobile_money&carId=${car.id}&amount=${savingsAmount}`)} className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all">
                    <span className="font-bold text-slate-700">Mobile Money</span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>
                  <button onClick={() => navigate(`/payment-details?method=card&carId=${car.id}&amount=${savingsAmount}`)} className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all">
                    <span className="font-bold text-slate-700">Bank Card</span>
                    <ChevronRight size={18} className="text-slate-400" />
                  </button>
                  <button onClick={() => navigate(`/payment-details?method=bank&carId=${car.id}&amount=${savingsAmount}`)} className="w-full flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all">
>>>>>>> acf479d709a9666d96d6618fd4c7a1bada0e966d
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
