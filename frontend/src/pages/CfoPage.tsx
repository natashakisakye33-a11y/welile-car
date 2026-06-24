 
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  useAllProfiles,
  useCfoRequests,
  useResolveCfoRequest,
  usePendingDeposits,
  useApproveDeposit,
  useRejectDeposit,
  usePendingWithdrawals,
  useApproveWithdrawal,
  useRejectWithdrawal,
} from '@/hooks/useAdmin';
import { CARS } from '@/hooks/useProfile';
import { formatUGX } from '@/lib/format';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const CfoPage = () => {
  const { isCfo, loading: authLoading, signOut, signIn } = useAuth();
  const navigate = useNavigate();
  
  const { data: users = [], isLoading: usersLoading } = useAllProfiles();
  const { data: requests = [], isLoading: requestsLoading } = useCfoRequests();
  const resolveRequest = useResolveCfoRequest();
  
  const { data: pendingDeposits = [], isLoading: depositsLoading } = usePendingDeposits();
  const approveDeposit = useApproveDeposit();
  const rejectDeposit = useRejectDeposit();

  const { data: pendingWithdrawals = [], isLoading: withdrawalsLoading } = usePendingWithdrawals();
  const approveWithdrawal = useApproveWithdrawal();
  const rejectWithdrawal = useRejectWithdrawal();

  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [requestTab, setRequestTab] = useState<'pending' | 'resolved'>('pending');
  const [activePanelTab, setActivePanelTab] = useState<'operations' | 'statements'>('operations');

  const [email, setEmail] = useState('cfo@admin.com');
  const [password, setPassword] = useState('cfo123');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleCfoLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setLoginError(error);
      } else {
        toast.success("Welcome back, Chief Financial Officer!");
      }
    } catch (err) {
      setLoginError('An error occurred during authentication.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleResolve = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      await resolveRequest.mutateAsync({ requestId, status });
      toast.success(`Request ${status === 'approved' ? 'approved' : 'rejected'} successfully.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve request");
    }
  };

  const handleDepositAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await approveDeposit.mutateAsync(id);
        toast.success('Deposit approved securely.');
      } else {
        await rejectDeposit.mutateAsync(id);
        toast.success('Deposit rejected.');
      }
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} deposit`);
    }
  };

  const handleWithdrawalAction = async (id: number, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await approveWithdrawal.mutateAsync(id);
        toast.success('Withdrawal approved and funds released.');
      } else {
        await rejectWithdrawal.mutateAsync(id);
        toast.success('Withdrawal rejected, funds refunded to user.');
      }
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} withdrawal`);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-[#4C158D] rounded-full animate-spin"></div>
        <div className="text-slate-500 font-bold text-sm tracking-wide">Verifying CFO credentials...</div>
      </div>
    );
  }

  // CFO Gateway Login
  if (!isCfo) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 px-4 py-12 text-white font-sans selection:bg-primary/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[440px] bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 sm:p-10 rounded-[32px] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-[-50px] right-[-50px] w-48 h-48 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

          <div className="text-center mb-8 relative z-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <h1 className="font-chewy text-4xl tracking-wide mb-1.5 text-white">Welile Cars</h1>
            <p className="text-emerald-300/80 font-bold text-xs uppercase tracking-widest">CFO Dashboard Gateway</p>
            <p className="text-slate-400 text-sm font-medium mt-3">
              Restricted financial area. Sign in with Chief Financial Officer credentials to approve lines of credit and inspect audits.
            </p>
          </div>

          <form onSubmit={handleCfoLogin} className="space-y-4 relative z-10">
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">CFO Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="cfo@admin.com"
                className="w-full h-13 px-4 rounded-xl bg-slate-950/60 border border-slate-800 outline-none focus:border-emerald-500 transition text-sm font-semibold text-white placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-13 px-4 rounded-xl bg-slate-950/60 border border-slate-800 outline-none focus:border-emerald-500 transition text-sm font-semibold text-white placeholder:text-slate-600"
              />
            </div>

            {loginError && (
              <p className="text-red-400 text-xs font-semibold text-center mt-2">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full h-13 mt-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[14px] rounded-xl transition disabled:opacity-50 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {loginLoading ? 'Checking ledger...' : 'Unlock CFO Dashboard'}
            </button>
          </form>

          <div className="relative z-10 border-t border-slate-800/80 mt-6 pt-6 flex flex-col gap-3">
            <button
              onClick={() => handleCfoLogin()}
              disabled={loginLoading}
              className="w-full h-11 bg-white/5 border border-white/10 hover:bg-white/10 text-emerald-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              <span>Instant CFO Login</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full h-11 bg-slate-950/40 hover:bg-slate-950 text-slate-400 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              <span>Return to Home</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Dashboard calculations
  const getMockTransactionsForUser = (userId: string) => {
    const stored = localStorage.getItem(`mockTx_${userId}`);
    return stored ? JSON.parse(stored) : [];
  };

  const allPayments = users.flatMap(user => {
    const txs = getMockTransactionsForUser(user.user_id);
    return txs
      .filter((tx: any) => tx.type === 'deposit')
      .map((tx: any) => ({
        ...tx,
        userName: user.name,
        userPhone: user.phone,
      }));
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filteredPayments = allPayments.filter(payment => {
    const matchesSearch = payment.userName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
                          payment.userPhone.includes(paymentSearch) ||
                          payment.method.toLowerCase().includes(paymentSearch.toLowerCase());
    const matchesMethod = paymentMethodFilter === 'all' || payment.method === paymentMethodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalCustomerSavings = users.reduce((sum, u) => sum + u.wallet_balance, 0);
  const totalGrowthCredited = users.reduce((sum, u) => sum + u.growth_earned, 0);
  const totalTransactionsVolume = allPayments.reduce((sum, tx) => sum + tx.amount, 0);
  
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const resolvedRequests = requests.filter(r => r.status !== 'pending');

  const activeRequests = requestTab === 'pending' ? pendingRequests : resolvedRequests;

  return (
    <div className="bg-background text-on-surface font-body-md selection:bg-primary-container selection:text-on-primary-container min-h-screen">
      <style>{`
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .glass-header {
            background: linear-gradient(135deg, rgba(52, 0, 104, 0.95) 0%, rgba(78, 21, 142, 0.9) 100%);
            backdrop-filter: blur(8px);
        }
        .active-tab-indicator {
            position: absolute;
            bottom: -1px;
            left: 0;
            height: 2px;
            background-color: #340068;
            transition: all 0.3s ease;
        }
      `}</style>
      
      {/* Top AppBar (Merged & Sticky) */}
      <header className="bg-surface sticky top-0 z-50 w-full border-b border-outline-variant transition-colors duration-200">
        <div className="flex justify-between items-center px-4 lg:px-8 h-16 w-full">
          
          {/* Left: CFO Indicator */}
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden text-on-primary-container font-bold text-xs">
              CFO
            </div>
            <span className="font-headline-sm text-[16px] sm:text-headline-sm font-bold text-primary hidden sm:block">FinOps Central</span>
          </div>

          {/* Center: Welile Cars Logo */}
          <div className="flex justify-center items-center flex-1">
            <img src="/welile_car_logo.png" alt="Welile Cars Logo" className="h-10 sm:h-12 object-contain" />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-2 flex-1">
            <button onClick={handleLogout} className="p-2 sm:px-4 sm:py-2 rounded-full sm:rounded-lg hover:bg-error/10 transition-colors duration-200 text-error flex items-center gap-2">
              <span className="hidden sm:block text-sm font-bold">Sign Out</span>
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>

        </div>
      </header>

      <main className="pb-24 w-full">
        {/* Hero Header Area */}
        <section className="glass-header text-white px-4 py-8 relative overflow-hidden rounded-b-3xl">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest opacity-80">CHIEF FINANCIAL OFFICER AREA</span>
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-white mb-4">CFO Ledger &amp; Control Portal</h1>
            <div className="flex gap-2">
              <button onClick={() => navigate('/admin')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all text-sm font-medium border border-white/10 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">settings_suggest</span>
                Operations Panel
              </button>
            </div>
          </div>
        </section>

        {/* Metric Row (Horizontal Scroll) */}
        <section className="px-4 -mt-6 relative z-20">
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-1 px-1">
            <div className="min-w-[200px] flex-shrink-0 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Total Savings</span>
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                </div>
              </div>
              <div className="font-headline-sm text-headline-sm text-on-surface mb-1">{formatUGX(totalCustomerSavings)}</div>
              <div className="flex items-center gap-1 text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">account_balance</span>
                <span className="text-[12px] font-medium">Held in Escrow</span>
              </div>
            </div>

            <div className="min-w-[200px] flex-shrink-0 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Growth Credited</span>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">trending_up</span>
                </div>
              </div>
              <div className="font-headline-sm text-headline-sm text-on-surface mb-1">{formatUGX(totalGrowthCredited)}</div>
              <div className="flex items-center gap-1 text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">auto_graph</span>
                <span className="text-[12px] font-medium">2% - 5% Yields</span>
              </div>
            </div>

            <div className="min-w-[200px] flex-shrink-0 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Platform Volume</span>
                <div className="w-8 h-8 rounded-full bg-tertiary-container/10 flex items-center justify-center text-tertiary-container">
                  <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                </div>
              </div>
              <div className="font-headline-sm text-headline-sm text-on-surface mb-1">{formatUGX(totalTransactionsVolume)}</div>
              <div className="flex items-center gap-1 text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">group</span>
                <span className="text-[12px] font-medium">From {users.length} depositor{users.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="min-w-[200px] flex-shrink-0 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Awaiting CFO</span>
                <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center text-error">
                  <span className="material-symbols-outlined text-[18px]">lock_clock</span>
                </div>
              </div>
              <div className="font-headline-sm text-headline-sm text-on-surface mb-1 text-error">{pendingRequests.length}</div>
              <div className="flex items-center gap-1 text-error">
                <span className="material-symbols-outlined text-[14px]">error</span>
                <span className="text-[12px] font-medium">Action Required</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tabbed Navigation */}
        <section className="mt-4 border-b border-outline-variant bg-surface sticky top-16 z-30">
          <div className="flex px-4">
            <button 
              onClick={() => setActivePanelTab('operations')}
              className={`flex items-center gap-2 py-4 px-2 relative font-bold ${activePanelTab === 'operations' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
            >
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              <span className="font-label-md text-label-md">Operations &amp; Payments</span>
              {activePanelTab === 'operations' && <div className="active-tab-indicator w-full"></div>}
            </button>
            <button 
              onClick={() => setActivePanelTab('statements')}
              className={`flex items-center gap-2 py-4 px-6 transition-colors ${activePanelTab === 'statements' ? 'text-primary font-bold relative' : 'text-on-surface-variant hover:text-primary font-label-md'}`}
            >
              <span className="material-symbols-outlined text-[20px]">description</span>
              <span className="font-label-md text-label-md">Financial Statements</span>
              {activePanelTab === 'statements' && <div className="active-tab-indicator w-full"></div>}
            </button>
          </div>
        </section>

        {activePanelTab === 'operations' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
            {/* Credit & Financing Queue */}
            <section>
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm h-full">
                <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/30">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="material-symbols-outlined text-primary text-[20px]">clinical_notes</span>
                      <h2 className="font-headline-sm text-[16px] text-on-surface">Credit &amp; Financing Requests</h2>
                    </div>
                    <p className="text-[12px] text-on-surface-variant">Admin-submitted approvals awaiting CFO sign-off</p>
                  </div>
                  <div className="flex bg-surface-container-high rounded-lg p-0.5">
                    <button onClick={() => setRequestTab('pending')} className={`text-[10px] font-bold px-2 py-1 rounded shadow-sm transition-colors ${requestTab === 'pending' ? 'bg-surface text-primary' : 'text-on-surface-variant'}`}>
                      Pending ({pendingRequests.length})
                    </button>
                    <button onClick={() => setRequestTab('resolved')} className={`text-[10px] font-bold px-2 py-1 rounded shadow-sm transition-colors ${requestTab === 'resolved' ? 'bg-surface text-primary' : 'text-on-surface-variant'}`}>
                      History ({resolvedRequests.length})
                    </button>
                  </div>
                </div>
                
                <div className="p-4 space-y-4">
                  {activeRequests.map(req => (
                    <div key={req.id} className="border border-primary-container/20 rounded-lg p-4 bg-primary/5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {req.type.replace('_', ' ')}
                          </span>
                          <div className="flex items-center gap-1 text-on-surface-variant mt-2">
                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                            <span className="text-[11px] font-medium">{new Date(req.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          req.status === 'pending' ? 'bg-tertiary-container/20 text-on-tertiary-container' :
                          req.status === 'approved' ? 'bg-secondary/20 text-secondary' :
                          'bg-error/20 text-error'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="mb-4">
                        <h3 className="font-headline-sm text-[18px] text-on-surface">{req.userName}</h3>
                        <p className="text-on-surface-variant text-sm">{req.userPhone}</p>
                      </div>
                      <div className="bg-white/50 rounded-lg p-3 mb-6 border border-white">
                        <span className="font-label-sm text-[10px] text-on-surface-variant uppercase block mb-1">Details &amp; Rationale</span>
                        <p className="text-sm text-on-surface leading-relaxed">
                          {req.details}
                        </p>
                      </div>
                      {req.status === 'pending' && (
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => handleResolve(req.id, 'approved')} className="bg-secondary text-white py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">verified</span>
                            Approve
                          </button>
                          <button onClick={() => handleResolve(req.id, 'rejected')} className="border border-error text-error py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-error/5 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">cancel</span>
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {activeRequests.length === 0 && (
                    <div className="text-center py-8 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[40px] opacity-50 mb-2">check_circle</span>
                      <p className="text-sm">No {requestTab} requests found.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Deposit Verification Queue */}
            <section>
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm h-full">
                <div className="p-4 flex justify-between items-center border-b border-outline-variant bg-surface-container-low/30">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">shield_lock</span>
                    <h2 className="font-headline-sm text-[16px] text-on-surface">Deposit Verification Queue</h2>
                  </div>
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full">{pendingDeposits.length} Pending</span>
                </div>
                <div className="divide-y divide-outline-variant">
                  {pendingDeposits.map(dep => (
                    <div key={dep.id} className="p-4 hover:bg-surface-container-low/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-on-surface uppercase">{dep.account.user.name}</h4>
                          <p className="text-xs text-on-surface-variant tracking-wider">{dep.account.user.phone}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-primary font-bold text-base">{formatUGX(dep.amount)}</div>
                          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{dep.provider || 'MTN'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button onClick={() => handleDepositAction(dep.id, 'approve')} className="flex-grow bg-primary hover:bg-primary-container text-white text-[12px] font-bold py-2 rounded-lg transition-colors">Verify & Approve</button>
                        <button onClick={() => handleDepositAction(dep.id, 'reject')} className="px-4 border border-outline-variant hover:border-error text-error py-2 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {pendingDeposits.length === 0 && (
                    <div className="text-center py-12 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[40px] opacity-50 mb-2">verified</span>
                      <p className="text-sm">All deposits verified</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Withdrawal Verification Queue */}
            <section>
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm h-full">
                <div className="p-4 flex justify-between items-center border-b border-outline-variant bg-surface-container-low/30">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[20px]">account_balance</span>
                    <h2 className="font-headline-sm text-[16px] text-on-surface">Withdrawal Verification Queue</h2>
                  </div>
                  <span className="bg-secondary/10 text-secondary text-[10px] font-bold px-3 py-1 rounded-full">{pendingWithdrawals.length} Pending</span>
                </div>
                <div className="divide-y divide-outline-variant max-h-[400px] overflow-y-auto custom-scrollbar">
                  {pendingWithdrawals.map((wd: any) => (
                    <div key={wd.id} className="p-4 hover:bg-surface-container-low/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-on-surface uppercase">{wd.account?.user?.name || 'Unknown'}</h4>
                          <p className="text-xs text-on-surface-variant tracking-wider">{wd.account?.user?.phone || ''}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-secondary font-bold text-base">{formatUGX(wd.amount)}</div>
                          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{wd.provider || 'MTN'}</span>
                        </div>
                      </div>
                      
                      {/* Payout Details */}
                      <div className="bg-surface-container-low p-3 rounded-lg mb-4 mt-2 border border-outline-variant">
                        <p className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2 border-b border-outline-variant pb-1">Payout Details</p>
                        {wd.provider === 'bank' ? (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-on-surface-variant">Bank:</div><div className="font-medium text-on-surface">{wd.withdrawalBank}</div>
                            <div className="text-on-surface-variant">Acct Name:</div><div className="font-medium text-on-surface">{wd.withdrawalName}</div>
                            <div className="text-on-surface-variant">Acct No:</div><div className="font-medium text-on-surface tracking-wider">{wd.withdrawalAccount}</div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="text-on-surface-variant">Network:</div><div className="font-medium text-on-surface uppercase">{wd.provider || 'MTN'}</div>
                            <div className="text-on-surface-variant">Name:</div><div className="font-medium text-on-surface">{wd.withdrawalName}</div>
                            <div className="text-on-surface-variant">Phone:</div><div className="font-medium text-on-surface tracking-wider">{wd.withdrawalPhone}</div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => handleWithdrawalAction(wd.id, 'approve')} className="flex-grow bg-secondary hover:bg-secondary-container text-white hover:text-on-secondary-container text-[12px] font-bold py-2 rounded-lg transition-colors border border-transparent hover:border-secondary">Release Funds</button>
                        <button onClick={() => handleWithdrawalAction(wd.id, 'reject')} className="px-4 border border-outline-variant hover:border-error text-error py-2 rounded-lg transition-colors">
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {pendingWithdrawals.length === 0 && (
                    <div className="text-center py-12 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[40px] opacity-50 mb-2">verified_user</span>
                      <p className="text-sm">All withdrawals processed</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Customer Payments Ledger */}
            <section className="lg:col-span-2">
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                <div className="p-4 flex justify-between items-center bg-surface-container-low/30">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[20px]">history</span>
                      <h2 className="font-headline-sm text-[16px] text-on-surface">Customer Payments Ledger</h2>
                    </div>
                    <p className="text-[12px] text-on-surface-variant">Real-time deposit monitoring log</p>
                  </div>
                  <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
                    <span className="material-symbols-outlined">download</span>
                  </button>
                </div>
                <div className="px-4 pb-4 mt-4">
                  <div className="flex gap-2 mb-6">
                    <div className="relative flex-grow">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                      <input 
                        value={paymentSearch}
                        onChange={e => setPaymentSearch(e.target.value)}
                        className="w-full bg-surface border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary transition-colors" 
                        placeholder="Search ledger..." 
                        type="text"
                      />
                    </div>
                  </div>
                  
                  {filteredPayments.length > 0 ? (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {filteredPayments.map((tx: any, idx: number) => (
                        <div key={tx.id || idx} className="flex justify-between items-center p-3 border border-outline-variant rounded-lg hover:bg-surface-container-low/30">
                          <div>
                            <p className="font-bold text-on-surface text-sm">{tx.userName}</p>
                            <p className="text-xs text-on-surface-variant">{tx.userPhone} • <span className="uppercase">{tx.method}</span></p>
                          </div>
                          <div className="text-right">
                            <p className="text-secondary font-bold text-sm">+{formatUGX(tx.amount)}</p>
                            <p className="text-xs text-on-surface-variant">{new Date(tx.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant/40">
                      <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-[40px]" style={{ fontVariationSettings: "'wght' 200" }}>info</span>
                      </div>
                      <p className="text-sm font-medium">No verified payments found</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        ) : (
          <div className="p-4 flex flex-col items-center justify-center py-20">
            <span className="material-symbols-outlined text-[64px] text-outline-variant mb-4">description</span>
            <h2 className="text-headline-md text-on-surface mb-2">Financial Statements</h2>
            <p className="text-body-md text-on-surface-variant text-center max-w-md">The financial statements view is being generated by the system. Please use the Operations Panel for now.</p>
          </div>
        )}
      </main>

      {/* BottomNavBar (Mobile only context) */}
      <nav className="fixed md:hidden bottom-0 w-full flex justify-around items-center h-20 pb-safe px-4 bg-surface-container border-t border-outline-variant z-50">
        <div onClick={() => setActivePanelTab('statements')} className={`flex flex-col items-center justify-center cursor-pointer transition-transform ${activePanelTab === 'statements' ? 'bg-primary-container text-on-primary-container rounded-xl px-4 py-2 scale-95' : 'text-on-surface-variant px-3 py-1 scale-95'}`}>
          <span className="material-symbols-outlined">description</span>
          <span className="font-label-sm text-label-sm mt-1">Statements</span>
        </div>
        <div onClick={() => setActivePanelTab('operations')} className={`flex flex-col items-center justify-center cursor-pointer transition-transform ${activePanelTab === 'operations' ? 'bg-primary-container text-on-primary-container rounded-xl px-4 py-2 scale-95' : 'text-on-surface-variant px-3 py-1 scale-95'}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activePanelTab === 'operations' ? "'FILL' 1" : "'FILL' 0" }}>admin_panel_settings</span>
          <span className="font-label-sm text-label-sm mt-1 font-bold">Portal</span>
        </div>
        <div onClick={() => navigate('/admin')} className="flex flex-col items-center justify-center cursor-pointer text-on-surface-variant px-3 py-1 scale-95 transition-transform">
          <span className="material-symbols-outlined">layers</span>
          <span className="font-label-sm text-label-sm mt-1">Admin</span>
        </div>
      </nav>
    </div>
  );
};

export default CfoPage;
