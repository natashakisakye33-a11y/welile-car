import { useState } from 'react';
import { Car, User, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { API_URL } from '@/config';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin, isCfo } = useAuth();
  const { t } = useLanguage();

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    if (isActive) {
      return "text-[#4C158D] font-bold transition-colors";
    }
    return "text-slate-600 hover:text-[#4C158D] font-semibold transition-colors";
  };

  return (
    <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">

      {/* Top Left Menu Button */}
      <div className="flex flex-1 justify-start">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-slate-800 hover:text-[#4C158D] transition-colors focus:outline-none"
        >
          {isMenuOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
        </button>
      </div>

      {/* Centered Logo */}
      <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
        <img src="/welile_car_logo.png" alt="Welile Cars Logo" className="h-10 sm:h-12 md:h-14 object-contain" />
      </Link>

      {/* Right Container with Avatar */}
      <div className="flex flex-1 justify-end">
        <Link
          to="/profile"
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center text-[#4C158D] shadow-sm hover:opacity-80 transition-opacity overflow-hidden"
        >
          {user?.avatarUrl || user?.avatar_url ? (
            <img
              src={(user.avatarUrl || user.avatar_url).startsWith('/') ? `${API_URL}${user.avatarUrl || user.avatar_url}` : (user.avatarUrl || user.avatar_url)}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={18} />
          )}
        </Link>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop to close menu when clicking outside */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-40"
            />

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-24 left-4 sm:left-6 bg-white shadow-2xl rounded-2xl p-6 border border-slate-100 z-50 min-w-[240px] flex flex-col gap-6"
            >
              <div className="border-b border-slate-100 pb-4 mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Navigation Menu</p>
              </div>
              <Link to="/profile" onClick={() => setIsMenuOpen(false)} className={getLinkClass("/profile")}>{t('settings.account')}</Link>
              <Link to="/logbook" onClick={() => setIsMenuOpen(false)} className={getLinkClass("/logbook")}>{t('nav.wallet')}</Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setIsMenuOpen(false)} className={getLinkClass("/admin")}>Admin Panel</Link>
              )}
              {isCfo && (
                <Link to="/cfo" onClick={() => setIsMenuOpen(false)} className={getLinkClass("/cfo")}>CFO Portal</Link>
              )}
              <Link to="/settings" onClick={() => setIsMenuOpen(false)} className={getLinkClass("/settings")}>{t('nav.settings')}</Link>
              <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-slate-600 hover:text-[#4C158D] font-semibold transition-colors">{t('nav.about')}</Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
