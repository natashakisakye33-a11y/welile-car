import AdminLayout from '@/components/admin/AdminLayout';
import { DollarSign, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { formatUGX } from '@/lib/format';

const ExecutiveDashboard = () => {
  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Executive Dashboard</h1>
        <p className="text-slate-500 font-medium mb-8">High-level overview of Welile Car's performance.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <DollarSign size={24} className="text-emerald-500 mb-4" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Assets</p>
            <p className="text-2xl font-black text-slate-800">{formatUGX(0)}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <Users size={24} className="text-[#4C158D] mb-4" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Active Customers</p>
            <p className="text-2xl font-black text-slate-800">0</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <TrendingUp size={24} className="text-blue-500 mb-4" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Monthly Revenue</p>
            <p className="text-2xl font-black text-slate-800">{formatUGX(0)}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm bg-rose-50/20">
            <AlertCircle size={24} className="text-rose-500 mb-4" />
            <p className="text-xs text-rose-400 font-bold uppercase tracking-wider mb-1">Default Rate</p>
            <p className="text-2xl font-black text-rose-600">0%</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ExecutiveDashboard;
