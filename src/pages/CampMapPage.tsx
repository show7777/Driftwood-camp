import React from 'react';
import { MapPin, Navigation, Bus, AlertCircle, Sun, ExternalLink } from 'lucide-react';

interface CampMapPageProps {
  openRegisterModal: () => void;
}

export const CampMapPage: React.FC<CampMapPageProps> = ({ openRegisterModal }) => {
  return (
    <div className="space-y-8 pb-16">
      {/* Banner */}
      <section className="bg-gradient-to-r from-[#173a2b] to-[#26533f] text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-emerald-900">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold tracking-wider uppercase text-amber-400">Venue & Transportation</span>
          <h1 className="text-3xl font-black">Gulele Botanic Garden</h1>
          <p className="text-sm text-emerald-100/90 leading-relaxed">
            Nestled on the northern mountain slopes of Addis Ababa, Gulele Botanic Garden spans over 700 hectares
            of native Afro-montane forest, natural streams, and protected endemic flora.
          </p>
        </div>
      </section>

      {/* Main Map & Venue Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-800" />
                <span>Venue Access & Meeting Points</span>
              </h2>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Gulele+Botanic+Garden+Addis+Ababa"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Driftwood Camp organizes structured, group-supervised activities on established botanical trails.
              Drop-offs and pick-ups are strictly monitored at the primary gate welcome pavilion with staff sign-in sheets.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
                <span className="font-bold text-emerald-950 block text-sm">Gate 1 Welcome Pavilion</span>
                <p className="text-stone-500 mt-1">
                  Designated morning drop-off point (8:00 AM – 8:30 AM). Camp directors verify child attendance and health checks.
                </p>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs">
                <span className="font-bold text-emerald-950 block text-sm">Main Assembly Amphitheater</span>
                <p className="text-stone-500 mt-1">
                  Covered sheltered pavilion for lunch, music rhythm circles, and rainy-weather backup activities.
                </p>
              </div>
            </div>
          </div>

          {/* Shuttle Transportation Routes */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Bus className="w-5 h-5 text-amber-600" />
              <span>Supervised Shuttle Pickup Routes</span>
            </h3>
            <p className="text-xs text-stone-600">
              For families requesting camp transport, organized shuttles with verified camp supervisors stop at:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                <div>
                  <strong className="text-stone-900">Bole Medhanialem Route</strong>
                  <p className="text-stone-500">Pick-up: 7:20 AM · Return Drop-off: 4:40 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                <div>
                  <strong className="text-stone-900">Mexico Square / Genete Tsige Route</strong>
                  <p className="text-stone-500">Pick-up: 7:35 AM · Return Drop-off: 4:25 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-[11px] shrink-0">3</span>
                <div>
                  <strong className="text-stone-900">Sarbet / Karl Square Route</strong>
                  <p className="text-stone-500">Pick-up: 7:45 AM · Return Drop-off: 4:15 PM</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                Transport confirmation and driver contact details are shared directly with registered parents 24 hours prior.
              </span>
            </div>
          </div>
        </div>

        {/* Packing Checklist Sidebar */}
        <div className="space-y-5">
          <div className="bg-[#fcfbf7] border border-stone-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-600" />
              <span>Camper Packing Checklist</span>
            </h3>

            <ul className="space-y-2.5 text-xs text-stone-700">
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">✓</span>
                <span>Closed-toe hiking shoes or sturdy sneakers</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">✓</span>
                <span>Reusable water bottle (at least 750ml)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">✓</span>
                <span>Wide-brim sunhat and sunscreen</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">✓</span>
                <span>Lightweight rain jacket / poncho</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">✓</span>
                <span>Small backpack with camper's name tag</span>
              </li>
            </ul>

            <button
              onClick={openRegisterModal}
              className="w-full mt-2 bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Register Child for Next Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
