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
  type AdminProfile,
  type CfoRequest,
} from '@/hooks/useAdmin';
import { CARS } from '@/hooks/useProfile';
import { formatUGX } from '@/lib/format';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  LogOut,
  Unlock,
  AlertTriangle,
  History,
  FileText,
  ShieldCheck,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingDown,
  UserCheck
} from 'lucide-react';
import { useState } from 'react';
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

  // Filters & Search
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [requestTab, setRequestTab] = useState<'pending' | 'resolved'>('pending');
  const [activePanelTab, setActivePanelTab] = useState<'operations' | 'statements'>('operations');
  const [activeStatementSubTab, setActiveStatementSubTab] = useState<'income' | 'balance' | 'cashflow'>('income');

  // Login Form States
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
        toast.success('Withdrawal approved securely.');
      } else {
        await rejectWithdrawal.mutateAsync(id);
        toast.success('Withdrawal rejected. Funds refunded to user.');
      }
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} withdrawal`);
    }
  };

  const handleExportLedger = () => {
    toast.success("Platform financial ledger exported successfully (Mock download initiated).");
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
          {/* Subtle glow */}
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

  // Get all customer payments across all customer accounts
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

  // Filtered Payments Ledger
  const filteredPayments = allPayments.filter(payment => {
    const matchesSearch = payment.userName.toLowerCase().includes(paymentSearch.toLowerCase()) ||
                          payment.userPhone.includes(paymentSearch) ||
                          payment.method.toLowerCase().includes(paymentSearch.toLowerCase());
    
    const matchesMethod = paymentMethodFilter === 'all' || payment.method === paymentMethodFilter;
    
    return matchesSearch && matchesMethod;
  });

  // Unique Payment Methods for filter dropdown
  const paymentMethods = Array.from(new Set(allPayments.map(p => p.method)));

  // Calculate Metrics
  const totalCustomerSavings = users.reduce((sum, u) => sum + u.wallet_balance, 0);
  const totalGrowthCredited = users.reduce((sum, u) => sum + u.growth_earned, 0);
  const totalTransactionsVolume = allPayments.reduce((sum, tx) => sum + tx.amount, 0);
  
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const resolvedRequests = requests.filter(r => r.status !== 'pending');

  // Accounting Portfolios & Statements calculations
  const totalSavings = totalCustomerSavings;
  const totalGrowth = totalGrowthCredited;
  
  // Total referrals count & marketing cost
  const referralCount = users.filter(u => u.referred_by !== null).length;
  const referralExpense = referralCount * 50000;

  // Outstanding / Disbursed Financing Portfolio
  // If user is approved, the platform finances 70% of their selected car's price
  const activeFinancing = users.reduce((sum, u) => {
    if (u.financing_status === 'approved' && u.selected_car_id) {
      const car = CARS.find(c => c.id === u.selected_car_id);
      if (car) return sum + ((u.selected_car_price || car.price) * 0.7);
    }
    return sum;
  }, 0);

  // Administrative / Financing Fees (Revenue): 5% of active financing portfolio
  const financingRevenue = activeFinancing * 0.05;
  
  // Income Statement
  const netSurplus = financingRevenue - (totalGrowth + referralExpense);

  // Balance Sheet Equity & Liabilities
  const ownerCapital = 500000000; // UGX 500M base capital
  const retainedEarnings = netSurplus;
  const totalEquity = ownerCapital + retainedEarnings;
  const totalLiabilitiesAndEquity = totalSavings + totalEquity;

  // Balance Sheet Assets
  const cashInEscrow = totalSavings; // cash deposited by customers
  const operatingCash = ownerCapital - activeFinancing + netSurplus; // remaining cash after loan disbursement + profit
  const totalAssets = cashInEscrow + operatingCash + activeFinancing; // Cash + Financing Portfolio

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Failed to open print window. Please allow popups.");
      return;
    }

    const today = new Date().toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const reportHtml = `
      <html>
        <head>
          <title>Welile Cars - Financial Statements Report</title>
          <style>
            body {
              font-family: 'Inter', system-ui, sans-serif;
              padding: 50px;
              color: #0f172a;
              background-color: #ffffff;
              line-height: 1.5;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px double #cbd5e1;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo-title {
              font-size: 26px;
              font-weight: 800;
              color: #4C158D;
              letter-spacing: -0.5px;
            }
            .subtitle {
              font-size: 11px;
              text-transform: uppercase;
              font-weight: 700;
              color: #64748b;
              letter-spacing: 1px;
            }
            .meta-info {
              text-align: right;
              font-size: 12px;
              color: #475569;
            }
            .section-title {
              font-size: 16px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 8px;
              margin-top: 30px;
              margin-bottom: 15px;
              color: #1e293b;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 13px;
            }
            th, td {
              padding: 10px 12px;
              text-align: left;
            }
            th {
              background-color: #f8fafc;
              font-weight: 700;
              color: #475569;
              border-bottom: 1px solid #cbd5e1;
            }
            td {
              border-bottom: 1px solid #f1f5f9;
            }
            .text-right {
              text-align: right;
            }
            .font-bold {
              font-weight: 700;
            }
            .total-row td {
              border-top: 1px solid #94a3b8;
              border-bottom: 2px double #475569;
              font-weight: 700;
              background-color: #f8fafc;
            }
            .indent {
              padding-left: 25px;
            }
            .watermark {
              text-align: center;
              font-size: 10px;
              color: #94a3b8;
              margin-top: 60px;
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
            }
            .signature-block {
              display: flex;
              justify-content: space-between;
              margin-top: 60px;
            }
            .sig-line {
              width: 200px;
              border-top: 1px solid #94a3b8;
              margin-top: 45px;
              text-align: center;
              font-size: 11px;
              font-weight: 700;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div>
              <div class="logo-title">WELILE CARS LIMITED</div>
              <div class="subtitle">Official Financial Statements</div>
            </div>
            <div class="meta-info">
              <div><strong>Reporting Date:</strong> ${today}</div>
              <div><strong>Currency:</strong> Uganda Shilling (UGX)</div>
              <div><strong>Status:</strong> Unaudited / Certified by CFO</div>
            </div>
          </div>

          <p style="font-size: 12px; color: #64748b; margin-bottom: 30px;">
            This report presents the consolidated financial statement of Welile Cars Limited as of <strong>${today}</strong>. Calculations are compiled dynamically based on active platform customer escrow balances, yield growth disbursements, and regional vehicle financing contracts.
          </p>

          <!-- INCOME STATEMENT -->
          <div class="section-title">Income Statement (Profit & Loss)</div>
          <table>
            <thead>
              <tr>
                <th>Revenue & Operating Income</th>
                <th class="text-right">Amount (UGX)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="font-bold">Operating Revenue</td>
                <td></td>
              </tr>
              <tr>
                <td class="indent">Financing Portfolio Admin Fees (5%)</td>
                <td class="text-right">${formatUGX(financingRevenue)}</td>
              </tr>
              <tr class="total-row">
                <td>Total Revenue</td>
                <td class="text-right">${formatUGX(financingRevenue)}</td>
              </tr>
              
              <tr>
                <td class="font-bold">Operating Expenses</td>
                <td></td>
              </tr>
              <tr>
                <td class="indent">Interest Expense (Savings Yields Paid)</td>
                <td class="text-right">(${formatUGX(totalGrowth)})</td>
              </tr>
              <tr>
                <td class="indent">Referral Marketing Payouts (UGX 50,000 / ref)</td>
                <td class="text-right">(${formatUGX(referralExpense)})</td>
              </tr>
              <tr class="total-row">
                <td>Total Expenses</td>
                <td class="text-right">(${formatUGX(totalGrowth + referralExpense)})</td>
              </tr>
              
              <tr class="total-row" style="background-color: #f1f5f9;">
                <td class="font-bold">Net Operational Surplus (Net Profit)</td>
                <td class="text-right font-bold" style="color: ${netSurplus >= 0 ? '#15803d' : '#be123c'};">
                  ${formatUGX(netSurplus)}
                </td>
              </tr>
            </tbody>
          </table>

          <!-- BALANCE SHEET -->
          <div class="section-title">Consolidated Balance Sheet</div>
          <table>
            <thead>
              <tr>
                <th>Assets</th>
                <th class="text-right">Amount (UGX)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="indent">Cash Held in Escrow (Customer Savings)</td>
                <td class="text-right">${formatUGX(cashInEscrow)}</td>
              </tr>
              <tr>
                <td class="indent">Corporate Operating Balance</td>
                <td class="text-right">${formatUGX(operatingCash)}</td>
              </tr>
              <tr>
                <td class="indent">Outstanding Financing Portfolio (70% Loans)</td>
                <td class="text-right">${formatUGX(activeFinancing)}</td>
              </tr>
              <tr class="total-row">
                <td class="font-bold">Total Assets</td>
                <td class="text-right">${formatUGX(totalAssets)}</td>
              </tr>
            </tbody>
          </table>

          <table>
            <thead>
              <tr>
                <th>Liabilities & Shareholder Equity</th>
                <th class="text-right">Amount (UGX)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="font-bold">Liabilities</td>
                <td></td>
              </tr>
              <tr>
                <td class="indent">Customer Deposits Escrow Liability</td>
                <td class="text-right">${formatUGX(totalSavings)}</td>
              </tr>
              <tr>
                <td class="font-bold">Shareholder Equity</td>
                <td></td>
              </tr>
              <tr>
                <td class="indent">Owner's Contributed Capital</td>
                <td class="text-right">${formatUGX(ownerCapital)}</td>
              </tr>
              <tr>
                <td class="indent">Retained Earnings (Net Profit)</td>
                <td class="text-right">${formatUGX(retainedEarnings)}</td>
              </tr>
              <tr class="total-row">
                <td class="font-bold">Total Liabilities & Equity</td>
                <td class="text-right">${formatUGX(totalLiabilitiesAndEquity)}</td>
              </tr>
            </tbody>
          </table>

          <!-- CASH FLOW STATEMENT -->
          <div class="section-title">Consolidated Cash Flow Statement</div>
          <table>
            <thead>
              <tr>
                <th>Cash Flow Activities</th>
                <th class="text-right">Amount (UGX)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="font-bold">Cash Flow from Operations</td>
                <td></td>
              </tr>
              <tr>
                <td class="indent">Customer Escrow Savings Inflows</td>
                <td class="text-right">${formatUGX(totalSavings)}</td>
              </tr>
              <tr>
                <td class="indent">Financing Fee Cash Inflow</td>
                <td class="text-right">${formatUGX(financingRevenue)}</td>
              </tr>
              <tr>
                <td class="indent">Savings Growth / Yield Disbursed Outflow</td>
                <td class="text-right">(${formatUGX(totalGrowth)})</td>
              </tr>
              <tr>
                <td class="indent">Referral Marketing Cash Outflow</td>
                <td class="text-right">(${formatUGX(referralExpense)})</td>
              </tr>
              
              <tr>
                <td class="font-bold">Cash Flow from Financing</td>
                <td></td>
              </tr>
              <tr>
                <td class="indent">Disbursement of 70% Vehicle Financing Loans</td>
                <td class="text-right">(${formatUGX(activeFinancing)})</td>
              </tr>
              <tr>
                <td class="indent">Owner Capital Contribution</td>
                <td class="text-right">${formatUGX(ownerCapital)}</td>
              </tr>
              
              <tr class="total-row" style="background-color: #f1f5f9;">
                <td class="font-bold">Net Increase in Cash & Equivalents</td>
                <td class="text-right font-bold">${formatUGX(cashInEscrow + operatingCash)}</td>
              </tr>
            </tbody>
          </table>

          <div class="signature-block">
            <div>
              <div class="sig-line">Prepared By: Chief Financial Officer</div>
            </div>
            <div>
              <div class="sig-line">Audited & Verified By: Managing Director</div>
            </div>
          </div>

          <div class="watermark">
            Welile Cars Ltd. · Plot 24 Kampala Road, Kampala, Uganda · Certified Electronic Record
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(reportHtml);
    printWindow.document.close();
    toast.success("Financial statement print view opened. Press Ctrl+P if the browser print dialog does not trigger automatically.");
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      
      {/* Premium Header */}
      <header className="bg-slate-900 text-white px-6 py-8 sm:px-12 rounded-b-[40px] shadow-xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-30%] right-[-10%] w-96 h-96 rounded-full bg-emerald-500 opacity-20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <p className="text-emerald-400 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
              <ShieldCheck size={14} /> Chief Financial Officer Area
            </p>
            <h1 className="font-chewy text-4xl tracking-wide mt-1 text-white">CFO Ledger & Control Portal</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-xl font-bold text-sm transition-all text-white/90"
            >
              <Layers size={16} />
              <span>Operations Panel</span>
            </button>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-5 py-2.5 rounded-xl font-bold text-sm transition-all text-red-300 hover:text-white"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
        
        {/* Financial Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md shadow-slate-100/50 flex flex-col justify-between h-32 relative overflow-hidden">
            <div className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Customer Savings</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{formatUGX(totalCustomerSavings)}</p>
            </div>
            <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-2">
              <ArrowUpRight size={12} /> Held in Escrow Accounts
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md shadow-slate-100/50 flex flex-col justify-between h-32 relative overflow-hidden">
            <div className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-[#4C158D]">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Growth Credited</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{formatUGX(totalGrowthCredited)}</p>
            </div>
            <p className="text-[10px] text-[#4C158D] font-bold flex items-center gap-0.5 mt-2">
              <TrendingUp size={12} /> 2% - 5% Yields Disbursed
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md shadow-slate-100/50 flex flex-col justify-between h-32 relative overflow-hidden">
            <div className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
              <ArrowUpRight size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gross Platform Volume</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{formatUGX(totalTransactionsVolume)}</p>
            </div>
            <p className="text-[10px] text-teal-600 font-bold flex items-center gap-0.5 mt-2">
              <Users size={12} /> From {users.length} depositors
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md shadow-slate-100/50 flex flex-col justify-between h-32 relative overflow-hidden">
            <div className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Unlock size={20} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Awaiting CFO Approval</p>
              <p className={`text-2xl font-black mt-1 ${pendingRequests.length > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-800'}`}>
                {pendingRequests.length}
              </p>
            </div>
            <p className="text-[10px] text-slate-400 font-bold flex items-center gap-0.5 mt-2">
              Action Required
            </p>
          </div>
        </div>

        {/* Main Panel Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActivePanelTab('operations')}
            className={`px-6 py-3 text-sm font-extrabold transition-all border-b-2 flex items-center gap-2 ${
              activePanelTab === 'operations'
                ? 'border-[#4C158D] text-[#4C158D]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Layers size={16} />
            <span>Operations & Payments</span>
          </button>
          <button
            onClick={() => setActivePanelTab('statements')}
            className={`px-6 py-3 text-sm font-extrabold transition-all border-b-2 flex items-center gap-2 ${
              activePanelTab === 'statements'
                ? 'border-[#4C158D] text-[#4C158D]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileText size={16} />
            <span>Financial Statements</span>
          </button>
        </div>

        {activePanelTab === 'operations' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: CFO Approvals Queue (7 columns) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 space-y-6">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                      <UserCheck size={20} className="text-[#4C158D]" />
                      Credit & Financing Requests Queue
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Admin-submitted approvals awaiting CFO sign-off</p>
                  </div>

                  <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setRequestTab('pending')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        requestTab === 'pending'
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Pending ({pendingRequests.length})
                    </button>
                    <button
                      onClick={() => setRequestTab('resolved')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        requestTab === 'resolved'
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      History ({resolvedRequests.length})
                    </button>
                  </div>
                </div>

                {/* Requests List */}
                <div className="space-y-4">
                  {(requestTab === 'pending' ? pendingRequests : resolvedRequests).map((req) => (
                    <motion.div
                      key={req.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${
                        req.status === 'pending'
                          ? 'border-amber-100 bg-amber-50/10 hover:border-amber-300'
                          : req.status === 'approved'
                          ? 'border-emerald-100 bg-emerald-50/10 hover:border-emerald-300'
                          : 'border-red-100 bg-red-50/10 hover:border-red-300'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              req.type === 'financing_approval' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {req.type === 'financing_approval' ? 'Financing Approval' : 'Unflag Request'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                              <Calendar size={10} /> {new Date(req.requested_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-slate-800 mt-2 text-sm">{req.user_name}</h4>
                          <p className="text-xs text-slate-400 font-semibold">{req.user_phone}</p>
                        </div>

                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3.5 mt-3 text-xs font-semibold text-slate-600 leading-relaxed">
                        <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Details & Rationale</p>
                        {req.details}
                      </div>

                      {req.status === 'pending' && (
                        <div className="flex gap-2.5 mt-4 pt-4 border-t border-slate-100/60">
                          <button
                            onClick={() => handleResolve(req.id, 'approved')}
                            className="flex-1 h-9.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-emerald-500/10"
                          >
                            <CheckCircle size={14} />
                            <span>Approve & Unlock</span>
                          </button>
                          <button
                            onClick={() => handleResolve(req.id, 'rejected')}
                            className="h-9.5 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                          >
                            <XCircle size={14} />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}

                      {req.status !== 'pending' && req.resolved_at && (
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mt-3 pt-3 border-t border-slate-100/60">
                          <span>Resolved by CFO</span>
                          <span>{new Date(req.resolved_at).toLocaleString()}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {((requestTab === 'pending' ? pendingRequests : resolvedRequests).length === 0) && (
                    <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                      <UserCheck size={36} className="text-slate-300 mx-auto mb-3 animate-pulse" />
                      <p className="text-sm font-bold text-slate-500">No requests in this queue</p>
                      <p className="text-xs text-slate-400 mt-1">Platform operations are fully cleared.</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Deposit Verification Queue */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 space-y-6 mt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                      <ShieldCheck size={20} className="text-indigo-500" />
                      Deposit Verification Queue
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Manual user deposits pending CFO approval</p>
                  </div>
                  <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold">
                    {pendingDeposits.length} Pending
                  </div>
                </div>

                <div className="space-y-4">
                  {depositsLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                    </div>
                  ) : pendingDeposits.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      <ShieldCheck size={32} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-500">No pending deposits</p>
                    </div>
                  ) : (
                    pendingDeposits.map((dep: any) => (
                      <div key={dep.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-extrabold text-slate-800 text-sm">{dep.account?.user?.name || 'Unknown User'}</h4>
                            <p className="text-xs text-slate-500 font-semibold">{dep.account?.user?.phone || 'N/A'}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-slate-800 text-base">{formatUGX(dep.amount)}</span>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{dep.provider || 'N/A'}</p>
                          </div>
                        </div>
                        
                        <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 font-semibold block">Transaction ID</span>
                            <span className="font-bold text-slate-700">{dep.providerRef || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold block">Date & Time</span>
                            <span className="font-bold text-slate-700">{dep.providerDate} {dep.providerTime}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => handleDepositAction(dep.id, 'approve')}
                            disabled={approveDeposit.isPending || rejectDeposit.isPending}
                            className="flex-1 h-9 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <CheckCircle size={14} />
                            <span>Verify & Approve</span>
                          </button>
                          <button
                            onClick={() => handleDepositAction(dep.id, 'reject')}
                            disabled={approveDeposit.isPending || rejectDeposit.isPending}
                            className="h-9 px-4 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                          >
                            <XCircle size={14} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Withdrawal Verification Queue */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 space-y-6 mt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                      <LogOut size={20} className="text-rose-500" />
                      Withdrawal Requests Queue
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">User withdrawal requests pending CFO approval</p>
                  </div>
                  <div className="bg-rose-50 text-rose-700 px-3 py-1 rounded-lg text-xs font-bold">
                    {pendingWithdrawals.length} Pending
                  </div>
                </div>

                <div className="space-y-4">
                  {withdrawalsLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-4 border-slate-200 border-t-rose-500 rounded-full animate-spin mx-auto"></div>
                    </div>
                  ) : pendingWithdrawals.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                      <ShieldCheck size={32} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-500">No pending withdrawals</p>
                    </div>
                  ) : (
                    pendingWithdrawals.map((dep: any) => (
                      <div key={dep.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-extrabold text-slate-800 text-sm">{dep.account?.user?.name || 'Unknown User'}</h4>
                            <p className="text-xs text-slate-500 font-semibold">{dep.account?.user?.phone || 'N/A'}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-rose-600 text-base">-{formatUGX(dep.amount)}</span>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{dep.provider || 'N/A'}</p>
                          </div>
                        </div>
                        
                        <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-2">
                          {dep.provider === 'bank' ? (
                            <>
                              <div className="flex justify-between">
                                <span className="text-slate-400 font-semibold">Bank</span>
                                <span className="font-bold text-slate-700">{dep.withdrawalBank || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400 font-semibold">Account Name</span>
                                <span className="font-bold text-slate-700">{dep.withdrawalName || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400 font-semibold">Account No.</span>
                                <span className="font-bold text-slate-700">{dep.withdrawalAccount || 'N/A'}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between">
                                <span className="text-slate-400 font-semibold">Mobile Money</span>
                                <span className="font-bold text-slate-700 uppercase">{dep.provider || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400 font-semibold">Registered Name</span>
                                <span className="font-bold text-slate-700">{dep.withdrawalName || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400 font-semibold">Phone</span>
                                <span className="font-bold text-slate-700">{dep.withdrawalPhone || 'N/A'}</span>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => handleWithdrawalAction(dep.id, 'approve')}
                            disabled={approveWithdrawal.isPending || rejectWithdrawal.isPending}
                            className="flex-1 h-9 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <CheckCircle size={14} />
                            <span>Approve & Release Funds</span>
                          </button>
                          <button
                            onClick={() => handleWithdrawalAction(dep.id, 'reject')}
                            disabled={approveWithdrawal.isPending || rejectWithdrawal.isPending}
                            className="h-9 px-4 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                          >
                            <XCircle size={14} />
                            <span>Reject & Refund</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Platform Payments Ledger (5 columns) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 space-y-6">
                
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                      <History size={20} className="text-emerald-500" />
                      Customer Payments Ledger
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Real-time deposit monitoring log</p>
                  </div>
                  <button
                    onClick={handleExportLedger}
                    className="w-9 h-9 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center transition-all shadow-sm"
                    title="Export to CSV"
                  >
                    <Download size={14} />
                  </button>
                </div>

                {/* Filter Row */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search ledger..."
                      value={paymentSearch}
                      onChange={e => setPaymentSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={paymentMethodFilter}
                      onChange={e => setPaymentMethodFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-emerald-500 text-slate-700 cursor-pointer"
                    >
                      <option value="all">All Methods</option>
                      {paymentMethods.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Payments Ledger Feed */}
                <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                  {filteredPayments.map((tx: any, idx: number) => (
                    <div
                      key={tx.id || idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center hover:bg-white hover:shadow-md transition-all duration-300"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-800 text-xs">{tx.userName}</span>
                          <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-0.5">
                            Verified
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold">{tx.userPhone}</p>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-400 pt-0.5">
                          <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-bold">{tx.method}</span>
                          <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="font-black text-emerald-600 text-sm">+{formatUGX(tx.amount)}</span>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Deposited</p>
                      </div>
                    </div>
                  ))}

                  {filteredPayments.length === 0 && (
                    <div className="text-center py-16 text-slate-400">
                      <History size={32} className="mx-auto text-slate-200 mb-2" />
                      <p className="text-xs font-bold">No verified payments found</p>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-8 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                  <FileText size={22} className="text-[#4C158D]" />
                  Corporate Financial Statements
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">Generated dynamically from active platform balances</p>
              </div>
              <button
                onClick={handleExportPDF}
                className="h-11 px-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20"
              >
                <Download size={14} />
                <span>Export PDF Report</span>
              </button>
            </div>

            {/* Sub Tabs for Statements */}
            <div className="flex gap-2 border-b border-slate-100 pb-4 overflow-x-auto">
              <button 
                onClick={() => setActiveStatementSubTab('income')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeStatementSubTab === 'income' 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                Income Statement
              </button>
              <button 
                onClick={() => setActiveStatementSubTab('balance')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeStatementSubTab === 'balance' 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                Balance Sheet
              </button>
              <button 
                onClick={() => setActiveStatementSubTab('cashflow')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeStatementSubTab === 'cashflow' 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                Cash Flow Statement
              </button>
            </div>

            {/* Content Sheets */}
            <div className="space-y-6">
              {activeStatementSubTab === 'income' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Statement of Comprehensive Income (Profit & Loss)</h4>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-xs font-semibold text-slate-700">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          <th className="p-4 text-left">Accounts & Line Items</th>
                          <th className="p-4 text-right">Amount (UGX)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-4 font-bold text-slate-800">Operating Revenue</td>
                          <td className="p-4 text-right"></td>
                        </tr>
                        <tr>
                          <td className="p-4 pl-8 text-slate-500">Portfolio Administrative Fees (5% on active financing)</td>
                          <td className="p-4 text-right text-slate-800 font-bold">{formatUGX(financingRevenue)}</td>
                        </tr>
                        <tr className="bg-slate-50 font-bold border-t border-slate-200">
                          <td className="p-4 pl-4 text-slate-800">Total Revenue</td>
                          <td className="p-4 text-right text-[#4C158D]">{formatUGX(financingRevenue)}</td>
                        </tr>

                        <tr>
                          <td className="p-4 font-bold text-slate-800 pt-6">Operating Expenses</td>
                          <td className="p-4 text-right"></td>
                        </tr>
                        <tr>
                          <td className="p-4 pl-8 text-slate-500">Yield Growth Disbursed (2% - 5% savings interest)</td>
                          <td className="p-4 text-right text-rose-600">({formatUGX(totalGrowth)})</td>
                        </tr>
                        <tr>
                          <td className="p-4 pl-8 text-slate-500">Referral Program Marketing Costs (UGX 50,000 / referral)</td>
                          <td className="p-4 text-right text-rose-600">({formatUGX(referralExpense)})</td>
                        </tr>
                        <tr className="bg-slate-50 font-bold border-t border-slate-200">
                          <td className="p-4 pl-4 text-slate-800">Total Expenses</td>
                          <td className="p-4 text-right text-rose-600">({formatUGX(totalGrowth + referralExpense)})</td>
                        </tr>

                        <tr className="bg-slate-100 font-black text-sm border-t-2 border-slate-300">
                          <td className="p-4 text-slate-800">Net Surplus (Net Profit)</td>
                          <td className={`p-4 text-right ${netSurplus >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatUGX(netSurplus)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeStatementSubTab === 'balance' && (
                <div className="space-y-6">
                  {/* Assets */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Balance Sheet - Assets</h4>
                    <div className="border border-slate-100 rounded-2xl overflow-hidden">
                      <table className="w-full text-xs font-semibold text-slate-700">
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="p-4 pl-6 text-slate-500">Cash Held in Escrow (Customer Deposits)</td>
                            <td className="p-4 text-right text-slate-800 font-bold">{formatUGX(cashInEscrow)}</td>
                          </tr>
                          <tr>
                            <td className="p-4 pl-6 text-slate-500">Corporate Liquid Reserve Balance</td>
                            <td className="p-4 text-right text-slate-800 font-bold">{formatUGX(operatingCash)}</td>
                          </tr>
                          <tr>
                            <td className="p-4 pl-6 text-slate-500">Outstanding Auto Loans Portfolio (70% Financing Asset)</td>
                            <td className="p-4 text-right text-slate-800 font-bold">{formatUGX(activeFinancing)}</td>
                          </tr>
                          <tr className="bg-slate-100 font-black text-sm border-t-2 border-slate-300">
                            <td className="p-4 text-slate-800">Total Assets</td>
                            <td className="p-4 text-right text-[#4C158D]">{formatUGX(totalAssets)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Liabilities & Equity */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Balance Sheet - Liabilities & Shareholder Equity</h4>
                    <div className="border border-slate-100 rounded-2xl overflow-hidden">
                      <table className="w-full text-xs font-semibold text-slate-700">
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="p-4 font-bold text-slate-800" colSpan={2}>Liabilities</td>
                          </tr>
                          <tr>
                            <td className="p-4 pl-8 text-slate-500">Customer Deposits Savings Liability</td>
                            <td className="p-4 text-right text-slate-800 font-bold">{formatUGX(totalSavings)}</td>
                          </tr>
                          <tr>
                            <td className="p-4 font-bold text-slate-800 pt-4" colSpan={2}>Shareholder Equity</td>
                          </tr>
                          <tr>
                            <td className="p-4 pl-8 text-slate-500">Owner's Contributed Capital</td>
                            <td className="p-4 text-right text-slate-800 font-bold">{formatUGX(ownerCapital)}</td>
                          </tr>
                          <tr>
                            <td className="p-4 pl-8 text-slate-500">Retained Earnings (Accumulated Surplus)</td>
                            <td className={`p-4 text-right font-bold ${retainedEarnings >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {formatUGX(retainedEarnings)}
                            </td>
                          </tr>
                          <tr className="bg-slate-100 font-black text-sm border-t-2 border-slate-300">
                            <td className="p-4 text-slate-800">Total Liabilities & Equity</td>
                            <td className="p-4 text-right text-[#4C158D]">{formatUGX(totalLiabilitiesAndEquity)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeStatementSubTab === 'cashflow' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Statement of Consolidated Cash Flows</h4>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-xs font-semibold text-slate-700">
                      <tbody className="divide-y divide-slate-100">
                        <tr className="bg-slate-50 font-bold text-slate-800">
                          <td className="p-4" colSpan={2}>Cash Flow from Operating Activities</td>
                        </tr>
                        <tr>
                          <td className="p-4 pl-8 text-slate-500">Customer Escrow Inflows (Deposits)</td>
                          <td className="p-4 text-right text-emerald-600">+{formatUGX(totalSavings)}</td>
                        </tr>
                        <tr>
                          <td className="p-4 pl-8 text-slate-500">Portfolio Fees Collected</td>
                          <td className="p-4 text-right text-emerald-600">+{formatUGX(financingRevenue)}</td>
                        </tr>
                        <tr>
                          <td className="p-4 pl-8 text-slate-500">Yield Growth Disbursed Outflow</td>
                          <td className="p-4 text-right text-rose-600">({formatUGX(totalGrowth)})</td>
                        </tr>
                        <tr>
                          <td className="p-4 pl-8 text-slate-500">Referral Program Cash Outflow</td>
                          <td className="p-4 text-right text-rose-600">({formatUGX(referralExpense)})</td>
                        </tr>

                        <tr className="bg-slate-50 font-bold text-slate-800">
                          <td className="p-4" colSpan={2}>Cash Flow from Capital & Financing Activities</td>
                        </tr>
                        <tr>
                          <td className="p-4 pl-8 text-slate-500">Car Financing Outflows (70% Loans Disbursed)</td>
                          <td className="p-4 text-right text-rose-600">({formatUGX(activeFinancing)})</td>
                        </tr>
                        <tr>
                          <td className="p-4 pl-8 text-slate-500">Owner's Capital Base Cash Contribution</td>
                          <td className="p-4 text-right text-emerald-600">+{formatUGX(ownerCapital)}</td>
                        </tr>

                        <tr className="bg-slate-100 font-black text-sm border-t-2 border-slate-300">
                          <td className="p-4 text-slate-800">Net Increase in Cash & Cash Equivalents</td>
                          <td className="p-4 text-right text-emerald-600">{formatUGX(cashInEscrow + operatingCash)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

    </div>
  );
};

export default CfoPage;
