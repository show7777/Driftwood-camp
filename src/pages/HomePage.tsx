import React from 'react';
import { Compass, TreePine, Award, Music, MapPin, Calendar, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { ActivityLogsFeed } from '../components/ActivityLogsFeed.tsx';
import { Camper } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import summerCampKidsImg from '../assets/images/summer_camp_kids.jpg';

interface HomePageProps {
  campers: Camper[];
  openRegisterModal: () => void;
  setCurrentTab: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ campers, openRegisterModal, setCurrentTab }) => {
  const { t, lang } = useLanguage();
  const activeCount = Math.min(40, campers.filter((c) => c.directorStatus !== 'Waiting list').length);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section with Summer Camp Kids Image */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#143324] via-[#1b4330] to-[#24573f] text-white p-6 sm:p-10 lg:p-12 shadow-xl border border-emerald-900/60">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold tracking-wider uppercase">
              <span className="text-amber-400">✦</span> {t('eyebrow')}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1] text-white">
              {t('heroTitle1')}<br />
              <span className="text-amber-400">{t('heroTitle2')}</span>
            </h1>

            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal max-w-xl">
              {t('heroDesc')}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={openRegisterModal}
                className="bg-amber-400 hover:bg-amber-300 text-stone-900 font-black px-6 py-3.5 rounded-full text-sm sm:text-base shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>{t('registerChildBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentTab('map')}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3.5 rounded-full text-sm sm:text-base border border-white/20 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-emerald-300" />
                <span>{t('campVenueBtn')}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-emerald-200">
              <span className="bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-300" /> {t('weekendSessions')}
              </span>
              <span className="bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-800 flex items-center gap-1.5">
                <TreePine className="w-3.5 h-3.5 text-emerald-300" /> {t('summerProgram')}
              </span>
              <span className="bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-300" /> {t('capacityEnrolled').replace('{n}', String(activeCount))}
              </span>
            </div>
          </div>

          {/* Right Image Showcase Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-700/60 shadow-2xl group">
              <img
                src={summerCampKidsImg}
                alt="Children exploring outdoor summer camp trail at Gulele Botanic Garden"
                className="w-full h-72 sm:h-84 lg:h-96 object-cover transform group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              {/* Floating Badge */}
              <div className="absolute bottom-3 left-3 right-3 p-3 bg-stone-900/85 backdrop-blur-xs rounded-xl border border-white/20 text-white text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-amber-300">
                  <span className="flex items-center gap-1">
                    <TreePine className="w-3.5 h-3.5 text-emerald-400" />
                    {lang === 'am' ? 'ጉለሌ እፅዋት ማዕከል' : 'Gulele Botanic Garden Expedition'}
                  </span>
                  <span className="bg-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {lang === 'am' ? 'ዕድሜ 8–12' : 'Ages 8–12'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-200">
                  {lang === 'am'
                    ? 'ተሳታፊ ልጆች በጫካው የተፈጥሮ መንገድ ላይ የዱር አድን ክህሎት እና የተፈጥሮ እውቀትን ሲያዳብሩ'
                    : 'Campers exploring mountain trails, learning native flora, and practicing wilderness teamwork'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative corner glow */}
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-700 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-900 text-base">{t('skillsTitle')}</h3>
          <p className="text-xs text-stone-600 mt-1 leading-relaxed">
            {t('skillsDesc')}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-700 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
            <TreePine className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-900 text-base">{t('hikingTitle')}</h3>
          <p className="text-xs text-stone-600 mt-1 leading-relaxed">
            {t('hikingDesc')}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-700 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-3">
            <Music className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-900 text-base">{t('musicTitle')}</h3>
          <p className="text-xs text-stone-600 mt-1 leading-relaxed">
            {t('musicDesc')}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-700 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-900 text-base">{t('olympiaTitle')}</h3>
          <p className="text-xs text-stone-600 mt-1 leading-relaxed">
            {t('olympiaDesc')}
          </p>
        </div>
      </div>

      {/* Real-Time Activity Feed Showcase */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">{t('liveBroadcast')}</span>
            <h2 className="text-2xl font-black text-stone-900">{t('liveStreamTitle')}</h2>
          </div>
          <p className="text-xs text-stone-500">
            {t('liveStreamSubtitle')}
          </p>
        </div>

        <ActivityLogsFeed campers={campers} />
      </section>

      {/* Camp Schedule & Sample Day */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">{t('scheduleEyebrow')}</span>
              <h3 className="text-lg font-black text-stone-900">{t('scheduleTitle')}</h3>
            </div>
            <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-1 rounded-full">
              {t('fullSupervision')}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">{lang === 'am' ? 'ሰዓት' : 'Time'}</th>
                  <th className="py-2.5 px-3">{lang === 'am' ? 'እንቅስቃሴ' : 'Activity'}</th>
                  <th className="py-2.5 px-3">{lang === 'am' ? 'የትኩረት አቅጣጫ' : 'Focus Area'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-600">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-stone-800">8:00 – 8:30</td>
                  <td className="py-2.5 px-3">
                    {lang === 'am' ? 'መድረስ፣ የወላጅ መግቢያ ፊርማ እና የደህንነት ማረጋገጫ' : 'Arrival, parent sign-in & safety check'}
                  </td>
                  <td className="py-2.5 px-3">
                    {lang === 'am' ? 'የመገኘት ምዝገባ' : 'Attendance check-in'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-stone-800">8:30 – 9:15</td>
                  <td className="py-2.5 px-3">
                    {lang === 'am' ? 'ጭፈራ፣ የካምፕ መዝሙር እና የቡድን ማሟሟቂያ' : 'Dance, camp anthem & group warm-up'}
                  </td>
                  <td className="py-2.5 px-3">
                    {lang === 'am' ? 'ጉልበት እና የቡድን መንፈስ' : 'Energy & team spirit'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-stone-800">9:15 – 10:45</td>
                  <td className="py-2.5 px-3">
                    {lang === 'am' ? 'የዱር ክህሎቶች: ገመድ ማሰር እና መጠለያ መስራት' : 'Wilderness skills: knot tying & shelter'}
                  </td>
                  <td className="py-2.5 px-3">
                    {lang === 'am' ? 'ተግባራዊ የውጭ ስራዎች' : 'Hands-on outdoor craft'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-stone-800">10:45 – 12:15</td>
                  <td className="py-2.5 px-3">
                    {lang === 'am' ? 'የጉለሌ እፅዋት የተፈጥሮ መንገድ እና አቅጣጫ መለየት' : 'Gulele botanical nature trail & navigation'}
                  </td>
                  <td className="py-2.5 px-3">
                    {lang === 'am' ? 'ሳይንስ እና አቅጣጫ መፈለግ' : 'Science & orienteering'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-stone-800">12:15 – 1:15</td>
                  <td className="py-2.5 px-3">
                    {lang === 'am' ? 'የምሳ ዕረፍት ከዛፎች ስር እና መዝናናት' : 'Picnic lunch under the eucalyptus & rest'}
                  </td>
                  <td className="py-2.5 px-3">
                    {lang === 'am' ? 'ውሃ መጠጣት እና ጓደኝነት' : 'Hydration & friendship'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-stone-800">1:15 – 3:00</td>
                  <td className="py-2.5 px-3">
                    {lang === 'am' ? 'የድሪፍትዉድ ኦሊምፒያ ጨዋታዎች እና የቡድን ቅብብሎሽ' : 'Driftwood Olympia games & team relay'}
                  </td>
                  <td className="py-2.5 px-3">
                    {lang === 'am' ? 'ቅልጥፍና እና ስፖርታዊ ጨዋነት' : 'Agility & sportsmanship'}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-stone-800">3:00 – 4:00</td>
                  <td className="py-2.5 px-3">
                    {lang === 'am' ? 'ማጠቃለያ፣ የባጅ ሽልማት እና የወላጅ መውጫ ፊርማ' : 'Reflection, badge awards & parent checkout'}
                  </td>
                  <td className="py-2.5 px-3">
                    {lang === 'am' ? 'ደህንነቱ የተጠበቀ የመውጣት ስርዓት' : 'Safe sign-out procedure'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Camp Fee & Payment Accounts card */}
        <div className="bg-[#fcfbf7] border border-amber-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">{t('campFeeEyebrow')}</span>
              <div className="text-4xl font-black text-emerald-900 mt-1">{t('campFeeAmount')}</div>
              <p className="text-xs text-stone-500 mt-1">
                {t('campFeeDesc')}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-amber-200/60">
              <h4 className="text-xs font-bold text-stone-800">{t('officialAccounts')}</h4>
              <div className="bg-white p-3 rounded-xl border border-stone-200 text-xs">
                <span className="text-stone-500">{t('dashenAccount')}</span>
                <p className="font-mono font-bold text-stone-900 text-sm">5516105727021</p>
                <span className="text-[10px] text-stone-400">Driftwood Outdoor Camp</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-200 text-xs">
                <span className="text-stone-500">{t('telebirrAccount')}</span>
                <p className="font-mono font-bold text-stone-900 text-sm">0935347799</p>
                <span className="text-[10px] text-stone-400">Organizer Telebirr</span>
              </div>
            </div>
          </div>

          <button
            onClick={openRegisterModal}
            className="w-full mt-6 bg-[#183b2b] hover:bg-[#204a37] text-white font-black py-3 rounded-xl text-sm transition-colors cursor-pointer shadow-sm"
          >
            {t('enrollCamperBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};
