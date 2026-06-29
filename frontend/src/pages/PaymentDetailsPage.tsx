 
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CheckCircle2, Sparkles, Upload } from 'lucide-react';
import { carsData, Car } from '@/data/cars';
import { formatUGX } from '@/lib/format';
import { useDeposit, usePayFromWallet, useProfile } from '@/hooks/useProfile';
import { API_URL } from '@/config';

const PaymentDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const method = searchParams.get('method');
  const carId = searchParams.get('carId');
  const deficitStr = searchParams.get('deficit');
  const deficit = deficitStr ? parseInt(deficitStr, 10) : 0;

  const [car, setCar] = useState<Car | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ussdMessage, setUssdMessage] = useState('');
  const { mutateAsync: makeDeposit } = useDeposit();
  const { mutateAsync: payFromWallet } = usePayFromWallet();
  const { data: profile } = useProfile();

  // Form states
  const [amountToPay, setAmountToPay] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionTime, setTransactionTime] = useState(new Date().toTimeString().split(' ')[0].substring(0, 5));

  const amountParam = searchParams.get('amount');

  useEffect(() => {
    if (carId) {
      fetch(`${API_URL}/vehicles/${carId}`)
        .then(res => res.json())
        .then(foundCar => {
          if (foundCar && foundCar.id) {
            setCar(foundCar);
            if (amountParam) {
              setAmountToPay(amountParam);
            } else {
              setAmountToPay(foundCar.priceUgx.toString());
            }
          }
        })
        .catch(err => console.error('Failed to load car details for payment:', err));
    }
  }, [carId, amountParam]);

  const walletBalance = profile?.wallet_balance || 0;
  const parsedAmount = parseInt(amountToPay || '0', 10);
  const currentDeficit = method === 'wallet' ? Math.max(0, parsedAmount - walletBalance) : 0;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) return;
    setIsProcessing(true);
    
    try {
      if (method === 'mtn' || method === 'airtel' || method === 'mobile_money' || method === 'bank') {
        if ((method === 'mtn' || method === 'airtel') && (!phoneNumber || !buyerName)) {
          alert('Please enter both the Buyer Name and Mobile Number');
          setIsProcessing(false);
          return;
        }
        if (!transactionId || !transactionDate || !transactionTime) {
          alert('Please enter the Transaction ID, Date, and Time to submit your payment proof.');
          setIsProcessing(false);
          return;
        }
        
        setUssdMessage('Submitting payment proof for Finance verification...');
        
        // Call the real backend API
        await makeDeposit({ 
          amount: parsedAmount, 
          method: method === 'mobile_money' ? 'mtn' : method,
          transactionId,
          transactionDate,
          transactionTime
        });
        
        setTimeout(() => {
          setIsProcessing(false);
          setUssdMessage('');
          setSuccess(true);
          setTimeout(() => navigate('/dashboard'), 3000);
        }, 1500);
      } else if (method === 'wallet') {
        setUssdMessage('Processing payment securely from your wallet...');
        await payFromWallet({ amount: parsedAmount, reason: `Payment for ${car?.name || 'Vehicle'}` });
        
        setIsProcessing(false);
        setUssdMessage('');
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 3000);
      } else {
        // Fallback for mock flows (card)
        setTimeout(() => {
          setIsProcessing(false);
          setSuccess(true);
          const currentTotal = Number(localStorage.getItem('mockTotalPaid') || 0);
          localStorage.setItem('mockTotalPaid', (currentTotal + parsedAmount).toString());
          if (car) localStorage.setItem('mockPurchasedCarId', car.id);
          setTimeout(() => navigate('/dashboard'), 3000);
        }, 2000);
      }
    } catch (err: any) {
      setIsProcessing(false);
      setUssdMessage('');
      alert(err.message || 'Transaction failed. Please try again.');
    }
  };

  if (!car) {
    return (
      <div className="min-h-screen bg-background pb-20 flex flex-col">
        <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border/40 p-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary/50 text-foreground">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold font-heading">Payment Details</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center mt-20">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6">
            <span className="material-symbols-outlined text-5xl">directions_car</span>
          </div>
          <h2 className="text-2xl font-bold font-heading mb-2">No Vehicle Selected</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            It looks like you haven't selected a vehicle. Please go back and select a vehicle to proceed with your payment.
          </p>
          <button 
            onClick={() => navigate('/vehicles')} 
            className="w-full max-w-xs h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-colors"
          >
            Browse Vehicles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border/40 p-4 flex items-center gap-4">
        <Link to="/wallet" className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary/50 text-foreground">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-xl font-bold font-heading">Payment Details</h1>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        <AnimatePresence>
          {isProcessing && ussdMessage && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            >
              <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
                <h3 className="text-xl font-bold font-heading mb-2 text-slate-800">Awaiting PIN</h3>
                <p className="text-muted-foreground font-medium">{ussdMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-20 flex flex-col items-center text-center space-y-4"
            >
              <div className="w-24 h-24 bg-success/20 text-success rounded-full flex items-center justify-center mb-4">
                <Sparkles size={48} />
              </div>
              <h2 className="text-3xl font-bold font-heading">Payment Successful!</h2>
              <p className="text-muted-foreground text-lg">Your payment of <strong>{formatUGX(parsedAmount)}</strong> has been processed successfully.</p>
              <p className="text-sm mt-4 text-primary font-medium animate-pulse">Redirecting to Dashboard...</p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              
              {/* Order Summary */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/50 mb-6 flex gap-4 items-center">
                <img src={car.image} alt={car.name} className="w-24 h-16 object-contain mix-blend-multiply bg-secondary/50 rounded-lg p-1" />
                <div>
                  <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-1">Order Summary</p>
                  <p className="font-bold text-lg leading-tight">{car.name}</p>
                  <p className="text-primary font-bold">{formatUGX(car.priceUgx)}</p>
                </div>
              </div>

              <form onSubmit={handleConfirm} className="space-y-6">
                
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-border/50">
                  <label className="block text-sm font-semibold mb-2">Amount to Pay (UGX)</label>
                  <input 
                    type="number" 
                    required
                    min="1000"
                    max={car.priceUgx}
                    className="w-full h-14 bg-surface rounded-xl px-4 border-2 border-border focus:border-primary focus:ring-0 outline-none transition-colors text-lg font-bold"
                    value={amountToPay}
                    onChange={(e) => setAmountToPay(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    You can pay the full amount or make an installment payment.
                  </p>
                </div>
                
                {/* Mobile Money Form */}
                {(method === 'mtn' || method === 'airtel' || method === 'mobile_money') && (
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-border/50 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">phone_iphone</span>
                      </div>
                      <h3 className="font-bold font-heading text-lg">
                        {method === 'airtel' ? 'Airtel Money' : method === 'mtn' ? 'MTN MoMo' : 'Mobile Money'} Details
                      </h3>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2">Buyer's Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. John Doe"
                        className="w-full h-14 bg-surface rounded-xl px-4 border-2 border-border focus:border-primary focus:ring-0 outline-none transition-colors"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Mobile Number</label>
                      <input 
                        type="tel" 
                        required
                        placeholder={method === 'airtel' ? '070/075...' : '077/078/070/075...'}
                        className="w-full h-14 bg-surface rounded-xl px-4 border-2 border-border focus:border-primary focus:ring-0 outline-none transition-colors"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                    
                    <div className="pt-4 border-t border-border/50">
                      <p className="text-sm font-semibold mb-3">Payment Proof</p>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Transaction ID</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. 1234567890"
                            className="w-full h-12 bg-surface rounded-xl px-4 border border-border focus:border-primary focus:ring-0 outline-none transition-colors text-sm"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Date</label>
                            <input 
                              type="date" 
                              required
                              className="w-full h-12 bg-surface rounded-xl px-4 border border-border focus:border-primary focus:ring-0 outline-none transition-colors text-sm"
                              value={transactionDate}
                              onChange={(e) => setTransactionDate(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Time</label>
                            <input 
                              type="time" 
                              required
                              className="w-full h-12 bg-surface rounded-xl px-4 border border-border focus:border-primary focus:ring-0 outline-none transition-colors text-sm"
                              value={transactionTime}
                              onChange={(e) => setTransactionTime(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Please ensure your payment details are correct. The Finance Department will verify this transaction before it reflects on your account.
                    </p>
                  </div>
                )}

                {/* Credit Card Form */}
                {method === 'card' && (
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-border/50 space-y-4">
                     <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">credit_card</span>
                      </div>
                      <h3 className="font-bold font-heading text-lg">Credit Card Details</h3>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Card Number</label>
                      <input 
                        type="text" 
                        required
                        placeholder="0000 0000 0000 0000"
                        className="w-full h-14 bg-surface rounded-xl px-4 border-2 border-border focus:border-primary outline-none transition-colors"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Expiry Date</label>
                        <input 
                          type="text" 
                          required
                          placeholder="MM/YY"
                          className="w-full h-14 bg-surface rounded-xl px-4 border-2 border-border focus:border-primary outline-none transition-colors"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">CVV</label>
                        <input 
                          type="password" 
                          required
                          maxLength={3}
                          placeholder="***"
                          className="w-full h-14 bg-surface rounded-xl px-4 border-2 border-border focus:border-primary outline-none transition-colors"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Bank Transfer Form */}
                {method === 'bank' && (
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-border/50 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">account_balance</span>
                      </div>
                      <h3 className="font-bold font-heading text-lg">Bank Transfer Details</h3>
                    </div>
                    <div className="bg-surface p-4 rounded-xl border border-border/60">
                      <p className="text-sm text-muted-foreground mb-1">Bank Name</p>
                      <p className="font-bold mb-3">Stanbic Bank Uganda</p>
                      <p className="text-sm text-muted-foreground mb-1">Account Name</p>
                      <p className="font-bold mb-3">Welile Car Limited</p>
                      <p className="text-sm text-muted-foreground mb-1">Account Number</p>
                      <p className="font-mono text-lg font-bold text-primary tracking-wider">9030001234567</p>
                    </div>
                    <div className="pt-4 border-t border-border/50">
                      <p className="text-sm font-semibold mb-3">Transfer Proof Details</p>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Bank Receipt / Transaction Ref No.</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. FT231..."
                            className="w-full h-12 bg-surface rounded-xl px-4 border border-border focus:border-primary focus:ring-0 outline-none transition-colors text-sm"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Date of Transfer</label>
                            <input 
                              type="date" 
                              required
                              className="w-full h-12 bg-surface rounded-xl px-4 border border-border focus:border-primary focus:ring-0 outline-none transition-colors text-sm"
                              value={transactionDate}
                              onChange={(e) => setTransactionDate(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Time</label>
                            <input 
                              type="time" 
                              required
                              className="w-full h-12 bg-surface rounded-xl px-4 border border-border focus:border-primary focus:ring-0 outline-none transition-colors text-sm"
                              value={transactionTime}
                              onChange={(e) => setTransactionTime(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="block text-sm font-semibold mb-3">Upload Transfer Receipt (Optional)</label>
                      <button 
                        type="button"
                        onClick={() => setReceiptUploaded(true)}
                        className={`w-full h-14 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition-colors ${
                          receiptUploaded ? 'bg-success/10 border-success text-success' : 'border-primary/40 bg-primary/5 text-primary hover:bg-primary/10'
                        }`}
                      >
                        {receiptUploaded ? (
                          <><CheckCircle2 size={20} /> Receipt Attached</>
                        ) : (
                          <><Upload size={20} /> Tap to Upload PDF/Image</>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Wallet Form */}
                {method === 'wallet' && (
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-border/50 space-y-4 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                      <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
                    </div>
                    {currentDeficit > 0 ? (
                      <>
                        <h3 className="font-bold font-heading text-xl">Top Up Wallet</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          Your wallet balance is insufficient by <strong>{formatUGX(currentDeficit)}</strong> for this payment. Please top up via Mobile Money to proceed.
                        </p>
                        <div className="text-left mt-4">
                          <label className="block text-sm font-semibold mb-2">Mobile Number</label>
                          <input 
                            type="tel" 
                            required
                            placeholder="077/070..."
                            className="w-full h-14 bg-surface rounded-xl px-4 border-2 border-border focus:border-primary focus:ring-0 outline-none transition-colors"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="font-bold font-heading text-xl">Pay from Wallet</h3>
                        <p className="text-muted-foreground">
                          The amount of <strong>{formatUGX(parsedAmount || 0)}</strong> will be instantly deducted from your Welile Wallet balance.
                        </p>
                      </>
                    )}
                  </div>
                )}

                {method === 'wallet' && currentDeficit > 0 ? (
                  <div className="w-full p-4 bg-red-50 text-red-600 font-bold rounded-2xl text-center border border-red-200 mt-8">
                    Insufficient Funds - Deposit Required
                  </div>
                ) : (
                  <button 
                    type="submit"
                    disabled={
                      isProcessing || 
                      parsedAmount <= 0 ||
                      ((method === 'mtn' || method === 'airtel' || method === 'mobile_money' || method === 'bank') && (!transactionId || !transactionDate || !transactionTime)) ||
                      ((method === 'mtn' || method === 'airtel') && (!phoneNumber || !buyerName))
                    }
                    className="w-full h-14 gradient-primary text-primary-foreground font-bold rounded-2xl disabled:opacity-50 text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-8"
                  >
                    {isProcessing ? 'Processing Payment...' : 'Confirm Payment'}
                  </button>
                )}

              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default PaymentDetailsPage;
