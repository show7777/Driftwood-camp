import React from 'react';
import { Compass, User, ShieldCheck, MapPin, Sparkles, LogOut, LogIn, Baby, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openRegisterModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, openRegisterModal }) => {
  const { userProfile, currentUser, signInWithGoogle, switchRole, logout } = useAuth();
  const { lang, toggleLang, t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-[#193a2b] text-white shadow-md border-b border-emerald-950/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setCurrentTab('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 text-sm font-black">✦</span>
                <span className="font-black text-base sm:text-lg tracking-wider text-white">
                  {t('brandName')}
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80 font-medium tracking-tight">
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentTab === 'home'
                  ? 'bg-emerald-900/80 text-amber-300 font-semibold shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-900/50 hover:text-white'
              }`}
            >
              {t('home')}
            </button>
            <button
              onClick={() => setCurrentTab('map')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'map'
                  ? 'bg-emerald-900/80 text-amber-300 font-semibold shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-900/50 hover:text-white'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-300" />
              {t('venueMap')}
            </button>
            <button
              onClick={() => setCurrentTab('games')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'games'
                  ? 'bg-emerald-900/80 text-amber-300 font-semibold shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-900/50 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              {t('games')}
            </button>
            <button
              onClick={() => setCurrentTab('parent')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'parent'
                  ? 'bg-emerald-900/80 text-amber-300 font-semibold shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-900/50 hover:text-white'
              }`}
            >
              <Baby className="w-4 h-4 text-emerald-300" />
              {t('parentPortal')}
            </button>
            <button
              onClick={() => setCurrentTab('director')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'director'
                  ? 'bg-emerald-900/80 text-amber-300 font-semibold shadow-xs'
                  : 'text-emerald-100 hover:bg-emerald-900/50 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              {t('directorPortal')}
            </button>
          </nav>

          {/* User Profile, Language & Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Language Switcher Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-amber-300 font-bold px-2.5 py-1.5 rounded-full text-xs border border-amber-400/30 transition-all cursor-pointer shadow-xs"
              title={lang === 'en' ? 'ወደ አማርኛ ይቀይሩ' : 'Switch to English'}
              aria-label="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'en' ? 'አማርኛ' : 'EN'}</span>
            </button>

            <button
              onClick={openRegisterModal}
              className="bg-amber-400 hover:bg-amber-300 text-stone-900 font-black px-3 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm shadow-sm transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
            >
              {t('registerChild')}
            </button>

            {/* Role switch toggle for quick testing */}
            <div className="hidden sm:flex items-center bg-emerald-950/70 p-1 rounded-full border border-emerald-800/60 text-xs">
              <button
                onClick={() => switchRole('parent')}
                className={`px-2 py-0.5 rounded-full transition-all text-[11px] ${
                  userProfile?.role === 'parent'
                    ? 'bg-amber-400 text-stone-900 font-bold shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
                title="Switch view to Parent"
              >
                {t('parent')}
              </button>
              <button
                onClick={() => switchRole('director')}
                className={`px-2 py-0.5 rounded-full transition-all text-[11px] ${
                  userProfile?.role === 'director'
                    ? 'bg-amber-400 text-stone-900 font-bold shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
                title="Switch view to Director"
              >
                {t('director')}
              </button>
            </div>

            {/* Auth Login / Avatar */}
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <div
                  className="flex items-center gap-1 bg-emerald-900/60 px-2 py-1 rounded-full border border-emerald-700/50 text-xs"
                  title={userProfile?.email}
                >
                  <User className="w-3.5 h-3.5 text-amber-300" />
                  <span className="max-w-[80px] truncate font-medium text-emerald-100">
                    {userProfile?.name?.split(' ')[0] || 'User'}
                  </span>
                </div>
                <button
                  onClick={() => logout()}
                  className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-900/60 rounded-full transition-colors"
                  title={t('signOut')}
                  aria-label={t('signOut')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                className="hidden sm:flex items-center gap-1.5 bg-emerald-900/80 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-700/60 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-300" />
                <span>{t('signIn')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center justify-around py-2 border-t border-emerald-900/60 text-xs">
          <button
            onClick={() => setCurrentTab('home')}
            className={`py-1 px-2 rounded font-medium ${currentTab === 'home' ? 'text-amber-300 font-bold' : 'text-emerald-200'}`}
          >
            {t('home')}
          </button>
          <button
            onClick={() => setCurrentTab('map')}
            className={`py-1 px-2 rounded font-medium ${currentTab === 'map' ? 'text-amber-300 font-bold' : 'text-emerald-200'}`}
          >
            {t('venueMap')}
          </button>
          <button
            onClick={() => setCurrentTab('games')}
            className={`py-1 px-2 rounded font-medium ${currentTab === 'games' ? 'text-amber-300 font-bold' : 'text-emerald-200'}`}
          >
            {t('games')}
          </button>
          <button
            onClick={() => setCurrentTab('parent')}
            className={`py-1 px-2 rounded font-medium ${currentTab === 'parent' ? 'text-amber-300 font-bold' : 'text-emerald-200'}`}
          >
            {t('parent')}
          </button>
          <button
            onClick={() => setCurrentTab('director')}
            className={`py-1 px-2 rounded font-medium ${currentTab === 'director' ? 'text-amber-300 font-bold' : 'text-emerald-200'}`}
          >
            {t('director')}
          </button>
        </div>
      </div>
    </header>
  );
};
