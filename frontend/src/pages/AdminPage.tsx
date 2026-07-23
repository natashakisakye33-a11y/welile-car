 
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  useAllProfiles,
  useUserTransactions,
  useAdminApproveFinancing,
  useAdminFlagUser,
  useAdminAssignAgent,
  useSubmitCfoRequest,
  useCfoRequests,
  useAllTransactions,
  type AdminProfile,
} from '@/hooks/useAdmin';
import { formatUGX } from '@/lib/format';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPage = () => {
  const { isAdmin, isCfo, loading: authLoading, signOut, signIn } = useAuth();
  const navigate = useNavigate();
  const { data: users = [], isLoading, error: usersError } = useAllProfiles();
  const { data: allTransactions = [], error: txsError } = useAllTransactions();
  
  console.log('AdminPage render:', { users, isLoading, usersError, allTransactions, txsError, isAdmin, isCfo });
  const flagUser = useAdminFlagUser();
  const assignAgent = useAdminAssignAgent();
  const submitCfoRequest = useSubmitCfoRequest();
  const { data: cfoRequests = [] } = useCfoRequests();

  const [selectedUser, setSelectedUser] = useState<AdminProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'saving' | 'flagged' | 'cfo_requests'>('all');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'transactions'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [email, setEmail] = useState('admin@admin.com');
  const [password, setPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const { error, user } = await signIn(email, password);
      if (error) {
        setLoginError(error);
      } else if (user && user.role !== 'ADMIN' && user.role !== 'CFO') {
        setLoginError('You do not have administrative privileges to access this panel.');
        await signOut();
      }
    } catch (err) {
      setLoginError('An error occurred during authentication.');
    } finally {
      setLoginLoading(false);
    }
  };

  if (authLoading) return <div className="p-8 text-center text-primary">Loading permissions...</div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-surface px-4 py-12 text-on-surface font-sans">
        <motion.div className="w-full max-w-[440px] bg-surface-container-lowest border border-outline-variant p-8 sm:p-10 rounded-2xl shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-headline-lg font-bold mb-1.5 text-primary">Welile Cars</h1>
            <p className="text-label-md text-on-surface-variant uppercase tracking-widest">Operations Panel Gate</p>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@admin.com" className="w-full h-12 px-4 rounded-lg bg-surface-container-low border border-outline-variant outline-none focus:border-primary text-body-md text-on-surface" />
            </div>
            <div>
              <label className="block text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full h-12 px-4 pr-12 rounded-lg bg-surface-container-low border border-outline-variant outline-none focus:border-primary text-body-md text-on-surface" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            {loginError && <p className="text-error text-label-sm text-center mt-2">{loginError}</p>}
            <button type="submit" disabled={loginLoading} className="w-full h-12 mt-6 bg-primary hover:bg-primary-container text-on-primary font-label-md rounded-lg flex items-center justify-center">
              {loginLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const totalSavings = users.reduce((s, u) => s + u.wallet_balance, 0);
  const totalGrowth = users.reduce((s, u) => s + u.growth_earned, 0);
  
  const getUserProgress = (user: AdminProfile) => {
    if (!user.selected_car_id || !user.selected_car_price) return 0;
    const target = user.selected_car_price * 0.3;
    return Math.min(100, Math.round((user.wallet_balance / target) * 100));
  };

  const usersPending = users.filter(u => u.financing_status === 'pending' || (getUserProgress(u) >= 100 && u.financing_status !== 'approved'));

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.phone.includes(searchQuery);
    if (!matchesSearch) return false;
    const progress = getUserProgress(user);
    if (activeFilter === 'pending') return user.financing_status === 'pending' || (progress >= 100 && user.financing_status !== 'approved');
    if (activeFilter === 'saving') return !user.selected_car_id || progress < 30;
    if (activeFilter === 'flagged') return user.flagged;
    return true;
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="font-body-md overflow-hidden h-screen flex bg-surface text-on-surface w-full">
      <style>{`
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cdc3d4; border-radius: 10px; }
      `}</style>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}
      
      <aside className={`fixed left-0 top-0 h-full w-[280px] bg-surface border-r border-outline-variant flex-col py-8 px-6 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0 flex' : '-translate-x-full lg:flex hidden'}`}>
        <div className="mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-on-primary-container">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <div>
            <h1 className="text-headline-sm font-bold text-primary">FinOps Core</h1>
            <p className="text-label-sm text-on-surface-variant leading-none">Enterprise Admin</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          <a onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer ${activeTab === 'dashboard' ? 'text-primary font-bold bg-surface-container' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-body-md">Dashboard</span>
          </a>
          <a onClick={() => { setActiveTab('customers'); setIsSidebarOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer ${activeTab === 'customers' ? 'text-primary font-bold bg-surface-container' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
            <span className="material-symbols-outlined">group</span>
            <span className="font-body-md">Customers</span>
          </a>
          <a onClick={() => { setActiveTab('transactions'); setIsSidebarOpen(false); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer ${activeTab === 'transactions' ? 'text-primary font-bold bg-surface-container' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="font-body-md">Transactions</span>
          </a>
          <a onClick={() => { navigate('/cfo'); setIsSidebarOpen(false); }} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer">
            <span className="material-symbols-outlined">payments</span>
            <span className="font-body-md">CFO Portal</span>
          </a>
          <a onClick={() => { navigate('/admin/dealers'); setIsSidebarOpen(false); }} className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer">
            <span className="material-symbols-outlined">directions_car</span>
            <span className="font-body-md">Dealer Portal</span>
          </a>
        </nav>
        <div className="mt-auto pt-6 border-t border-outline-variant space-y-2">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container rounded-xl transition-colors text-left cursor-pointer">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-body-md">Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-[280px] flex flex-col h-full bg-background overflow-hidden">
        <header className="h-16 bg-surface border-b border-outline-variant flex justify-between items-center px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 -ml-2 text-on-surface" onClick={() => setIsSidebarOpen(true)}>
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-headline-sm font-bold text-primary">FinOps Dashboard</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden md:flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline">search</span>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-body-sm focus:outline-none focus:ring-2 focus:ring-primary w-64" placeholder="Global search..." type="text"/>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-3 hover:bg-surface-container-low p-1 pr-3 rounded-full transition-colors cursor-pointer" onClick={handleLogout}>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">A</div>
                <span className="font-label-md text-on-surface hidden md:block">Admin User</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 space-y-8">
          {activeTab === 'dashboard' && (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant transition-all hover:border-primary/30">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <span className="material-symbols-outlined">savings</span>
                  </div>
                </div>
                <p className="text-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Total Savings</p>
                <h3 className="text-headline-md font-bold text-on-surface">{formatUGX(totalSavings)}</h3>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant transition-all hover:border-primary/30">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
                    <span className="material-symbols-outlined">trending_up</span>
                  </div>
                </div>
                <p className="text-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Growth Credited</p>
                <h3 className="text-headline-md font-bold text-on-surface">{formatUGX(totalGrowth)}</h3>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant transition-all hover:border-primary/30">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-tertiary-container/10 text-tertiary-container rounded-lg">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                </div>
                <p className="text-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Total Customers</p>
                <h3 className="text-headline-md font-bold text-on-surface">{users.length}</h3>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant transition-all hover:border-primary/30">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-error/10 text-error rounded-lg">
                    <span className="material-symbols-outlined">rate_review</span>
                  </div>
                </div>
                <p className="text-label-md text-on-surface-variant mb-1 uppercase tracking-wider">Needs Review</p>
                <h3 className="text-headline-md font-bold text-on-surface">{usersPending.length}</h3>
              </div>
            </section>
          )}

          <div className="flex flex-col xl:flex-row gap-6">
            {(activeTab === 'dashboard' || activeTab === 'customers') && (
              <div className="flex-grow space-y-4">
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
                <div className="p-4 lg:p-6 border-b border-outline-variant flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setActiveFilter('all')} className={`px-4 py-2 rounded-full text-label-md transition-colors ${activeFilter === 'all' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>All Users</button>
                    <button onClick={() => setActiveFilter('pending')} className={`px-4 py-2 rounded-full text-label-md transition-colors ${activeFilter === 'pending' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>Pending Review</button>
                    <button onClick={() => setActiveFilter('saving')} className={`px-4 py-2 rounded-full text-label-md transition-colors ${activeFilter === 'saving' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>Saving</button>
                    <button onClick={() => setActiveFilter('flagged')} className={`px-4 py-2 rounded-full text-label-md transition-colors ${activeFilter === 'flagged' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>Flagged</button>
                  </div>
                  <div className="relative w-full lg:w-auto">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
                    <input 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2.5 bg-background border border-outline-variant rounded-lg text-body-sm w-full lg:w-64 focus:ring-1 focus:ring-primary outline-none" 
                      placeholder="Search by name or phone..." 
                      type="text"
                    />
                  </div>
                </div>
                
                <div className="p-4 lg:p-6 space-y-4">
                  {filteredUsers.map(user => (
                    <div key={user.user_id} className={`group flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-background border rounded-xl hover:shadow-sm transition-all ${user.flagged ? 'border-error bg-error-container/10' : 'border-outline-variant'}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-surface-container rounded-full overflow-hidden border-2 border-surface flex items-center justify-center text-primary font-bold text-lg">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-headline-sm text-on-surface">{user.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-label-sm text-on-surface-variant">{user.phone}</span>
                            <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
                            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-label-sm ${
                              user.financing_status === 'approved' ? 'bg-secondary/10 text-secondary' :
                              user.financing_status === 'pending' ? 'bg-tertiary/10 text-tertiary' :
                              'bg-primary/10 text-primary'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${
                                user.financing_status === 'approved' ? 'bg-secondary' :
                                user.financing_status === 'pending' ? 'bg-tertiary' :
                                'bg-primary'
                              }`}></span>
                              {user.financing_status === 'none' ? 'Saving' : user.financing_status}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 flex items-center gap-3 w-full md:w-auto">
                        <button onClick={() => flagUser.mutate({ userId: user.user_id, flagged: !user.flagged })} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-outline text-on-surface-variant rounded-lg font-label-md hover:bg-surface-container-low transition-colors">
                          <span className="material-symbols-outlined text-[18px]">flag</span>
                          {user.flagged ? 'Unflag' : 'Flag'}
                        </button>
                        <button onClick={() => setSelectedUser(user)} className="flex-1 md:flex-none px-6 py-2 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary-container transition-colors shadow-lg shadow-primary/10">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {filteredUsers.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                      <span className="material-symbols-outlined text-[48px] mb-2">hourglass_empty</span>
                      <p className="font-body-md">No other customers found matching filters</p>
                    </div>
                  )}
                </div>
              </div>
              </div>
            )}

            {(activeTab === 'dashboard' || activeTab === 'transactions') && (
              <aside className={`w-full ${activeTab === 'dashboard' ? 'xl:w-[360px]' : ''} space-y-4 shrink-0`}>
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant h-full flex flex-col max-h-[800px]">
                <div className="border-b border-outline-variant flex items-center justify-between p-6">
                  <h3 className="text-headline-sm text-on-surface">Payments Feed</h3>
                  <span className="material-symbols-outlined text-outline">refresh</span>
                </div>
                
                {allTransactions.length > 0 ? (
                  <div className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar">
                    {allTransactions.map((tx: any, idx: number) => (
                      <div key={tx.id || idx} className="flex justify-between items-center p-3 bg-surface-container-low border border-outline-variant rounded-lg">
                        <div>
                          <p className="font-bold text-on-surface text-sm">{tx.userName}</p>
                          <p className="text-xs text-on-surface-variant capitalize">{tx.method}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-secondary font-bold text-sm">+{formatUGX(tx.amount)}</p>
                          <p className="text-xs text-on-surface-variant">{new Date(tx.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center py-24">
                    <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined text-on-surface-variant text-[40px]">payments</span>
                    </div>
                    <h4 className="text-headline-sm text-on-surface mb-2">No payments detected</h4>
                    <p className="text-body-sm text-on-surface-variant max-w-[200px]">Real-time payment transactions will appear here as they are processed.</p>
                  </div>
                )}
                
                <div className="p-4 border-t border-outline-variant bg-surface-container-low/30 m-4 rounded-lg shrink-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                    <span className="font-label-md text-on-surface uppercase">System Status</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-body-sm">
                      <span className="text-on-surface-variant">API Latency</span>
                      <span className="text-on-secondary-container font-bold">24ms</span>
                    </div>
                    <div className="flex justify-between items-center text-body-sm">
                      <span className="text-on-surface-variant">Uptime</span>
                      <span className="text-on-secondary-container font-bold">99.9%</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
            )}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 bg-on-surface/60 z-[100] flex items-center justify-center p-4 lg:p-6" onClick={() => setSelectedUser(null)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-lowest w-full max-w-xl rounded-2xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setSelectedUser(null)} className="absolute top-6 right-6 w-10 h-10 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>

              <div className="flex items-center gap-4 border-b border-outline-variant pb-6 mb-6">
                <div className="w-14 h-14 bg-primary-container rounded-full flex items-center justify-center text-on-primary-container font-bold text-xl">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-headline-md font-bold text-on-surface">{selectedUser.name}</h2>
                  <p className="text-body-sm text-on-surface-variant">{selectedUser.phone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant">
                  <p className="text-label-sm text-on-surface-variant mb-1">Wallet Balance</p>
                  <p className="text-lg font-bold text-on-surface">{formatUGX(selectedUser.wallet_balance)}</p>
                </div>
                <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant">
                  <p className="text-label-sm text-on-surface-variant mb-1">Growth Accrued</p>
                  <p className="text-lg font-bold text-on-surface">{formatUGX(selectedUser.growth_earned)}</p>
                </div>
              </div>

              <div className="space-y-4 text-body-sm border-b border-outline-variant pb-6">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Member Since:</span>
                  <span className="text-on-surface font-semibold">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Selected Car:</span>
                  <span className="text-on-surface font-semibold">{CARS.find(c => c.id === selectedUser.selected_car_id)?.name || 'None Selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Credit Status:</span>
                  <span className={`capitalize font-bold ${selectedUser.financing_status === 'approved' ? 'text-secondary' : 'text-primary'}`}>
                    {selectedUser.financing_status === 'none' ? 'Saving' : selectedUser.financing_status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Assigned Agent:</span>
                  <span className="text-on-surface font-semibold">{selectedUser.assigned_agent || 'None Assigned'}</span>
                </div>
              </div>

              <button onClick={() => setSelectedUser(null)} className="mt-6 w-full h-11 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label-md transition-colors">
                Close Profile
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPage;
