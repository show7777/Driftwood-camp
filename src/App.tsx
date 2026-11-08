import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { ParentPortal } from './pages/ParentPortal.tsx';
import { DirectorPortal } from './pages/DirectorPortal.tsx';
import { CampMapPage } from './pages/CampMapPage.tsx';
import { GamesPage } from './pages/GamesPage.tsx';
import { RegistrationModal } from './components/RegistrationModal.tsx';
import { Camper } from './types.ts';
import { subscribeCampers } from './lib/db.ts';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [campers, setCampers] = useState<Camper[]>([]);
  const { userProfile } = useAuth();

  useEffect(() => {
    // Subscribe to live campers collection
    const unsubscribe = subscribeCampers((updatedCampers) => {
      setCampers(updatedCampers);
    });

    return () => unsubscribe();
  }, []);

  const handleRegistrationSuccess = (camperId: string) => {
    // Switch to Parent Portal so they immediately view their registered child
    setTimeout(() => {
      setCurrentTab('parent');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f2e8] text-stone-900 font-sans selection:bg-amber-300 selection:text-stone-900">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openRegisterModal={() => setIsRegisterOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {currentTab === 'home' && (
          <HomePage
            campers={campers}
            openRegisterModal={() => setIsRegisterOpen(true)}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'map' && (
          <CampMapPage openRegisterModal={() => setIsRegisterOpen(true)} />
        )}

        {currentTab === 'games' && <GamesPage />}

        {currentTab === 'parent' && (
          <ParentPortal
            campers={campers}
            openRegisterModal={() => setIsRegisterOpen(true)}
          />
        )}

        {currentTab === 'director' && (
          <DirectorPortal campers={campers} />
        )}
      </main>

      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={handleRegistrationSuccess}
      />

      {/* Footer */}
      <footer className="bg-[#153426] text-emerald-100/90 border-t border-emerald-950 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs leading-relaxed">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-400 font-bold">✦</span>
                <strong className="text-white text-sm font-black tracking-wider">DRIFTWOOD CAMP</strong>
              </div>
              <p className="text-emerald-200/80 max-w-xs">
                Outdoor learning. Lasting confidence. Supervised adventure and wilderness exploration for youth.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2">Venue & Sessions</h4>
              <p className="text-emerald-200/80">
                Gulele Botanic Garden · Addis Ababa, Ethiopia<br />
                Ages 8–12 · Saturday & Sunday Sessions<br />
                1,000 ETB · Strictly capped at 40 children
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2">Safety & Instant Alerts</h4>
              <p className="text-emerald-200/80">
                Supervised outdoor activities with live organizer updates, digital consent agreements,
                and real-time Telegram bot alerts for registrations and payment receipts.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-emerald-300/60">
            <span>© {new Date().getFullYear()} Driftwood Camp. All rights reserved.</span>
            <span>Safety First · Zero Trace Camping</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
