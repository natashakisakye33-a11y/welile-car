import AdminLayout from '@/components/admin/AdminLayout';
import { AlertTriangle, Clock } from 'lucide-react';
import { formatUGX } from '@/lib/format';

const RecoveryDashboard = () => {
  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Recovery & Collections</h1>
        <p className="text-slate-500 font-medium mb-8">Monitor overdue accounts and manage repossessions.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 shadow-sm">
            <AlertTriangle size={24} className="text-rose-500 mb-4" />
            <p className="text-xs text-rose-400 font-bold uppercase tracking-wider mb-1">Overdue Accounts</p>
            <p className="text-2xl font-black text-rose-700">0 Accounts</p>
            <p className="text-sm font-semibold text-rose-500 mt-2">Total Value: {formatUGX(0)}</p>
          </div>
          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 shadow-sm">
            <Clock size={24} className="text-amber-500 mb-4" />
            <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">Active Recovery Cases</p>
            <p className="text-2xl font-black text-amber-700">0 Cases</p>
            <p className="text-sm font-semibold text-amber-500 mt-2">Assigned to Recovery Officers</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center text-slate-400 font-bold">
          [Overdue Accounts Table Scaffold]
        </div>
      </div>
    </AdminLayout>
  );
};

export default RecoveryDashboard;
