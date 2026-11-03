import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'am';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav & Brand
    brandName: 'DRIFTWOOD CAMP',
    tagline: 'Addis Ababa · Ages 8–12 · Real-Time Hub',
    home: 'Home',
    venueMap: 'Venue & Map',
    games: 'Family Games',
    parentPortal: 'Parent Portal',
    directorPortal: 'Director Portal',
    registerChild: 'Register Child',
    parent: 'Parent',
    director: 'Director',
    signIn: 'Sign In',
    signOut: 'Sign Out',

    // Hero
    eyebrow: 'Adventure · Friendship · Growth',
    heroTitle1: 'Big adventures.',
    heroTitle2: 'Brave young minds.',
    heroDesc: 'An outdoor nature and skills camp in Addis Ababa for children ages 8–12. Campers build practical wilderness skills, explore indigenous flora at Gulele Botanic Garden, create music, and discover teamwork with live real-time parent activity updates.',
    registerChildBtn: 'Register a Child',
    campVenueBtn: 'Camp Venue & Map',
    weekendSessions: 'Saturday & Sunday sessions',
    summerProgram: 'Summer 2-Month Program',
    capacityEnrolled: 'Capacity: {n} / 40 Enrolled',

    // Activities
    skillsTitle: 'Wilderness Skills',
    skillsDesc: 'Hands-on knot tying, shelter crafting, compass navigation, and basic outdoor safety fundamentals.',
    hikingTitle: 'Nature & Hiking',
    hikingDesc: 'Supervised botanical trails at Gulele Garden, indigenous plant discovery, and mountain birdwatching.',
    musicTitle: 'Music & Creativity',
    musicDesc: 'Rhythm circles, campfire songs, storytelling, skits, and nature craft using driftwood and pine cones.',
    olympiaTitle: 'Driftwood Olympia',
    olympiaDesc: 'Team obstacle challenges, friendly cooperative relays, and positive sportsmanship awards.',

    // Live Feed
    liveBroadcast: 'Live Database Broadcast',
    liveStreamTitle: 'Real-Time Camp Activity Log',
    liveStreamSubtitle: 'Powered by live cloud database updates. Organizers post notes & parents view them in real time.',
    activityStreamHeading: 'Real-Time Camp Activity Stream',
    activityStreamSub: 'Live attendance, milestones, and safety updates from camp organizers',
    filterCamper: 'Filter Camper',
    allCampers: 'All Campers',
    statusType: 'Status Type',
    allStatuses: 'All Statuses',
    searchKeywords: 'Search Keywords',
    searchPlaceholder: 'Trail, knot, snack, lunch...',
    connectingStream: 'Connecting to real-time activity stream...',
    noLogsFound: 'No activity logs found',
    noLogsDesc: 'Organizer updates will appear here automatically in real time.',
    liveSyncEnabled: '● Firestore Live Sync Enabled',
    showingUpdates: 'Showing {n} updates',
    postedBy: 'Posted by',

    // Schedule & Pricing
    scheduleEyebrow: 'Sample Day Itinerary',
    scheduleTitle: '8:00 AM – 4:00 PM Supervised Camp Day',
    fullSupervision: 'Full Supervision',
    campFeeEyebrow: 'Registration Fee',
    campFeeAmount: '1,000 ETB',
    campFeeDesc: 'Ages 8–12 · Includes guidance, trail entry, craft materials & badge.',
    officialAccounts: 'Official Payment Accounts:',
    dashenAccount: 'Dashen Bank Account:',
    telebirrAccount: 'Telebirr Mobile Account:',
    enrollCamperBtn: 'Enroll Camper Today',

    // Statuses
    arrived: 'Arrived',
    attended: 'Attended',
    checkedOut: 'Checked Out',
    update: 'Update',
    approved: 'Approved',
    pendingReview: 'Pending Review',
    waitingList: 'Waiting List',
    paid: 'Paid',
    pending: 'Pending',

    // Director Portal
    adminConsole: 'Administration Console',
    directorPortalTitle: 'Director & Organizer Portal',
    directorPortalDesc: 'Live capacity monitoring, legal review & director digital signatures, payment tracking, and real-time activity broadcasting to parents.',
    exportCsv: 'Export CSV',
    directorLoginTitle: 'Director Portal Login',
    directorLoginSub: 'Restricted to authorized camp directors to review applications, record ETB transfers, sign approval agreements, and post activity alerts.',
    directorUsername: 'Director Username',
    directorPassword: 'Director Password',
    signInDirectorBtn: 'Sign In to Director Portal',
    verifyingAccess: 'Verifying Access...',
    authorizedAccess: 'Authorized Access',
    telegramConnected: 'Telegram Bot Connected',
    signedInAsDirector: 'Director: show77',
    enterPasswordPlaceholder: 'Enter director password',
    enterUsernamePlaceholder: 'Enter director username',

    // Parent Portal
    guardianHub: 'Guardian Hub',
    welcomeParent: 'Welcome, {name}',
    parentSubtitle: 'Track your camper’s registration status, review digitally signed legal agreements, and follow real-time attendance and trail activities as they happen.',
    registerAnotherChild: '+ Register Another Child',
    parentProfileTitle: 'Parent Profile & Contact',
    storedInDb: 'Stored in database',
    editContact: 'Edit Contact',
    saveChanges: 'Save Changes',
    emailAddress: 'Email Address',
    phoneNumber: 'Phone Number',
    accountRole: 'Account Role',
    registeredCampers: 'Registered Campers ({n})',
    noCampersFound: 'No registered campers found',
    noCampersSub: 'You have not registered a child for Driftwood Camp yet. Submit a registration to start their outdoor journey!',
    registerChildNow: 'Register Child Now',
    attendanceDay: 'Attendance Day',
    transportation: 'Transportation',
    pickupArea: 'Pickup Area',
    paymentStatus: 'Payment Status',
    signedAgreementsTitle: 'Signed Consent & Legal Agreements',

    // Games
    familyGamesTitle: 'Family Camp Games',
    familyGamesSubtitle: 'Practice outdoor skills and nature awareness at home together with your camper.',
    scavengerHuntTitle: 'Nature Scavenger Hunt',
    scavengerHuntDesc: 'Observe without picking live plants or disturbing wildlife. Tick off each item when found outdoors or in the garden:',
    knotChallengeTitle: 'Knot-Learning Challenge',
    knotChallengeDesc: 'With adult supervision, practice essential camp knots with short soft cord or shoelaces.',
    memoryChallengeTitle: 'Camp Memory Challenge',
    memoryChallengeDesc: 'Memorize the 5 essential wilderness gear items, hide them, and see how many you can recall!',

    // Map
    campMapTitle: 'Gulele Botanic Garden',
    campMapSubtitle: 'Nestled on the northern mountain slopes of Addis Ababa, Gulele Botanic Garden spans over 700 hectares of native Afro-montane forest, natural streams, and protected endemic flora.',
    venueAccessTitle: 'Venue Access & Meeting Points',
    openGoogleMaps: 'Open in Google Maps',
    shuttleRoutesTitle: 'Supervised Shuttle Pickup Routes',
    packingChecklistTitle: 'Camper Packing Checklist',
  },

  am: {
    // Nav & Brand
    brandName: 'ድሪፍትዉድ ካምፕ',
    tagline: 'አዲስ አበባ · ዕድሜ 8–12 · የቀጥታ መረጃ ማዕከል',
    home: 'መነሻ',
    venueMap: 'ቦታ እና ካርታ',
    games: 'የቤተሰብ ጨዋታዎች',
    parentPortal: 'የወላጆች መድረክ',
    directorPortal: 'የዳይሬክተር መድረክ',
    registerChild: 'ልጅ ይመዝግቡ',
    parent: 'ወላጅ',
    director: 'ዳይሬክተር',
    signIn: 'ይግቡ',
    signOut: 'ይውጡ',

    // Hero
    eyebrow: 'ጀብዱ · ጓደኝነት · እድገት',
    heroTitle1: 'ታላላቅ ጀብዱዎች።',
    heroTitle2: 'ደፋር ወጣት አእምሮዎች።',
    heroDesc: 'በአዲስ አበባ ለሚገኙ ከ8–12 ዓመት ዕድሜ ላላቸው ልጆች የተዘጋጀ የቤት ውጭ የተፈጥሮ እና የክህሎት ካምፕ። ልጆች ተግባራዊ የዱር ክህሎቶችን ይማራሉ፣ በጉለሌ እፅዋት ማዕከል ውስጥ ይጓዛሉ፣ ሙዚቃ ይፈጥራሉ፣ እና የወላጆች የቀጥታ እንቅስቃሴ መከታተያ ጋር የቡድን ስራን ያገኛሉ።',
    registerChildBtn: 'ልጅ ይመዝግቡ',
    campVenueBtn: 'የካምፕ ቦታ እና ካርታ',
    weekendSessions: 'ቅዳሜ እና እሁድ ክፍለ ጊዜዎች',
    summerProgram: 'የ2 ወር የክረምት ፕሮግራም',
    capacityEnrolled: 'አቅም: {n} / 40 ልጆች ተመዝግበዋል',

    // Activities
    skillsTitle: 'የዱር አድን ክህሎቶች',
    skillsDesc: 'ገመድ ማሰር፣ መጠለያ መስራት፣ ኮምፓስ መጠቀም እና መሰረታዊ የቤት ውጭ ደህንነት መመሪያዎች።',
    hikingTitle: 'ተፈጥሮ እና የእግር ጉዞ',
    hikingDesc: 'በጉለሌ እፅዋት ማዕከል ውስጥ የሚመራ የተፈጥሮ መንገድ፣ የሀገር በቀል እፅዋት ጥናት እና የአእዋፍ እይታ።',
    musicTitle: 'ሙዚቃ እና ፈጠራ',
    musicDesc: 'የሪትም ክበቦች፣ የካምፕ መዝሙሮች፣ ተረት ተረት፣ እና ከተፈጥሮ እንጨት የሚሰሩ የእጅ ስራዎች።',
    olympiaTitle: 'ድሪፍትዉድ ኦሊምፒያ',
    olympiaDesc: 'የቡድን መሰናክል ጨዋታዎች፣ ወዳጃዊ ቅብብሎሽ ውድድሮች እና የመልካም ስነምግባር ሽልማቶች።',

    // Live Feed
    liveBroadcast: 'የቀጥታ ዳታቤዝ ስርጭት',
    liveStreamTitle: 'የቀጥታ የካምፕ እንቅስቃሴ መዝገብ',
    liveStreamSubtitle: 'በቀጥታ የዳታቤዝ ዝማኔ የሚሰራ። አዘጋጆች ማስታወሻዎችን ሲመዘግቡ ወላጆች ወዲያውኑ ይመለከታሉ።',
    activityStreamHeading: 'የቀጥታ የካምፕ እንቅስቃሴ ስርጭት',
    activityStreamSub: 'የቀጥታ መገኘት፣ የተከናወኑ ክንውኖች እና ከአዘጋጆች የሚሰጡ የደህንነት ማስታወሻዎች',
    filterCamper: 'ተሳታፊ ይምረጡ',
    allCampers: 'ሁሉም ልጆች',
    statusType: 'የሁኔታ አይነት',
    allStatuses: 'ሁሉም ሁኔታዎች',
    searchKeywords: 'በቁልፍ ቃል ይፈልጉ',
    searchPlaceholder: 'የእግር ጉዞ፣ ገመድ፣ ምሳ...',
    connectingStream: 'ከቀጥታ ስርጭት ጋር በመገናኘት ላይ...',
    noLogsFound: 'ምንም እንቅስቃሴዎች አልተገኙም',
    noLogsDesc: 'የአዘጋጅ ዝማኔዎች እዚህ ወዲያውኑ ይታያሉ።',
    liveSyncEnabled: '● የቀጥታ ዳታቤዝ ማመሳሰል ይሰራል',
    showingUpdates: '{n} ዝማኔዎች ታይተዋል',
    postedBy: 'የመዘገበው',

    // Schedule & Pricing
    scheduleEyebrow: 'የዕለቱ የጊዜ ሰሌዳ',
    scheduleTitle: 'ከጠዋቱ 2:00 – ከሰዓት 10:00 የተሟላ የካምፕ ቀን',
    fullSupervision: 'የተሟላ ክትትል',
    campFeeEyebrow: 'የምዝገባ ክፍያ',
    campFeeAmount: '1,000 ብር (ETB)',
    campFeeDesc: 'ከ8–12 ዓመት · መመሪያዎችን፣ የመግቢያ ክፍያን፣ የዕደ-ጥበብ ቁሳቁሶችን እና ባጅ ያካትታል።',
    officialAccounts: 'ክፍያ የሚፈፀምባቸው ሂሳቦች:',
    dashenAccount: 'ዳሽን ባንክ ሂሳብ ቁጥር:',
    telebirrAccount: 'ቴሌብር ሞባይል ሂሳብ ቁጥር:',
    enrollCamperBtn: 'ልጅዎን አሁኑኑ ያስመዝግቡ',

    // Statuses
    arrived: 'ደርሷል',
    attended: 'ተሳትፏል',
    checkedOut: 'ወጥቷል',
    update: 'ዝማኔ',
    approved: 'ፀድቋል',
    pendingReview: 'በግምገማ ላይ',
    waitingList: 'በተጠባባቂ ዝርዝር',
    paid: 'ተከፍሏል',
    pending: 'በመጠባበቅ ላይ',

    // Director Portal
    adminConsole: 'የአስተዳደር መድረክ',
    directorPortalTitle: 'የዳይሬክተር እና አዘጋጅ መድረክ',
    directorPortalDesc: 'የቀጥታ አቅም ክትትል፣ የህግ ሰነዶች ግምገማ እና የዲጂታል ፊርማ፣ የክፍያ ክትትል እና የቀጥታ እንቅስቃሴ ለወላጆች ማሰራጫ።',
    exportCsv: 'CSV አውርድ',
    directorLoginTitle: 'የዳይሬክተር መግቢያ',
    directorLoginSub: 'ማመልከቻዎችን ለመገምገም፣ የብር ዝውውሮችን ለመመዝገብ እና የፈቃድ ስምምነቶችን ለመፈረም ለተፈቀደላቸው የካምፕ ዳይሬክተሮች ብቻ የተገደበ።',
    directorUsername: 'የዳይሬክተር ተጠቃሚ ስም',
    directorPassword: 'የዳይሬክተር የይለፍ ቃል',
    signInDirectorBtn: 'ወደ ዳይሬክተር መድረክ ይግቡ',
    verifyingAccess: 'ፈቃድ በመረጋገጥ ላይ...',
    authorizedAccess: 'የተፈቀደ መዳረሻ',
    telegramConnected: 'የቴሌግራም ቦት ተገናኝቷል',
    signedInAsDirector: 'ዳይሬክተር: show77',
    enterPasswordPlaceholder: 'የዳይሬክተር የይለፍ ቃል ያስገቡ',
    enterUsernamePlaceholder: 'የዳይሬክተር የተጠቃሚ ስም ያስገቡ',

    // Parent Portal
    guardianHub: 'የወላጆች ማዕከል',
    welcomeParent: 'እንኳን ደህና መጡ፣ {name}',
    parentSubtitle: 'የልጅዎን የምዝገባ ሁኔታ ይከታተሉ፣ በዲጂታል የተፈረሙ ህጋዊ ስምምነቶችን ይገምግሙ፣ እና የቀጥታ መገኘት እና የተፈጥሮ የእግር ጉዞ እንቅስቃሴዎችን ይከታተሉ።',
    registerAnotherChild: '+ ሌላ ልጅ ያስመዝግቡ',
    parentProfileTitle: 'የወላጅ መረጃ እና አድራሻ',
    storedInDb: 'በዳታቤዝ ውስጥ የተከማቸ',
    editContact: 'አድራሻ ያርትዑ',
    saveChanges: 'ለውጦችን መዝግብ',
    emailAddress: 'የኢሜል አድራሻ',
    phoneNumber: 'ስልክ ቁጥር',
    accountRole: 'የአካውንት አይነት',
    registeredCampers: 'የተመዘገቡ ልጆች ({n})',
    noCampersFound: 'የተመዘገቡ ልጆች አልተገኙም',
    noCampersSub: 'እስካሁን ለድሪፍትዉድ ካምፕ ልጅ አላስመዘገቡም። የልጅዎን የቤት ውጭ ጉዞ ለመጀመር አሁኑኑ ይመዝገቡ!',
    registerChildNow: 'ልጅ አሁኑኑ ያስመዝግቡ',
    attendanceDay: 'የሚገኙበት ቀን',
    transportation: 'የትራንስፖርት አገልግሎት',
    pickupArea: 'መነሻ / መገናኛ ቦታ',
    paymentStatus: 'የክፍያ ሁኔታ',
    signedAgreementsTitle: 'የተፈረሙ የፈቃድ እና ህጋዊ ስምምነቶች',

    // Games
    familyGamesTitle: 'የቤተሰብ ካምፕ ጨዋታዎች',
    familyGamesSubtitle: 'ከቤት ውጭ ክህሎቶችን እና የተፈጥሮ ግንዛቤን ከልጅዎ ጋር በቤት ውስጥ አብረው ይለማመዱ።',
    scavengerHuntTitle: 'የተፈጥሮ ፍለጋ ጨዋታ',
    scavengerHuntDesc: 'ሕያዋን እፅዋትን ሳያጠፉ ወይም የዱር አራዊትን ሳይረብሹ ይከታተሉ። እያንዳንዱን ነገር ከቤት ውጭ ሲያገኙ ምልክት ያድርጉ:',
    knotChallengeTitle: 'ገመድ የማሰር ፈተና',
    knotChallengeDesc: 'በአዋቂዎች ክትትል ስር፣ አጫጭር ለስላሳ ገመዶችን በመጠቀም አስፈላጊ የካምፕ ቋጠሮዎችን ይለማመዱ።',
    memoryChallengeTitle: 'የካምፕ የማስታወስ ፈተና',
    memoryChallengeDesc: '5ቱን አስፈላጊ የካምፕ ዕቃዎች በቃላቸው ይያዙ፣ ይደብቋቸው እና ስንቱን ማስታወስ እንደሚችሉ ይመልከቱ!',

    // Map
    campMapTitle: 'ጉለሌ እፅዋት ማዕከል',
    campMapSubtitle: 'በሰሜን አዲስ አበባ ተራራዎች ላይ የሚገኘው የጉለሌ እፅዋት ማዕከል ከ700 ሄክታር በላይ የሆነ የሀገር በቀል ደን፣ የተፈጥሮ ጅረቶች እና የተጠበቁ ብርቅዬ እፅዋትን ይዟል።',
    venueAccessTitle: 'የመግቢያ እና የመገናኛ ቦታዎች',
    openGoogleMaps: 'በጎግል ካርታ ይክፈቱ',
    shuttleRoutesTitle: 'የካምፕ አውቶቡስ መነሻ መስመሮች',
    packingChecklistTitle: 'ለካምፕ የሚያስፈልጉ ዕቃዎች ዝርዝር',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('driftwood_lang') as Language) || 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('driftwood_lang', newLang);
  };

  const toggleLang = () => {
    const nextLang = lang === 'en' ? 'am' : 'en';
    setLang(nextLang);
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations.en?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
