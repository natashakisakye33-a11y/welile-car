import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, CheckCircle2, Clock, FileText, ChevronRight, Download } from 'lucide-react';
import { formatUGX } from '@/lib/format';
import { useProfile } from '@/hooks/useProfile';
import { carsData } from '@/data/cars';
import { toast } from 'sonner';

const RepaymentsPage = () => {
  const { data: profile, isLoading } = useProfile();
  const [isProcessing, setIsProcessing] = useState(false);

  if (isLoading) {
    return <div className="p-8 flex justify-center items-center min-h-[400px] text-slate-400 font-medium">Loading Repayment Data...</div>;
  }

  const [car, setCar] = useState<any>(null);
  const [carLoading, setCarLoading] = useState(false);

  React.useEffect(() => {
    if (profile?.selected_car_id) {
      setCarLoading(true);
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/vehicles/${profile.selected_car_id}`)
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

  if (carLoading) {
    return <div className="p-8 flex justify-center items-center min-h-[400px] text-slate-400 font-medium">Loading Vehicle...</div>;
  }

  if (!car) {
    return <div className="p-8 flex justify-center items-center min-h-[400px] text-slate-400 font-medium">No vehicle selected.</div>;
  }

  // Mock Repayment Data
  const totalLoan = (car.priceUgx * 0.7) * 1.3; // 70% financed + 30% interest
  const amountPaid = totalLoan * 0.35; // 35% paid
  const remainingBalance = totalLoan - amountPaid;
  const progressPercent = (amountPaid / totalLoan) * 100;
  
  const nextPaymentAmount = totalLoan / 36; // Monthly equivalent

  const paymentHistory = [
    { id: 'TRX-9982', date: 'Oct 01, 2026', amount: nextPaymentAmount, status: 'Completed', method: 'MTN Mobile Money' },
    { id: 'TRX-8821', date: 'Sep 01, 2026', amount: nextPaymentAmount, status: 'Completed', method: 'Airtel Money' },
    { id: 'TRX-7743', date: 'Aug 01, 2026', amount: nextPaymentAmount, status: 'Completed', method: 'MTN Mobile Money' },
  ];

  const handleMakePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Payment Successful!", {
        description: `Your payment of ${formatUGX(nextPaymentAmount)} has been received.`
      });
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Repayments</h1>
          <p className="text-slate-500 font-medium mt-1">Track and manage your vehicle financing</p>
        </div>
      </div>

      {/* Progress Overview Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
        <div className="w-full md:w-1/2">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Paid</p>
              <h2 className="text-3xl font-black text-emerald-500">{formatUGX(amountPaid)}</h2>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Loan</p>
              <p className="text-xl font-bold text-slate-900">{formatUGX(totalLoan)}</p>
            </div>
          </div>
          
          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden mb-3">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
          
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-emerald-600">{Math.round(progressPercent)}% Completed</span>
            <span className="text-slate-500">Remaining: <span className="text-slate-900 font-bold">{formatUGX(remainingBalance)}</span></span>
          </div>
        </div>

        <div className="w-px h-32 bg-slate-100 hidden md:block"></div>

        <div className="w-full md:w-1/2 bg-slate-50 rounded-2xl p-6 border border-slate-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Next Payment Due</p>
              <p className="text-2xl font-black text-slate-900">{formatUGX(nextPaymentAmount)}</p>
            </div>
            <div className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Clock size={12} /> In 14 Days
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-slate-500 text-sm font-medium mb-6">
            <Calendar size={16} /> Due on Nov 01, 2026
          </div>
          
          <button 
            onClick={handleMakePayment}
            disabled={isProcessing}
            className="w-full py-3.5 bg-primary text-white font-bold rounded-xl transition-all shadow-md shadow-primary/20 hover:bg-[#3f2bc2] flex items-center justify-center disabled:opacity-70"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2"><CreditCard size={18} /> Make Payment</span>
            )}
          </button>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText size={20} className="text-primary" /> Payment History
          </h3>
          <button 
            onClick={() => {
              toast.success("Generating Statement", { description: "Your payment statement is ready to be printed or saved as PDF." });
              setTimeout(() => window.print(), 1000);
            }}
            className="text-primary text-sm font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Download size={14} /> Statement
          </button>
        </div>
        
        <div className="divide-y divide-slate-50">
          {paymentHistory.map((tx, idx) => (
            <motion.div 
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-0.5">{formatUGX(tx.amount)}</h4>
                  <p className="text-xs text-slate-500 font-medium">{tx.method} • {tx.id}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-4">
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 mb-0.5">{tx.date}</p>
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">{tx.status}</p>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <button className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">
            View Older Transactions
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepaymentsPage;
