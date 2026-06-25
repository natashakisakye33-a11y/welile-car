const fs = require('fs');
const path = require('path');

const tsxPath = path.join('frontend', 'src', 'pages', 'WalletPage.tsx');
let tsx = fs.readFileSync(tsxPath, 'utf8');

const replacement = `  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-8 pt-6 md:pt-0">
      <div className="p-4 md:p-10 max-w-[1200px] mx-auto">
        {/* Header Section */}
        <div className="mb-10 print:hidden">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Wallet</h2>
          <p className="text-on-surface-variant mt-2">Manage your savings, deposits, and asset growth in one place.</p>
        </div>

        {/* Print-Only Header */}
        <div className="hidden print:block mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Account Statement</h1>
          <p className="text-slate-500">Welile Car Financing</p>
          <div className="mt-4 p-4 border border-slate-200 rounded-xl">
            <p className="font-bold">Total Balance: {formatUGX(availableBalance)}</p>
            <p className="text-sm text-slate-500">Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-12 gap-6 print:hidden">
          {/* Premium Wallet Card (The Highlight) */}
          <div className="col-span-12 lg:col-span-8">
            <div className="amethyst-gradient rounded-[32px] p-6 md:p-10 relative overflow-hidden premium-shadow group flex flex-col justify-between aspect-auto md:aspect-[1.58/1] min-h-[350px] ring-1 ring-white/20 shadow-inner">
              {/* Abstract Background Decoration */}
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700 pointer-events-none"></div>
              <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-primary-container/20 rounded-full blur-2xl pointer-events-none"></div>

              {/* Card Header: Logo & Tier */}
              <div className="relative z-10 flex justify-between items-start">
                  <div className="flex flex-col">
                      <span className="text-white font-bold tracking-widest text-sm">Welile Car</span>
                      <div className="glass-panel px-3 py-1 rounded-full mt-2 flex items-center gap-2 cursor-pointer hover:bg-white/15 transition-colors w-fit border-white/20 bg-white/10">
                          <span className="text-white/80 font-bold text-[10px] uppercase tracking-[0.2em]">Platinum</span>
                          <span className="material-symbols-outlined text-white/60 text-xs">expand_more</span>
                      </div>
                  </div>
                  <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 bg-white/5 border-white/10">
                      <span className="w-2 h-2 bg-tertiary-fixed-dim rounded-full animate-pulse"></span>
                      <span className="text-white/80 font-bold text-body-sm uppercase tracking-widest text-xs">Synchronized</span>
                  </div>
              </div>

              {/* Card Body: Chip & Balance */}
              <div className="relative z-10 flex flex-col mt-8">
                  <div className="w-14 h-10 bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-200 rounded-lg mb-6 relative overflow-hidden opacity-90">
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 border border-black/10">
                          <div className="border-r border-b border-black/10"></div><div className="border-r border-b border-black/10"></div><div className="border-b border-black/10"></div>
                          <div className="border-r border-black/10"></div><div className="border-r border-black/10"></div><div></div>
                      </div>
                  </div>
                  <div className="text-left">
                      <p className="text-white/60 font-bold tracking-[0.2em] uppercase text-[10px] mb-1">Total Available Balance</p>
                      <h3 className="text-white font-headline-lg text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                          <span className="text-white/70 text-xl md:text-2xl font-bold mr-2">UGX</span>
                          {availableBalance.toLocaleString()}
                      </h3>
                      <div className="flex items-center gap-2 text-tertiary-fixed-dim">
                          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                          <span className="font-bold text-body-sm text-sm">+ UGX {dashboardData.savings.interestEarned.toLocaleString()} Earned</span>
                      </div>
                  </div>
              </div>

              {/* Card Footer: Number & Name */}
              <div className="relative z-10 mt-auto pt-8">
                  <p className="text-white/90 font-bold tracking-[0.3em] text-lg mb-1">4532 •••• •••• 8891</p>
                  <p className="text-white/70 font-bold tracking-widest text-sm uppercase">{user?.name || 'User'}</p>
              </div>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                <button 
                  onClick={() => { setAmount(''); setShowDeposit(true); }}
                  disabled={profile.savings_locked}
                  className="w-full sm:flex-1 sm:max-w-[200px] h-14 glass-panel border border-white/20 hover:bg-slate-200 hover:text-on-surface text-on-surface rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                  style={{ background: 'rgba(0,0,0,0.05)', borderColor: 'rgba(0,0,0,0.1)' }}
                >
                    <span className="material-symbols-outlined">south_west</span>
                    Deposit
                </button>
                <button 
                  onClick={() => { setAmount(''); setShowDeposit(true); }}
                  disabled={profile.savings_locked}
                  className="w-14 h-14 bg-white text-primary rounded-2xl flex items-center justify-center group/btn hover:rotate-90 transition-all duration-300 shadow-xl disabled:opacity-50 shrink-0 hidden sm:flex"
                >
                    <span className="material-symbols-outlined text-3xl">add</span>
                </button>
                <button 
                  onClick={() => { setAmount(''); setShowWithdraw(true); }}
                  className="w-full sm:flex-1 sm:max-w-[200px] h-14 glass-panel border border-white/20 hover:bg-slate-200 hover:text-on-surface text-on-surface rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95"
                  style={{ background: 'rgba(0,0,0,0.05)', borderColor: 'rgba(0,0,0,0.1)' }}
                >
                    Withdraw
                    <span className="material-symbols-outlined">north_east</span>
                </button>
            </div>
          </div>

          {/* Growth Insights (Side Cards) */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 md:gap-8">
            {/* Total Deposits Card */}
            <div className="bg-surface-container-lowest p-8 rounded-[32px] shadow-sm border border-outline-variant hover:border-primary transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-tertiary-container/10 flex items-center justify-center mb-6 text-on-tertiary-container">
                <span className="material-symbols-outlined text-2xl">call_received</span>
              </div>
              <p className="text-outline-variant font-bold uppercase text-[10px] tracking-widest mb-1">Total Deposits</p>
              <h4 className="text-on-surface font-headline-md text-2xl font-extrabold">{formatUGX(availableBalance)}</h4>
              <div className="mt-4 pt-4 border-t border-outline-variant/30 flex items-center justify-between">
                <span className="text-body-sm text-outline-variant">Current Balance</span>
                <span className="text-on-tertiary-container font-bold text-body-sm">Active</span>
              </div>
            </div>

            {/* Asset Appreciation Card */}
            <div className="bg-surface-container-lowest p-8 rounded-[32px] shadow-sm border border-outline-variant hover:border-primary transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-primary-container/10 flex items-center justify-center mb-6 text-primary">
                <span className="material-symbols-outlined text-2xl">insights</span>
              </div>
              <p className="text-outline-variant font-bold uppercase text-[10px] tracking-widest mb-1">Growth Earned</p>
              <h4 className="text-on-surface font-headline-md text-2xl font-extrabold">+{formatUGX(dashboardData.savings.interestEarned)}</h4>
              <div className="mt-4 pt-4 border-t border-outline-variant/30 flex items-center justify-between">
                <span className="text-body-sm text-outline-variant">Passive yield</span>
                <span className="text-primary font-bold text-body-sm">+8.4% APY</span>
              </div>
            </div>
          </div>

          {/* Secondary Bento Section: Transaction History */}
          <div className="col-span-12">
            <div className="bg-surface-container-lowest rounded-[32px] p-6 md:p-8 shadow-sm border border-outline-variant">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-headline-md text-on-surface">Recent Activity</h3>
                <button onClick={() => window.print()} className="text-primary font-bold text-body-sm hover:underline">Print Statement</button>
              </div>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-outline-variant font-medium flex flex-col items-center">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-30">receipt_long</span>
                    No transactions yet.
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-surface-container transition-colors border hover:border-outline-variant/50 border-outline-variant/20">
                      <div className="flex items-center gap-4">
                        <div className={\`w-12 h-12 rounded-full flex items-center justify-center \${tx.type === 'withdrawal' ? 'bg-error-container text-on-error-container' : 'bg-tertiary-container/10 text-on-tertiary-container'}\`}>
                          <span className="material-symbols-outlined">
                            {tx.type === 'withdrawal' ? 'payments' : 'account_balance'}
                          </span>
                        </div>
                        <div>
                          <h5 className="font-bold text-on-surface capitalize">{tx.type}</h5>
                          <p className="text-body-sm text-outline-variant mt-1">{formatDate(tx.date || tx.created_at || new Date().toISOString())} • {tx.method}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={\`font-bold tracking-tight text-lg \${tx.type === 'withdrawal' ? 'text-error' : 'text-on-tertiary-container'}\`}>
                          {tx.type === 'withdrawal' ? '-' : '+'} UGX {tx.amount.toLocaleString()}
                        </p>
                        <p className="text-body-sm text-outline-variant mt-1">Ref #{tx.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="print:hidden mt-8">
          <BottomNav />
        </div>
      </div>

      {/* Deposit Modal (Glassmorphism Slide-Up) */}`;

const startRegex = /  return \(\s*<div className="min-h-screen bg-slate-50/;
const endStr = `      {/* Deposit Modal (Glassmorphism Slide-Up) */}`;

const startIndex = tsx.search(startRegex);
const endIndex = tsx.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  tsx = tsx.substring(0, startIndex) + replacement + tsx.substring(endIndex + endStr.length);
  fs.writeFileSync(tsxPath, tsx);
  console.log('Successfully updated WalletPage.tsx');
} else {
  console.error('Could not find injection points', {
    hasStart: startIndex !== -1,
    hasEnd: endIndex !== -1
  });
}
