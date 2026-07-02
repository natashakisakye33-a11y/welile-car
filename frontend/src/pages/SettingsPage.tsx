import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Bell, Monitor, Lock, CreditCard, Globe, AlertCircle, LogOut,
  ChevronRight, ArrowLeft, Camera, Phone, Mail, MapPin, X,
  ShieldCheck, Smartphone, CheckCircle2, Search, Send, MessageSquare, FileText
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/translations';

type SettingsSection = 'Menu' | 'Account' | 'Notification' | 'Display' | 'Privacy' | 'Payment' | 'Language' | 'Help';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: profile } = useProfile();
  const [activeSection, setActiveSection] = useState<SettingsSection>('Menu');
  
  // Profile edit state
  const updateProfileMutation = useUpdateProfile();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    residence: ''
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        residence: profile.residence || ''
      });
    }
  }, [profile]);

  // Toggles state
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => localStorage.getItem('2fa_enabled') === 'true');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [helpMessage, setHelpMessage] = useState('');
  const [helpSearchQuery, setHelpSearchQuery] = useState('');
  const { language: selectedLanguage, setLanguage: setSelectedLanguage, t } = useLanguage();

  const [localAvatar, setLocalAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalAvatar(reader.result as string);
        toast.success("Profile Picture Updated");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const slideVariants = {
    initial: { x: '10%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '10%', opacity: 0 }
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
      residence: profileForm.residence
    }, {
      onSuccess: () => {
        setIsEditingProfile(false);
        toast.success("Profile updated successfully");
      },
      onError: (err) => {
        toast.error("Failed to update profile: " + err.message);
      }
    });
  };

  const renderAccount = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        {!isEditingProfile ? (
          <button 
            onClick={() => setIsEditingProfile(true)}
            className="text-primary font-bold text-sm bg-primary/5 px-4 py-2 rounded-full hover:bg-primary/10 transition-colors"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button 
              onClick={() => {
                setIsEditingProfile(false);
                // Reset form to current profile
                if (profile) {
                  setProfileForm({
                    name: profile.name || '',
                    email: profile.email || '',
                    phone: profile.phone || '',
                    residence: profile.residence || ''
                  });
                }
              }}
              className="text-on-surface-variant font-bold text-sm px-4 py-2 hover:bg-surface-container-high rounded-full transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
              className="bg-primary text-on-primary px-4 py-2 rounded-full font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center py-2">
        <div className="relative w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-[#4C158D] shadow-sm mb-4">
          {localAvatar || profile?.avatar_url ? (
            <img src={localAvatar || profile?.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
          ) : (
            <User size={40} />
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 bg-[#4C158D] hover:bg-[#3f2bc2] transition-colors text-white rounded-full flex items-center justify-center border-2 border-white cursor-pointer shadow-sm"
          >
            <Camera size={14} />
          </button>
        </div>
        
        {isEditingProfile ? (
          <input 
            type="text" 
            value={profileForm.name}
            onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
            className="text-xl font-bold text-center bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full max-w-[200px]"
            placeholder="Your Name"
          />
        ) : (
          <h2 className="text-xl font-bold text-slate-900">{profile?.name || 'John Doe'}</h2>
        )}
        <p className="text-sm text-slate-500 mt-1">Member since 2026</p>
      </div>

      <div className="space-y-3">
        {/* Email */}
        <div className={`bg-slate-50 p-4 rounded-xl flex items-center gap-4 border ${isEditingProfile ? 'border-primary/30 bg-primary/5' : 'border-slate-100'}`}>
          <Mail size={20} className="text-[#4C158D] shrink-0" />
          <div className="w-full">
            <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Email</p>
            {isEditingProfile ? (
              <input 
                type="email" 
                value={profileForm.email}
                onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                placeholder="john.doe@example.com"
              />
            ) : (
              <p className="font-medium text-slate-800 break-all">{profile?.email || 'john.doe@example.com'}</p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className={`bg-slate-50 p-4 rounded-xl flex items-center gap-4 border ${isEditingProfile ? 'border-primary/30 bg-primary/5' : 'border-slate-100'}`}>
          <Phone size={20} className="text-[#4C158D] shrink-0" />
          <div className="w-full">
            <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Phone</p>
            {isEditingProfile ? (
              <input 
                type="tel" 
                value={profileForm.phone}
                onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                placeholder="+256 700 123 456"
              />
            ) : (
              <p className="font-medium text-slate-800">{profile?.phone || '+256 700 123 456'}</p>
            )}
          </div>
        </div>

        {/* Residence */}
        <div className={`bg-slate-50 p-4 rounded-xl flex items-center gap-4 border ${isEditingProfile ? 'border-primary/30 bg-primary/5' : 'border-slate-100'}`}>
          <MapPin size={20} className="text-[#4C158D] shrink-0" />
          <div className="w-full">
            <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Residence</p>
            {isEditingProfile ? (
              <input 
                type="text" 
                value={profileForm.residence}
                onChange={(e) => setProfileForm({...profileForm, residence: e.target.value})}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                placeholder="Ntinda, Kampala"
              />
            ) : (
              <p className="font-medium text-slate-800">{profile?.residence || 'Ntinda, Kampala'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotification = () => (
    <div className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-xl space-y-4 border border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-800">Push Notifications</p>
            <p className="text-xs text-slate-500">Receive alerts on your device</p>
          </div>
          <button 
            onClick={() => setPushEnabled(!pushEnabled)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${pushEnabled ? 'bg-[#4C158D]' : 'bg-slate-300'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${pushEnabled ? 'translate-x-6' : ''}`} />
          </button>
        </div>
        <div className="h-[1px] bg-slate-200"></div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-800">Email Alerts</p>
            <p className="text-xs text-slate-500">Receive weekly summaries</p>
          </div>
          <button 
            onClick={() => setEmailEnabled(!emailEnabled)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${emailEnabled ? 'bg-[#4C158D]' : 'bg-slate-300'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${emailEnabled ? 'translate-x-6' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderDisplay = () => (
    <div className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor size={20} className="text-[#4C158D]" />
            <span className="font-bold text-slate-800">Dark Mode</span>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${darkMode ? 'bg-slate-800' : 'bg-slate-300'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-6' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-4">
      {!showPasswordForm ? (
        <button 
          onClick={() => setShowPasswordForm(true)}
          className="w-full bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 p-4 rounded-xl flex items-center justify-between text-left group"
        >
          <div className="flex items-center gap-3">
            <Lock size={20} className="text-[#4C158D]" />
            <div>
              <p className="font-bold text-slate-800">Change Password</p>
              <p className="text-xs text-slate-500">Update your security key</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400 group-hover:text-slate-600" />
        </button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[#4C158D]">
              <Lock size={18} />
              <h4 className="font-bold">Change Password</h4>
            </div>
            <button onClick={() => setShowPasswordForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="relative">
              <input 
                type={showPasswords ? "text" : "password"} 
                placeholder="Current Password" 
                value={passwordData.current}
                onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C158D]/20"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPasswords ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <div className="relative">
              <input 
                type={showPasswords ? "text" : "password"} 
                placeholder="New Password" 
                value={passwordData.new}
                onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C158D]/20"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPasswords ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <div className="relative">
              <input 
                type={showPasswords ? "text" : "password"} 
                placeholder="Confirm New Password" 
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C158D]/20"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPasswords ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <button 
              onClick={() => {
                if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
                  toast.error("Please fill in all fields.");
                  return;
                }
                if (passwordData.new !== passwordData.confirm) {
                  toast.error("New passwords do not match.");
                  return;
                }
                toast.success("Password changed successfully!");
                setShowPasswordForm(false);
                setPasswordData({ current: '', new: '', confirm: '' });
              }}
              className="w-full py-2.5 bg-[#4C158D] text-white font-bold rounded-xl hover:bg-[#3f2bc2] transition-colors mt-2 text-sm"
            >
              Update Password
            </button>
          </div>
        </motion.div>
      )}
      <div className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck size={20} className={twoFactorEnabled ? "text-emerald-500" : "text-[#4C158D]"} />
          <div>
            <p className="font-bold text-slate-800">Two-Factor Auth</p>
            <p className="text-xs text-slate-500">{twoFactorEnabled ? "Enabled via SMS" : "Extra layer of security"}</p>
          </div>
        </div>
        <button 
          onClick={() => {
            const newState = !twoFactorEnabled;
            setTwoFactorEnabled(newState);
            localStorage.setItem('2fa_enabled', newState ? 'true' : 'false');
            if (newState) {
              toast.success("Two-Factor Auth Enabled", { description: "Verification codes will now be sent to your phone." });
            } else {
              toast.success("Two-Factor Auth Disabled");
            }
          }}
          className={`w-12 h-6 rounded-full p-1 transition-colors ${twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
        >
          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${twoFactorEnabled ? 'translate-x-6' : ''}`} />
        </button>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-4">
      <div className="bg-[#4C158D]/5 border border-[#4C158D]/20 p-4 rounded-xl flex items-center justify-between cursor-pointer">
        <div className="flex items-center gap-3">
          <Smartphone size={20} className="text-[#4C158D]" />
          <div>
            <p className="font-bold text-slate-800">MTN Mobile Money</p>
            <p className="text-xs text-slate-500">077* *** *12</p>
          </div>
        </div>
        <CheckCircle2 size={18} className="text-[#4C158D]" />
      </div>

      <div className="bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors p-4 rounded-xl flex items-center justify-between cursor-pointer group">
        <div className="flex items-center gap-3">
          <Smartphone size={20} className="text-slate-400 group-hover:text-red-500 transition-colors" />
          <div>
            <p className="font-bold text-slate-800">Airtel Money</p>
            <p className="text-xs text-slate-500">075* *** *89</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors p-4 rounded-xl flex items-center justify-between cursor-pointer group">
        <div className="flex items-center gap-3">
          <CreditCard size={20} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
          <div>
            <p className="font-bold text-slate-800">Visa / Mastercard</p>
            <p className="text-xs text-slate-500">**** **** **** 4242</p>
          </div>
        </div>
      </div>
      
      <button className="w-full py-4 bg-white border-2 border-dashed border-slate-200 text-slate-500 hover:text-[#4C158D] hover:border-[#4C158D] font-bold rounded-xl transition-colors">
        + Add Payment Method
      </button>
    </div>
  );

  const renderLanguage = () => {
    const languages = [
      'English (US)',
      'Swahili',
      'French'
    ];

    return (
      <div className="space-y-2 h-[60vh] overflow-y-auto pr-2 pb-10">
        {languages.map((lang, idx) => {
          const isSelected = selectedLanguage === lang;
          return (
            <button 
              key={idx} 
              onClick={() => {
                setSelectedLanguage(lang as Language);
                toast.success(`Language changed to ${lang}`);
              }}
              className={`w-full p-4 rounded-xl flex items-center justify-between transition-all border ${
                isSelected 
                  ? 'bg-[#4C158D]/5 border-[#4C158D]/20' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-100'
              }`}
            >
              <span className={isSelected ? 'font-bold text-[#4C158D]' : 'font-medium text-slate-700'}>
                {lang}
              </span>
              {isSelected && <CheckCircle2 size={18} className="text-[#4C158D]" />}
            </button>
          );
        })}
      </div>
    );
  };

  const handleSendMessage = () => {
    if (!helpMessage.trim()) return;
    toast.success("Message sent! Our support team will contact you shortly.");
    setHelpMessage('');
  };

  const renderHelp = () => {
    const articles = [
      { title: "What vehicles are available for financing?", body: "We offer motorcycles (Bajaj, TVS), sedans, and commercial trucks. Visit the Vehicles tab to browse the full catalog.", color: "bg-emerald-500" },
      { title: "How do I track my vehicle logbook process?", body: "You can track your logbook processing status directly from your dashboard at any time.", color: "bg-[#4C158D]" },
      { title: "What are the requirements for a vehicle loan?", body: "You will need a valid National ID, a registered guarantor, and a minimum initial deposit (usually 15%).", color: "bg-rose-400" },
      { title: "What happens if I miss an installment?", body: "A grace period is provided. Contact us immediately to arrange an alternative payment schedule.", color: "bg-blue-400" },
      { title: "Can I upgrade my vehicle?", body: "Yes, we offer flexible upgrade plans once you hit 50% repayment. Contact support for details.", color: "bg-amber-400" },
      { title: "Are the vehicles insured?", body: "All financed vehicles come with comprehensive insurance for the first year of the loan period.", color: "bg-teal-500" }
    ];

    const discussions = [
      { title: "Which motorcycle is best for Boda Boda?", date: "15 Oct 2026 • Vehicles", icon: Smartphone, color: "bg-emerald-500", shadow: "shadow-emerald-500/30" },
      { title: "How do I change my vehicle model?", date: "12 Oct 2026 • Financing", icon: FileText, color: "bg-[#4C158D]", shadow: "shadow-[#4C158D]/30" },
      { title: "Can I transfer ownership easily?", date: "08 Oct 2026 • Account", icon: User, color: "bg-rose-500", shadow: "shadow-rose-500/30" },
      { title: "What is the typical delivery time for a new car?", date: "02 Oct 2026 • Vehicles", icon: FileText, color: "bg-blue-400", shadow: "shadow-blue-400/30" }
    ];

    const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(helpSearchQuery.toLowerCase()) || a.body.toLowerCase().includes(helpSearchQuery.toLowerCase()));
    const filteredDiscussions = discussions.filter(d => d.title.toLowerCase().includes(helpSearchQuery.toLowerCase()));

    return (
    <div className="space-y-6 pb-6 text-left h-[75vh] overflow-y-auto pr-2">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-[#4C158D]/10 text-[#4C158D] rounded-full flex items-center justify-center mx-auto mb-4 relative">
          <MessageSquare size={36} fill="currentColor" />
          <div className="absolute top-0 right-0 w-8 h-8 bg-[#310c87] text-white rounded-full flex items-center justify-center translate-x-1 -translate-y-1 border-2 border-white shadow-sm">
            <span className="font-black text-lg">?</span>
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">How can we<br/>help you today?</h2>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          value={helpSearchQuery}
          onChange={(e) => setHelpSearchQuery(e.target.value)}
          placeholder="How Can we Help..." 
          className="w-full bg-slate-50 border border-slate-100 rounded-full py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4C158D]/20"
        />
      </div>

      {(filteredArticles.length > 0 || filteredDiscussions.length > 0) ? (
        <>
          {filteredArticles.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-3 px-1">Top Articles</p>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x pr-4 -mr-2">
                {filteredArticles.map((article, idx) => (
                  <div key={idx} className="min-w-[220px] snap-center bg-white border border-slate-100 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                    <div className={`absolute top-0 left-0 right-0 h-1 ${article.color}`}></div>
                    <h4 className="font-bold text-slate-900 text-sm mb-2 leading-tight">{article.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{article.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredDiscussions.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-3 px-1">Latest discussions</p>
              <div className="space-y-3">
                {filteredDiscussions.map((discussion, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl">
                    <div className={`w-10 h-10 ${discussion.color} rounded-full flex items-center justify-center text-white shrink-0 shadow-sm ${discussion.shadow}`}>
                      <discussion.icon size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight mb-1">{discussion.title}</h4>
                      <p className="text-[11px] text-slate-500">{discussion.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-slate-500 text-sm">No results found for "{helpSearchQuery}".</p>
          <p className="text-slate-400 text-xs mt-1">Try adjusting your search or send us an inquiry below.</p>
        </div>
      )}

      <div className="pt-2">
        <p className="text-xs font-bold text-slate-400 uppercase mb-3 px-1">Send an Inquiry</p>
        <p className="text-[11px] text-slate-500 mb-3 px-1">This message will be securely identified as coming from <strong>{profile?.name || 'you'}</strong> ({profile?.email || 'your email'}).</p>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={helpMessage}
            onChange={(e) => setHelpMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..." 
            className="flex-1 bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#4C158D]/20"
          />
          <button 
            onClick={handleSendMessage}
            className="w-12 h-12 bg-[#4C158D] hover:bg-[#3f2bc2] text-white rounded-xl flex items-center justify-center transition-colors shrink-0 shadow-md shadow-[#4C158D]/25"
          >
            <Send size={18} className="-ml-0.5" />
          </button>
        </div>
      </div>
    </div>
    );
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'Account': return renderAccount();
      case 'Notification': return renderNotification();
      case 'Display': return renderDisplay();
      case 'Privacy': return renderPrivacy();
      case 'Payment': return renderPayment();
      case 'Language': return renderLanguage();
      case 'Help': return renderHelp();
      default: return null;
    }
  };

  return (
    <div className="animate-fade-in w-full h-full relative">
      {/* Background Decoration (Subtle animated light leak feel) */}
      <div className="absolute top-0 right-0 -z-10 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px]"></div>
      
      <div className="max-w-3xl mx-auto space-y-10 w-full pb-20">
        {/* Back Action */}
        <button 
          onClick={() => activeSection === 'Menu' ? navigate('/dashboard') : setActiveSection('Menu')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-all group"
        >
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
          <span className="font-bold text-sm">{activeSection === 'Menu' ? 'Back to Dashboard' : 'Back to Settings'}</span>
        </button>

        <AnimatePresence mode="wait">
          {activeSection === 'Menu' ? (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-10"
            >
              {/* Settings Container */}
              <div className="glass-card rounded-[24px] p-6 md:p-10 overflow-hidden relative">
                <div className="mb-12 text-center">
                  <h2 className="text-3xl font-bold text-on-surface mb-2">Settings Menu</h2>
                  <p className="text-on-surface-variant font-body-lg">Manage your account preferences and app experience</p>
                </div>
                
                {/* Category List */}
                <div className="space-y-2">
                  {[
                    { icon: 'person', label: t('settings.account'), section: 'Account' },
                    { icon: 'notifications', label: t('settings.notification'), section: 'Notification' },
                    { icon: 'desktop_windows', label: t('settings.display'), section: 'Display' },
                    { icon: 'lock', label: t('settings.privacy'), section: 'Privacy' },
                    { icon: 'language', label: t('settings.language'), section: 'Language' },
                    { icon: 'help_outline', label: t('settings.help'), section: 'Help' },
                  ].map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setActiveSection(item.section as SettingsSection)}
                      className="group flex items-center justify-between p-5 rounded-2xl hover:bg-primary/5 transition-all cursor-pointer border border-transparent hover:border-primary/10"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all">
                          <span className="material-symbols-outlined">{item.icon}</span>
                        </div>
                        <span className="font-semibold text-lg text-on-surface">{item.label}</span>
                      </div>
                      <span className="material-symbols-outlined text-outline-variant group-hover:text-primary group-hover:translate-x-1 transition-all">chevron_right</span>
                    </div>
                  ))}
                  
                  {/* Divider for destructive action */}
                  <div className="py-4 px-5">
                    <div className="h-[1px] bg-outline-variant/30 w-full"></div>
                  </div>
                  
                  {/* Logout */}
                  <div 
                    onClick={handleLogout}
                    className="group flex items-center justify-between p-5 rounded-2xl hover:bg-error/5 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl bg-error-container/20 flex items-center justify-center text-error group-hover:bg-error group-hover:text-on-error transition-all">
                        <span className="material-symbols-outlined">logout</span>
                      </div>
                      <span className="font-semibold text-lg text-error">Logout</span>
                    </div>
                    <span className="material-symbols-outlined text-error/40 group-hover:text-error group-hover:translate-x-1 transition-all">chevron_right</span>
                  </div>
                </div>
                
                {/* Subtle Brand Footnote */}
                <div className="mt-12 text-center">
                  <p className="text-label-caps font-label-caps text-on-surface-variant/40">Welile Car v2.4.0 • Secured by Amethyst Pro</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="subview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="glass-card rounded-[24px] p-6 md:p-10 overflow-hidden relative"
            >
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-8 border-b border-outline-variant/30 pb-4">
                {activeSection === 'Account' ? t('settings.title.account') : 
                 activeSection === 'Language' ? t('settings.title.language') : 
                 activeSection === 'Help' ? t('settings.help') : activeSection}
              </h2>
              {renderActiveSection()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
