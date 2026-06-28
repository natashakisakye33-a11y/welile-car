import AdminLayout from '@/components/admin/AdminLayout';
import { PiggyBank, TrendingUp } from 'lucide-react';
import { formatUGX } from '@/lib/format';

const SavingsDashboard = () => {
  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Savings & Deposits</h1>
        <p className="text-slate-500 font-medium mb-8">Manage customer savings and interest liabilities.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <PiggyBank size={24} className="text-[#4C158D] mb-4" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Savings Held</p>
            <p className="text-2xl font-black text-slate-800">{formatUGX(0)}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <TrendingUp size={24} className="text-emerald-500 mb-4" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Interest Liabilities (5% APR)</p>
            <p className="text-2xl font-black text-slate-800">{formatUGX(0)}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center text-slate-400 font-bold">
          [Savings Transactions Table Scaffold]
        </div>
      </div>
    </AdminLayout>
  );
};

export default SavingsDashboard;
