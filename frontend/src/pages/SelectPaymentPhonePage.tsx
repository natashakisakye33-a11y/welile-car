 
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { useProfile, useDeposit } from '@/hooks/useProfile';
import { formatUGX } from '@/lib/format';

const SelectPaymentPhonePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const method = searchParams.get('method');
  const amount = parseInt(searchParams.get('amount') || '0', 10);
  
  const { data: profile } = useProfile();
  const { mutateAsync: makeDeposit } = useDeposit();
  
  const [selectedPhone, setSelectedPhone] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ussdMessage, setUssdMessage] = useState('');

  useEffect(() => {
    if (profile?.phone && !useCustom) {
      setSelectedPhone(profile.phone);
    }
  }, [profile, useCustom]);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    
    const phoneToUse = useCustom ? customPhone : selectedPhone;
    if (!phoneToUse) {
      alert('Please select or enter a valid phone number');
      return;
    }

    setIsProcessing(true);
    try {
      setUssdMessage(`Sending prompt to ${phoneToUse}...`);
      await makeDeposit({ amount, method: method || 'mtn' });
      
      setUssdMessage('Waiting for PIN confirmation...');
      setTimeout(() => {
        setIsProcessing(false);
        setUssdMessage('');
        setSuccess(true);
        setTimeout(() => navigate('/wallet'), 3000);
      }, 3000);
    } catch (err: any) {
      setIsProcessing(false);
      setUssdMessage('');
      alert(err.message || 'Transaction failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border/40 p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary/50 text-foreground">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold font-heading">Choose Mobile Number</h1>
      </header>

      <main className="p-4 max-w-lg mx-auto mt-4">
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
              <p className="text-muted-foreground text-lg">Your payment of <strong>{formatUGX(amount)}</strong> has been processed.</p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/50 mb-6 text-center">
                 <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mb-2">Amount to Pay</p>
                 <p className="font-bold text-3xl leading-tight text-primary">{formatUGX(amount)}</p>
              </div>

              <form onSubmit={handleConfirm} className="space-y-4">
                <h3 className="font-bold font-heading text-lg mb-2">Select Number to Pay From</h3>
                
                {profile?.phone && (
                  <div 
                    className={`p-4 rounded-xl border-2 transition-colors cursor-pointer flex items-center justify-between ${!useCustom ? 'border-primary bg-primary/5' : 'border-border/50 bg-white hover:border-primary/50'}`}
                    onClick={() => setUseCustom(false)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary">person</span>
                      </div>
                      <div>
                        <p className="font-bold text-lg">{profile.phone}</p>
                        <p className="text-xs text-muted-foreground">My registered number</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${!useCustom ? 'border-primary' : 'border-outline-variant'}`}>
                      {!useCustom && <div className="w-3 h-3 bg-primary rounded-full" />}
                    </div>
                  </div>
                )}

                <div 
                  className={`p-4 rounded-xl border-2 transition-colors cursor-pointer flex items-center justify-between ${useCustom ? 'border-primary bg-primary/5' : 'border-border/50 bg-white hover:border-primary/50'}`}
                  onClick={() => setUseCustom(true)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">add</span>
                    </div>
                    <div>
                      <p className="font-bold text-lg">Use a different number</p>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${useCustom ? 'border-primary' : 'border-outline-variant'}`}>
                    {useCustom && <div className="w-3 h-3 bg-primary rounded-full" />}
                  </div>
                </div>

                {useCustom && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                    <input 
                      type="tel" 
                      required
                      placeholder={method === 'mtn' ? '077/078...' : '070/075...'}
                      className="w-full h-14 bg-surface rounded-xl px-4 border-2 border-border focus:border-primary focus:ring-0 outline-none transition-colors text-lg"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      autoFocus
                    />
                  </motion.div>
                )}

                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="w-full h-14 gradient-primary text-primary-foreground font-bold rounded-2xl disabled:opacity-50 text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-8"
                >
                  {isProcessing ? 'Connecting...' : 'Send Payment Prompt'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default SelectPaymentPhonePage;
