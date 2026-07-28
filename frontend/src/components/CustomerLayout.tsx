import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X, Layers, ShieldCheck, Sun, Moon } from 'lucide-react';
import { API_URL } from '@/config';
import { useLanguage } from '@/contexts/LanguageContext';

const CustomerLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { signOut, user, isAdmin, isCfo } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    window.dispatchEvent(new Event('storage'));
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setTheme(localStorage.getItem('theme') || 'light');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const links = [
    { name: 'Dashboard', key: 'nav.dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Vehicle Marketplace', key: 'nav.vehicles', path: '/vehicles', icon: 'storefront' },
    { name: 'My Application', key: 'nav.applications', path: '/applications', icon: 'assignment' },
    { name: 'Wallet', key: 'nav.wallet', path: '/wallet', icon: 'account_balance_wallet' },
    { name: 'My Vehicle', key: 'nav.my_vehicle', path: '/my-vehicle', icon: 'directions_car' },
    { name: 'Support', key: 'nav.support', path: '/support', icon: 'help' },
    { name: 'Settings', key: 'nav.settings', path: '/settings', icon: 'settings' },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-8 pb-4 relative">
        <img src="/welile_car_logo.png" alt="Welile Car Logo" className="h-10 object-contain mb-1" />
        <p className="text-label-caps font-label-caps text-outline uppercase mt-1">{t('nav.portal.customer') || 'Customer Portal'}</p>
        
        <button onClick={() => setMobileMenuOpen(false)} className="md:hidden absolute top-6 right-6 p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg">
          <X size={20} />
        </button>
      </div>
      
      <nav className="flex-grow px-2 overflow-y-auto">
        {links.map(link => {
          const isActive = location.pathname.startsWith(link.path);
          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`mx-2 my-1 px-4 py-3 flex items-center gap-3 transition-colors duration-200 ease-in-out active:scale-95 rounded-lg ${
                isActive 
                  ? 'bg-primary text-on-primary font-bold' 
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span className="font-body-lg text-body-lg">{t(link.key)}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-6 border-t border-outline-variant">
        <Link to="/profile" className="flex items-center gap-3 mb-6 hover:opacity-80 transition-all duration-200 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0 overflow-hidden">
            {user?.avatarUrl || user?.avatar_url ? (
              <img
                src={(user.avatarUrl || user.avatar_url).startsWith('/') ? `${API_URL}${user.avatarUrl || user.avatar_url}` : (user.avatarUrl || user.avatar_url)}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-on-secondary-container">person</span>
            )}
          </div>
          <div className="overflow-hidden">
            <p className="font-headline-md text-body-lg font-bold truncate">{user?.name || 'Customer'}</p>
            <p className="font-body-sm text-body-sm text-outline truncate">{user?.status === 'QUALIFIED' ? t('member.premium') : t('member.standard')}</p>
          </div>
        </Link>
        
        {isAdmin && (
          <Link to="/admin" className="w-full mb-3 flex items-center gap-2 px-4 py-2 bg-primary-container text-on-primary-container rounded-lg font-bold hover:opacity-90 transition-opacity">
            <Layers size={16} /> {t('nav.portal.admin') || 'Admin Portal'}
          </Link>
        )}
        {isCfo && (
          <Link to="/cfo" className="w-full mb-3 flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-lg font-bold hover:opacity-90 transition-opacity">
            <ShieldCheck size={16} /> {t('nav.portal.cfo') || 'CFO Portal'}
          </Link>
        )}
        
        <button 
          onClick={() => { signOut(); setMobileMenuOpen(false); }}
          className="w-full flex items-center gap-2 text-error mt-2 font-bold hover:bg-error-container p-2 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>{t('settings.logout')}</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background text-on-surface overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface border-b border-outline-variant flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-lg">
            <Menu size={20} />
          </button>
          <img src="/welile_car_logo.png" alt="Welile Car Logo" className="h-8 object-contain" />
        </div>
        <Link to="/profile" className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold overflow-hidden hover:opacity-80 transition-all duration-200">
          {user?.avatarUrl || user?.avatar_url ? (
            <img
              src={(user.avatarUrl || user.avatar_url).startsWith('/') ? `${API_URL}${user.avatarUrl || user.avatar_url}` : (user.avatarUrl || user.avatar_url)}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            user?.name?.[0]?.toUpperCase() || 'U'
          )}
        </Link>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-surface flex flex-col border-r border-outline-variant transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top App Bar (Desktop Only) */}
        <header className="hidden md:flex justify-between items-center h-20 px-10 shrink-0 border-b border-outline-variant/30 bg-surface/50 backdrop-blur">
          <div className="relative w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              type="text" 
              placeholder="Search for vehicles, status..." 
              className="w-full pl-10 pr-4 py-2 bg-surface-container border-none rounded-xl focus:ring-2 focus:ring-primary outline-none transition-shadow"
            />
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <Link 
              to="/support"
              title="Help & Support"
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
            >
              <span className="material-symbols-outlined">help_outline</span>
            </Link>
          </div>
        </header>
        
        {/* Content Scroll Area */}
        <div className="flex-1 overflow-auto pt-16 md:pt-6 md:px-10 px-4 pb-10 flex flex-col justify-between">
          <div className="flex-grow">
            {children}
          </div>
          <footer className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] sm:text-xs font-semibold text-slate-400 tracking-wider">
            © {new Date().getFullYear()} Welile. All rights reserved.
          </footer>
        </div>
      </main>
    </div>
  );
};

export default CustomerLayout;
