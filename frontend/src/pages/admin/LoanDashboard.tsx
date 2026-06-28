import AdminLayout from '@/components/admin/AdminLayout';
import { FileText, CheckCircle, XCircle } from 'lucide-react';

const LoanDashboard = () => {
  return (
    <AdminLayout>
      <div className="p-8">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Loan Origination Dashboard</h1>
        <p className="text-slate-500 font-medium mb-8">Manage financing applications and approvals.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <FileText size={24} className="text-amber-500 mb-4" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Pending Applications</p>
            <p className="text-2xl font-black text-slate-800">0</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <CheckCircle size={24} className="text-emerald-500 mb-4" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Loans Approved</p>
            <p className="text-2xl font-black text-slate-800">0</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <XCircle size={24} className="text-rose-500 mb-4" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Loans Rejected</p>
            <p className="text-2xl font-black text-slate-800">0</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center text-slate-400 font-bold">
          [Applications Table Scaffold]
        </div>
      </div>
    </AdminLayout>
  );
};

export default LoanDashboard;
