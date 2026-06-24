import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, Wallet, History, Car, FileText, 
  Settings, LogOut, Menu, X, CarFront, CreditCard, LifeBuoy,
  User, ShieldCheck, Layers
} from 'lucide-react';

const CustomerLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { signOut, user, isAdmin, isCfo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Vehicle Marketplace', path: '/vehicles', icon: Car },
    { name: 'My Application', path: '/applications', icon: FileText },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
    { name: 'My Vehicle', path: '/my-vehicle', icon: CarFront },
    { name: 'Support', path: '/support', icon: LifeBuoy },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">directions_car</span>
            <span className="font-chewy text-2xl text-primary tracking-wide">Welile Car</span>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mt-2">Customer Portal</p>
        </div>
        <button onClick={() => setMobileMenuOpen(false)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
          <X size={20} />
        </button>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4">
        {links.map(link => {
          const Icon = link.icon;
          const isActive = location.pathname.startsWith(link.path);
          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon size={18} />
              {link.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-200 mt-auto">
        <button
          onClick={() => { signOut(); setMobileMenuOpen(false); }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </>
  );

  const ProfileMenu = () => (
    <div className="relative">
      <button 
        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
        className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors border border-primary/20"
      >
        <User size={18} />
      </button>

      {profileMenuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden">
            <div className="p-3 border-b border-slate-100 bg-slate-50">
              <p className="text-sm font-bold text-slate-800">{user?.name || 'Customer'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.phone || user?.email}</p>
            </div>
            <div className="p-2 space-y-1">
              <Link to="/profile" onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                <User size={16} /> My Profile
              </Link>
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-[#4C158D] hover:bg-[#4C158D]/10 rounded-lg transition-colors">
                  <Layers size={16} /> Admin Portal
                </Link>
              )}
              {isCfo && (
                <Link to="/cfo" className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                  <ShieldCheck size={16} /> CFO Portal
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-body-md overflow-hidden selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors rounded-lg">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">directions_car</span>
            <span className="font-chewy text-2xl text-primary tracking-wide">Welile Car</span>
          </div>
        </div>
        {ProfileMenu()}
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900/50 z-40" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Floating Profile Menu for Desktop */}
        <div className="hidden md:block absolute top-5 right-6 z-50">
          {ProfileMenu()}
        </div>
        
        {/* Content Scroll Area */}
        <div className="flex-1 overflow-auto pt-16 md:pt-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CustomerLayout;
