/**
 * Dharma Setu (धर्म सेतु) — Client Application Logic
 * Implements the Serene Vedic Warmth design system and Stitch UI flows:
 * - Minimal Home Screen (Screen 1)
 * - Profile & Search Result with Milestone Tabs & Lightbox (Screen 2)
 * - Interactive Orbit Connection Graph (Screen 3)
 * - "Kab, kyun aur kaise" Timeline Stream (Screen 4)
 * - Voice Narration ("Sunao"), Speech Recognition, Hands-Free Mode, and Bookmarks
 */

// ---------------------------------------------------------------------------
// Internationalization & UI Dictionary
// ---------------------------------------------------------------------------
const I18N = {
  hinglish: {
    tagline: "धर्म सेतु",
    homeHeading: "धर्म सेतु",
    homeDesc: "Sanatana Gyan, Shastra Pramaan",
    searchPlaceholder: "Ram, Krishna, Draupadi, Ekadashi...",
    searchBtn: "Khojein",
    examplesLabel: "Udaharan:",
    recentTitle: "Haal hi mein dekha gaya",
    clearRecent: "Saaf karein",
    tabProfile: "Parichay",
    tabGraph: "Sambandh",
    tabTimeline: "Timeline",
    storyTitle: "Katha vistar",
    mapTitle: "Kaun kaun juda hai",
    mapSubtitle: "se jude log, ghatnayein aur pavitra granth",
    sourcesTitle: "Granthon mein",
    realLifeTitle: "Real life mein",
    traditionsTitle: "Paramparaon mein bhed",
    followupsTitle: "Aage ke sawal",
    shareBtn: "Share karein",
    copyBtn: "Copy karein",
    lowConfNotice: "Is jawab ko shastron se khud verify karein.",
    footerDisclaimer: "Jawab AI se bante hain, granthon se verify karein.",
    feedbackLink: "Galti batao",
    backText: "Peeche:",
    interpretedLabel: "Maine samjha:",
    didYouMeanLabel: "Shayad aapka matlab tha:",
    retryBtn: "Phir se try karein",
    errorTitle: "Kripya kshama karein",
    errorMsg: "Jawab laane mein thodi der ho rahi hai. Kripya punah prayas karein.",
    sheetExplore: "Inka sambandh padhein",
    toastCopied: "Link clipboard par copy ho gaya!",
    toastSummaryCopied: "Jawab copy ho gaya!",
    toastBookmarkAdded: "Sambandh bookmark ho gaya!",
    toastBookmarkRemoved: "Bookmark hata diya gaya.",
    sunaoBtn: "Sunao",
    rokoBtn: "Roko",
    handsfreeLabel: "Hands-Free",
    handsfreeOnToast: "Hands-free mode shuru! Jawab sunne ke baad agla sawal bolein.",
    handsfreeOffToast: "Hands-free mode band.",
    listeningTitle: "Sun raha hoon...",
    listeningHint: "Poochhein: 'Krishna kaun hain?', 'Draupadi katha'...",
    voiceCancel: "Band karein",
    voiceNotSupported: "Aapke browser mein aawaz suvidha uplabdh nahi hai.",
    voicePermissionDenied: "Microphone permission allow karein.",
    wikiSourceLabel: "Image: Wikimedia Commons",
    readMoreWiki: "Wikipedia par padhein",
    loadingPhrases: [
      "Shastron se pramanik khoj jaari hai...",
      "Granthon ke sandarbh jode ja rahe hain...",
      "Puranon aur Itihas se sambandh ban rahe hain..."
    ]
  },
  hi: {
    tagline: "सनातन ज्ञान सेतु",
    homeHeading: "धर्म सेतु",
    homeDesc: "सनातन ज्ञान, शास्त्र प्रमाण",
    searchPlaceholder: "राम, कृष्ण, द्रौपदी, एकादशी...",
    searchBtn: "खोजें",
    examplesLabel: "उदाहरण:",
    recentTitle: "हाल ही में देखा गया",
    clearRecent: "साफ करें",
    tabProfile: "परिचय",
    tabGraph: "संबंध",
    tabTimeline: "टाइमलाइन",
    storyTitle: "कथा विस्तार",
    mapTitle: "कौन-कौन जुड़ा है",
    mapSubtitle: "से जुड़े पात्र, घटनाएं और पवित्र ग्रंथ",
    sourcesTitle: "ग्रंथों में",
    realLifeTitle: "दैनिक जीवन में",
    traditionsTitle: "परंपराओं में भेद",
    followupsTitle: "आगे के प्रश्न",
    shareBtn: "साझा करें",
    copyBtn: "कॉपी करें",
    lowConfNotice: "इस उत्तर को शास्त्रों से स्वयं सत्यापित करें।",
    footerDisclaimer: "उत्तर AI द्वारा जनरेटेड हैं, ग्रंथों से पुष्टि करें।",
    feedbackLink: "त्रुटि बताएं",
    backText: "पिछला:",
    interpretedLabel: "मैंने समझा:",
    didYouMeanLabel: "क्या आपका तात्पर्य था:",
    retryBtn: "पुनः प्रयास करें",
    errorTitle: "कृपया क्षमा करें",
    errorMsg: "उत्तर प्राप्त करने में समय लग रहा है। कृपया पुनः प्रयास करें।",
    sheetExplore: "इनका संबंध पढ़ें",
    toastCopied: "लिंक कॉपी हो गया!",
    toastSummaryCopied: "उत्तर कॉपी हो गया!",
    toastBookmarkAdded: "संबंध बुकमार्क में सहेजा गया!",
    toastBookmarkRemoved: "बुकमार्क हटाया गया।",
    sunaoBtn: "सुनें",
    rokoBtn: "रोकें",
    handsfreeLabel: "हैंड्स-फ्री",
    handsfreeOnToast: "हैंड्स-फ्री मोड सक्रिय! उत्तर सुनने के बाद अगला प्रश्न बोलें।",
    handsfreeOffToast: "हैंड्स-फ्री मोड बंद।",
    listeningTitle: "सुन रहा हूँ...",
    listeningHint: "पूछें: 'कृष्ण कौन हैं?', 'द्रौपदी कथा'...",
    voiceCancel: "बंद करें",
    voiceNotSupported: "आपके ब्राउज़र में आवाज़ सुविधा उपलब्ध नहीं है।",
    voicePermissionDenied: "कृपया माइक्रोफ़ोन की अनुमति दें।",
    wikiSourceLabel: "चित्र: विकिमीडिया कॉमन्स",
    readMoreWiki: "विकिपीडिया पर पढ़ें",
    loadingPhrases: [
      "शास्त्रों से प्रामाणिक खोज जारी है...",
      "ग्रंथों के संदर्भ जोड़े जा रहे हैं...",
      "पुराणों और इतिहास से संबंध बन रहे हैं..."
    ]
  },
  en: {
    tagline: "Bridge to Dharma",
    homeHeading: "Dharma Setu",
    homeDesc: "Timeless Wisdom, Scriptural Evidence",
    searchPlaceholder: "Ram, Krishna, Draupadi, Ekadashi...",
    searchBtn: "Search",
    examplesLabel: "Examples:",
    recentTitle: "Recent Searches",
    clearRecent: "Clear",
    tabProfile: "Profile",
    tabGraph: "Connections",
    tabTimeline: "Timeline",
    storyTitle: "Detailed Narrative",
    mapTitle: "Who is Connected",
    mapSubtitle: "related people, scriptures, and events",
    sourcesTitle: "In Scriptures",
    realLifeTitle: "In Daily Life",
    traditionsTitle: "Where Traditions Differ",
    followupsTitle: "Follow-up Questions",
    shareBtn: "Share",
    copyBtn: "Copy",
    lowConfNotice: "Please verify this answer with authentic scriptures.",
    footerDisclaimer: "Answers are AI-generated, verify with authentic scriptures.",
    feedbackLink: "Report issue",
    backText: "Back to:",
    interpretedLabel: "Interpreted as:",
    didYouMeanLabel: "Did you mean:",
    retryBtn: "Retry",
    errorTitle: "We apologize",
    errorMsg: "The server is currently busy or taking longer than expected. Please try again.",
    sheetExplore: "Explore Connection",
    toastCopied: "Link copied to clipboard!",
    toastSummaryCopied: "Summary copied to clipboard!",
    toastBookmarkAdded: "Connection saved to bookmarks!",
    toastBookmarkRemoved: "Bookmark removed.",
    sunaoBtn: "Listen",
    rokoBtn: "Stop",
    handsfreeLabel: "Hands-Free",
    handsfreeOnToast: "Hands-free mode active! Speak next question after answer.",
    handsfreeOffToast: "Hands-free mode disabled.",
    listeningTitle: "Listening...",
    listeningHint: "Ask: 'Who is Krishna?', 'Draupadi story'...",
    voiceCancel: "Cancel",
    voiceNotSupported: "Voice recognition is not supported in this browser.",
    voicePermissionDenied: "Please allow microphone permission.",
    wikiSourceLabel: "Image: Wikimedia Commons",
    readMoreWiki: "Read on Wikipedia",
    loadingPhrases: [
      "Searching authentic scriptures...",
      "Tracing connections and references...",
      "Synthesizing classical commentary..."
    ]
  }
};

// ---------------------------------------------------------------------------
// Curated Draupadi Showcase Data (Stitch UI screens 2, 3, and 4)
// ---------------------------------------------------------------------------
const CURATED_DRAUPADI_DATA = {
  title: "Draupadi",
  devanagari: "(द्रौपदी)",
  type: "person",
  typeLabel: "Vyakti",
  summary: "Draupadi is the central heroine of the Mahabharata, born from the sacred yajna fire and known for her strength, wisdom, and steadfast dedication to dharma across complex trials.",
  story: [
    {
      tab: "Janm",
      text: "Raja Drupada ne Putrakameshti Yajna kiya tha, jiske pavitra agnikund se Draupadi prakat huin. Unka janm dharma aur nyaya ki sthapna ke uddeshya se hua tha."
    },
    {
      tab: "Vivah",
      text: "Arjun dwara matsyayantra bhedne ke uprant Mata Kunti ke anjane vachan aur Vedavyasa ke aashirvad se Draupadi ka vivah paancho Pandavo ke sath sampanna hua."
    },
    {
      tab: "Sabha Parv",
      text: "Dyuta Sabha mein Dushasana dwara cheer haran ke dushprayas par Draupadi ne sabha ke varishthon se naitik sawal kiye aur ananya sharanagati se Govinda ko pukara, jahan Shri Krishna ne akshaya cheer pradan kar maryada ki raksha ki."
    },
    {
      tab: "Seekh",
      text: "Draupadi ka charitra stree-shakti, aatm-samman, aur vipatti mein adharm ke viruddh aawaz uthane ka prateek hai. Unka jeevan shikhata hai ki chup rehna adharma ko badhava deta hai."
    }
  ],
  sources: [
    "Mahabharata: Adi Parva aur Sabha Parva",
    "Srimad Bhagavatam: Skandha 1, Adhyaya 7",
    "Kashiram Dasi Parva: Vana Parva ke prasang"
  ],
  real_life: "Draupadi atmasamman aur annyay ke viruddh aawaz uthane ki prateek hain. Unka jeevan sikhata hai ki kathin paristhitiyon mein bhi sach aur naitikta par kayam rehna chahiye.",
  traditions_differ: "Dakshin Bharat aur Lok-parampara mein Draupadi ko shakti ka avatar manakar 'Draupadi Amman' ke roop mein pooja jaata hai, jabki Sanskrit itihas mein unhe yajna-sambhuta naitik nayika ke roop mein sthapit kiya gaya hai.",
  connections: {
    krishna: {
      id: "krishna",
      name: "Krishna",
      devanagari: "(श्रीकृष्ण)",
      type: "person",
      relation: "Sakha aur rakshak",
      icon: "spa",
      desc: "Govinda answered her silent prayer during Sabha Parva; their bond transcended mortal friendship as divine protector (Sakha) honoring absolute surrender (Sharanagati).",
      citation: "Mahabharat, Sabha Parva (Shloka 68)"
    },
    arjun: {
      id: "arjun",
      name: "Arjun",
      devanagari: "(अर्जुन)",
      type: "person",
      relation: "Pati aur dhanurdhar",
      icon: "sports_martial_arts",
      desc: "Won Draupadi's hand at the grand Matsya Vedha svayamvara through peerless skill; shared deep spiritual alignment during their twelve years of vanavasa.",
      citation: "Mahabharat, Adi Parva (Adhyaya 187)"
    },
    mahabharat: {
      id: "mahabharat",
      name: "Mahabharat",
      devanagari: "(महाभारतम्)",
      type: "scripture",
      relation: "Pavitra granth",
      icon: "menu_book",
      desc: "Veda Vyasa's itihasa where Draupadi acts as the moral axis and unyielding catalyst of cosmic justice, upholding Dharma against institutional silence.",
      citation: "Mahabharat, Samasta 18 Parva"
    },
    kurusabha: {
      id: "kurusabha",
      name: "Kuru Sabha",
      devanagari: "(कुरु सभा)",
      type: "event",
      relation: "Cheer haran ghatna",
      icon: "gavel",
      desc: "The assembly where Draupadi interrogated the wisest elders on legality and righteousness, exposing moral decay before Krishna shielded her honor.",
      citation: "Mahabharat, Sabha Parva (Adhyaya 67-69)"
    },
    kurukshetra: {
      id: "kurukshetra",
      name: "Kurukshetra",
      devanagari: "(कुरुक्षेत्र)",
      type: "place",
      relation: "Yuddha sankalp kshetra",
      icon: "flag",
      desc: "The sacred battleground where the solemn vow regarding Draupadi's open hair was fulfilled through the defeat of adharma.",
      citation: "Mahabharat, Bhishma Parva (Adhyaya 1)"
    },
    bhima: {
      id: "bhima",
      name: "Bhima",
      devanagari: "(भीमसेन)",
      type: "person",
      relation: "Rakshak aur gadadhar",
      icon: "fitness_center",
      desc: "Her fierce protector who vowed to defeat Dushasana and Duryodhana, fulfilling every promise made to restore her dignity during their exile.",
      citation: "Mahabharat, Sabha Parva (Adhyaya 71)"
    },
    pandavas: {
      id: "pandavas",
      name: "Pandavas",
      devanagari: "(पाण्डव)",
      type: "person",
      relation: "Panchali parivar",
      icon: "groups",
      desc: "United in sacred duty under Kunti's maternal direction; Draupadi governed the royal household at Indraprastha with exceptional wisdom.",
      citation: "Mahabharat, Adi Parva (Adhyaya 190)"
    },
    yudhishthir: {
      id: "yudhishthir",
      name: "Yudhishthir",
      devanagari: "(युधिष्ठिर)",
      type: "person",
      relation: "Jyeshtha pati (Dharmaraj)",
      icon: "balance",
      desc: "The righteous king whose devotion to abstract truth was examined and respected by Draupadi through deep philosophical discourses.",
      citation: "Mahabharat, Vana Parva (Adhyaya 32)"
    }
  },
  timeline: [
    {
      phase: "pehle",
      era: "Dwapar Yug",
      parva: "Adi Parva",
      title: "Yajna se divya janm",
      text: "Maharaj Drupada ke Putrakameshti Yajna ki pavitra agni se Draupadi ka divya aavirbhav hua.",
      kyun_hua: null
    },
    {
      phase: "pehle",
      era: "Dwapar Yug",
      parva: "Adi Parva",
      title: "Matsya vedha aur vivah",
      text: "Arjun dwara matsyayantra bhedne ke uprant Kunti ke vachan se paancho Pandavo se vivah sampanna hua.",
      kyun_hua: null
    },
    {
      phase: "is_kahani_mein",
      era: "Dyuta Sabha",
      parva: "Sabha Parva",
      title: "Dyuta krida (Chausar ka khel)",
      text: "Shakuni ke kootneeti purna paanso se Yudhishthira ne rajya sahit Draupadi ko daav par lagakar haar diya.",
      kyun_hua: "Duryodhana ki irshya aur Shakuni ke chhal ke karan Pandavo ko Hastinapur bulaakar aamantrit kiya gaya tha."
    },
    {
      phase: "is_kahani_mein",
      era: "Kuru Sabha",
      parva: "Sabha Parva",
      title: "Cheer haran aur Govinda ki sharan",
      text: "Dushasana ke dushprayas par Draupadi ne ananya sharanagati se Shri Krishna ko pukara aur maryada ki raksha hui.",
      kyun_hua: "Sabha ke varishthon ke maun ke beech Draupadi ne aatm-samman aur dharmik nayay ka aahvan kiya."
    },
    {
      phase: "baad_mein",
      era: "Kamyaka Van",
      parva: "Vana Parva",
      title: "12 varsh vanvaas aur agyatvaas",
      text: "Pandavo sang vanvaas aur Matsya desh mein Sairandhri ke roop mein kathin samay vyateet kiya.",
      kyun_hua: null
    },
    {
      phase: "baad_mein",
      era: "Kurukshetra",
      parva: "Yuddha Parva",
      title: "Maha-sangram aur adharma ka ant",
      text: "18 dino ke Kurukshetra yuddha ke sath adharma ka vinash hua aur pratijna purna hui.",
      kyun_hua: null
    },
    {
      phase: "parampara",
      era: "Aaj ki parampara",
      parva: "Living Tradition",
      title: "Draupadi Amman Utsav & Cheer Haran Leela",
      text: "Dakshin Bharat mein har saal Draupadi Amman festival aur Fire-walking (Theemithi) parampara manayi jaati hai, jo stree-shakti aur satya ki vijay ka prateek hai.",
      cta: "Parampara ke baare mein vistar se jaanein"
    }
  ]
};

// ---------------------------------------------------------------------------
// Application State
// ---------------------------------------------------------------------------
const STATE = {
  lang: localStorage.getItem("dharmasetu_lang") || "hinglish",
  theme: localStorage.getItem("dharmasetu_theme") || "light",
  currentQuery: "",
  currentData: null,
  currentWikiData: null,
  activeStoryTab: 0,
  activeView: "profile", // 'profile' | 'graph' | 'timeline'
  activeGraphFilter: "all",
  activeGraphNode: null,
  graphZoom: 1.0,
  topicHistory: [],
  recentSearches: JSON.parse(localStorage.getItem("dharmasetu_recent") || "[]"),
  bookmarks: JSON.parse(localStorage.getItem("dharmasetu_bookmarks") || "[]"),
  handsFreeMode: false,
  isSpeaking: false,
  isListening: false,
  loadingTimer: null,
  wikiCache: new Map()
};

// ---------------------------------------------------------------------------
// DOM Elements Registry
// ---------------------------------------------------------------------------
const DOM = {
  html: document.documentElement,
  brandHomeBtn: document.getElementById("brand-home-btn"),
  themeToggleBtn: document.getElementById("theme-toggle-btn"),
  headerBookmarksBtn: document.getElementById("header-bookmarks-btn"),
  bookmarkBadge: document.getElementById("bookmark-badge"),
  langBtns: document.querySelectorAll(".lang-btn"),

  // Views
  homeView: document.getElementById("home-view"),
  loadingView: document.getElementById("loading-view"),
  errorView: document.getElementById("error-view"),
  resultView: document.getElementById("result-view"),

  // Home Elements
  homeSearchForm: document.getElementById("home-search-form"),
  homeSearchInput: document.getElementById("home-search-input"),
  homeClearBtn: document.getElementById("home-clear-btn"),
  homeMicBtn: document.getElementById("home-mic-btn"),
  exampleChips: document.getElementById("example-chips"),
  recentSearchesBox: document.getElementById("recent-searches-box"),
  recentChips: document.getElementById("recent-chips"),
  clearRecentBtn: document.getElementById("clear-recent-btn"),

  // Loading & Error Elements
  loadingPhrase: document.getElementById("loading-phrase"),
  retryBtn: document.getElementById("retry-btn"),
  errorTitle: document.getElementById("error-title"),
  errorMessage: document.getElementById("error-message"),

  // Result Header & View Switcher
  resultBackBtn: document.getElementById("result-back-btn"),
  resultSearchQueryText: document.getElementById("result-search-query-text"),
  resultSearchClearBtn: document.getElementById("result-search-clear-btn"),
  sunaoQuickBtn: document.getElementById("sunao-quick-btn"),
  sunaoQuickIcon: document.getElementById("sunao-quick-icon"),
  viewTabBtns: document.querySelectorAll(".view-tab-btn"),
  viewTabProfile: document.getElementById("view-tab-profile"),
  viewTabGraph: document.getElementById("view-tab-graph"),
  viewTabTimeline: document.getElementById("view-tab-timeline"),

  // Breadcrumbs & Misspelling Box
  breadcrumbBar: document.getElementById("breadcrumb-bar"),
  breadcrumbBackBtn: document.getElementById("breadcrumb-back-btn"),
  breadcrumbBackText: document.getElementById("breadcrumb-back-text"),
  breadcrumbPrevTopic: document.getElementById("breadcrumb-prev-topic"),
  resInterpretedBox: document.getElementById("res-interpreted-box"),
  resInterpretedAs: document.getElementById("res-interpreted-as"),
  resDidYouMeanBox: document.getElementById("res-did-you-mean-box"),
  resDidYouMeanChips: document.getElementById("res-did-you-mean-chips"),

  // Portrait Photo & Media Card (Screen 2)
  cardWiki: document.getElementById("card-wiki"),
  cardWikiSkeleton: document.getElementById("card-wiki-skeleton"),
  wikiImageBox: document.getElementById("wiki-image-box"),
  wikiThumbImg: document.getElementById("wiki-thumb-img"),
  wikiMandalaPlaceholder: document.getElementById("wiki-mandala-placeholder"),
  wikiZoomBadge: document.getElementById("wiki-zoom-badge"),
  wikiPhotoCaption: document.getElementById("wiki-photo-caption"),
  wikiReadLink: document.getElementById("wiki-read-link"),
  uiWikiReadMore: document.getElementById("ui-wiki-read-more"),

  // Profile Card & Story Tabs (Screen 2)
  cardAiSkeleton: document.getElementById("card-ai-skeleton"),
  cardHero: document.getElementById("card-hero"),
  resTitleMain: document.getElementById("res-title-main"),
  resTitleDevanagari: document.getElementById("res-title-devanagari"),
  resTypeBadge: document.getElementById("res-type-badge"),
  resSummary: document.getElementById("res-summary"),
  cardStory: document.getElementById("card-story"),
  storyTabsNav: document.getElementById("story-tabs-nav"),
  storyTabContent: document.getElementById("story-tab-content"),
  resLowConfidence: document.getElementById("res-low-confidence"),

  // Audio Control Bar (Sunao & Hands-Free)
  audioControlBar: document.getElementById("audio-control-bar"),
  sunaoBtn: document.getElementById("sunao-btn"),
  uiSunaoBtnText: document.getElementById("ui-sunao-btn-text"),
  iconSunaoPlay: document.getElementById("icon-sunao-play"),
  iconSunaoStop: document.getElementById("icon-sunao-stop"),
  audioWaveformBars: document.getElementById("audio-waveform-bars"),
  handsfreeToggleBtn: document.getElementById("handsfree-toggle-btn"),
  uiHandsfreeText: document.getElementById("ui-handsfree-text"),
  handsfreeStatusDot: document.getElementById("handsfree-status-dot"),

  // Profile Cards
  cardSources: document.getElementById("card-sources"),
  resSourcesList: document.getElementById("res-sources-list"),
  cardRealLife: document.getElementById("card-real-life"),
  resRealLife: document.getElementById("res-real-life"),
  cardTraditions: document.getElementById("card-traditions"),
  resTraditions: document.getElementById("res-traditions"),
  jumpToGraphBtn: document.getElementById("jump-to-graph-btn"),
  jumpToTimelineBtn: document.getElementById("jump-to-timeline-btn"),
  cardFollowups: document.getElementById("card-followups"),
  resFollowupsList: document.getElementById("res-followups-list"),
  shareBtn: document.getElementById("share-btn"),
  copySummaryBtn: document.getElementById("copy-summary-btn"),

  // Connection Graph View (Screen 3)
  graphSubtitle: document.getElementById("graph-subtitle"),
  graphFilterBar: document.getElementById("graph-filter-bar"),
  graphViewport: document.getElementById("graph-viewport"),
  connectionSvg: document.getElementById("connection-svg"),
  mapEdgesLayer: document.getElementById("map-edges-layer"),
  graphCenterNode: document.getElementById("graph-center-node"),
  graphCenterTitle: document.getElementById("graph-center-title"),
  graphCenterDevanagari: document.getElementById("graph-center-devanagari"),
  mapNodesLayer: document.getElementById("map-nodes-layer"),
  graphZoomInBtn: document.getElementById("graph-zoom-in-btn"),
  graphZoomOutBtn: document.getElementById("graph-zoom-out-btn"),

  // Connection Bottom Card (Screen 3)
  connectionBottomCard: document.getElementById("connection-bottom-card"),
  cardIcon: document.getElementById("card-icon"),
  cardTitle: document.getElementById("card-title"),
  cardRelation: document.getElementById("card-relation"),
  cardDescription: document.getElementById("card-description"),
  cardCitation: document.getElementById("card-citation"),
  cardExploreBtn: document.getElementById("card-explore-btn"),
  cardBookmarkBtn: document.getElementById("card-bookmark-btn"),
  cardBookmarkIcon: document.getElementById("card-bookmark-icon"),

  // Timeline View (Screen 4)
  timelineStreamContainer: document.getElementById("timeline-stream-container"),
  timelineEventsContent: document.getElementById("timeline-events-content"),

  // Sticky Bottom Search
  stickyBottomBar: document.getElementById("sticky-bottom-bar"),
  stickySearchForm: document.getElementById("sticky-search-form"),
  stickySearchInput: document.getElementById("sticky-search-input"),
  stickyMicBtn: document.getElementById("sticky-mic-btn"),

  // Modals & Drawers
  bottomSheetBackdrop: document.getElementById("bottom-sheet-backdrop"),
  nodeBottomSheet: document.getElementById("node-bottom-sheet"),
  sheetNodeName: document.getElementById("sheet-node-name"),
  sheetNodeType: document.getElementById("sheet-node-type"),
  sheetNodeRelation: document.getElementById("sheet-node-relation"),
  sheetNodeSource: document.getElementById("sheet-node-source"),
  sheetExploreBtn: document.getElementById("sheet-explore-btn"),
  sheetCloseBtn: document.getElementById("sheet-close-btn"),

  voiceModalBackdrop: document.getElementById("voice-modal-backdrop"),
  voiceModal: document.getElementById("voice-modal"),
  voiceStatusText: document.getElementById("voice-status-text"),
  voiceHintText: document.getElementById("voice-hint-text"),
  voiceTranscript: document.getElementById("voice-transcript"),
  voiceCancelBtn: document.getElementById("voice-cancel-btn"),

  lightboxModal: document.getElementById("lightbox-modal"),
  lightboxBackdrop: document.getElementById("lightbox-backdrop"),
  lightboxCloseBtn: document.getElementById("lightbox-close-btn"),
  lightboxImg: document.getElementById("lightbox-img"),
  lightboxCaption: document.getElementById("lightbox-caption"),

  bookmarksBackdrop: document.getElementById("bookmarks-backdrop"),
  bookmarksDrawer: document.getElementById("bookmarks-drawer"),
  bookmarksCloseBtn: document.getElementById("bookmarks-close-btn"),
  bookmarksList: document.getElementById("bookmarks-list"),
  bookmarksEmptyNotice: document.getElementById("bookmarks-empty-notice"),

  toastPopup: document.getElementById("toast-popup"),

  // I18N Labels
  uiTagline: document.getElementById("ui-tagline"),
  uiHomeHeading: document.getElementById("ui-home-heading"),
  uiHomeDesc: document.getElementById("ui-home-desc"),
  uiExamplesLabel: document.getElementById("ui-examples-label"),
  uiRecentTitle: document.getElementById("ui-recent-title"),
  uiInterpretedLabel: document.getElementById("ui-interpreted-label"),
  uiDidYouMeanLabel: document.getElementById("ui-did-you-mean-label"),
  uiSourcesTitle: document.getElementById("ui-sources-title"),
  uiReallifeTitle: document.getElementById("ui-reallife-title"),
  uiTraditionsTitle: document.getElementById("ui-traditions-title"),
  uiFollowupsTitle: document.getElementById("ui-followups-title"),
  uiShareBtnText: document.getElementById("ui-share-btn-text"),
  uiCopyBtnText: document.getElementById("ui-copy-btn-text"),
  uiLowConfText: document.getElementById("ui-low-conf-text"),
  uiFooterDisclaimer: document.getElementById("ui-footer-disclaimer"),
  uiFeedbackLink: document.getElementById("ui-feedback-link"),
  uiRetryBtnText: document.getElementById("ui-retry-btn-text"),
  uiVoiceCancelText: document.getElementById("ui-voice-cancel-text")
};

// ---------------------------------------------------------------------------
// Theme & Language
// ---------------------------------------------------------------------------
function applyTheme(theme) {
  STATE.theme = theme;
  DOM.html.setAttribute("data-theme", theme);
  localStorage.setItem("dharmasetu_theme", theme);
}

function applyLanguage(lang) {
  if (!I18N[lang]) lang = "hinglish";
  STATE.lang = lang;
  localStorage.setItem("dharmasetu_lang", lang);

  DOM.langBtns.forEach(btn => {
    const isActive = btn.dataset.lang === lang;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-pressed", isActive ? "true" : "false");
  });

  const t = I18N[lang];
  if (DOM.uiTagline) DOM.uiTagline.textContent = t.tagline;
  if (DOM.uiHomeHeading) DOM.uiHomeHeading.textContent = t.homeHeading;
  if (DOM.uiHomeDesc) DOM.uiHomeDesc.textContent = t.homeDesc;
  if (DOM.homeSearchInput) DOM.homeSearchInput.placeholder = t.searchPlaceholder;
  if (DOM.uiExamplesLabel) DOM.uiExamplesLabel.textContent = t.examplesLabel;
  if (DOM.uiRecentTitle) DOM.uiRecentTitle.textContent = t.recentTitle;
  if (DOM.clearRecentBtn) DOM.clearRecentBtn.textContent = t.clearRecent;
  if (DOM.uiInterpretedLabel) DOM.uiInterpretedLabel.textContent = t.interpretedLabel;
  if (DOM.uiDidYouMeanLabel) DOM.uiDidYouMeanLabel.textContent = t.didYouMeanLabel;
  if (DOM.uiSourcesTitle) DOM.uiSourcesTitle.textContent = t.sourcesTitle;
  if (DOM.uiReallifeTitle) DOM.uiReallifeTitle.textContent = t.realLifeTitle;
  if (DOM.uiTraditionsTitle) DOM.uiTraditionsTitle.textContent = t.traditionsTitle;
  if (DOM.uiFollowupsTitle) DOM.uiFollowupsTitle.textContent = t.followupsTitle;
  if (DOM.uiShareBtnText) DOM.uiShareBtnText.textContent = t.shareBtn;
  if (DOM.uiCopyBtnText) DOM.uiCopyBtnText.textContent = t.copyBtn;
  if (DOM.uiLowConfText) DOM.uiLowConfText.textContent = t.lowConfNotice;
  if (DOM.uiFooterDisclaimer) DOM.uiFooterDisclaimer.textContent = t.footerDisclaimer;
  if (DOM.uiFeedbackLink) DOM.uiFeedbackLink.textContent = t.feedbackLink;
  if (DOM.uiRetryBtnText) DOM.uiRetryBtnText.textContent = t.retryBtn;
  if (DOM.uiSunaoBtnText) DOM.uiSunaoBtnText.textContent = STATE.isSpeaking ? t.rokoBtn : t.sunaoBtn;
  if (DOM.uiHandsfreeText) DOM.uiHandsfreeText.textContent = t.handsfreeLabel;
  if (DOM.voiceStatusText) DOM.voiceStatusText.textContent = t.listeningTitle;
  if (DOM.voiceHintText) DOM.voiceHintText.textContent = t.listeningHint;
  if (DOM.uiVoiceCancelText) DOM.uiVoiceCancelText.textContent = t.voiceCancel;
  if (DOM.uiWikiReadMore) DOM.uiWikiReadMore.textContent = t.readMoreWiki;

  // Re-fetch current query if already displaying a result to translate it
  if (STATE.currentQuery && !DOM.resultView.hidden) {
    fetchExplanation(STATE.currentQuery, null, true);
  }
}

// ---------------------------------------------------------------------------
// View Transitions
// ---------------------------------------------------------------------------
function switchMainView(viewName) {
  DOM.homeView.hidden = viewName !== "home";
  DOM.loadingView.hidden = viewName !== "loading";
  DOM.errorView.hidden = viewName !== "error";
  DOM.resultView.hidden = viewName !== "result";

  DOM.stickyBottomBar.hidden = viewName !== "result";
  if (viewName !== "loading" && STATE.loadingTimer) {
    clearInterval(STATE.loadingTimer);
    STATE.loadingTimer = null;
  }
}

function switchResultTab(tabName) {
  STATE.activeView = tabName;
  DOM.viewTabBtns.forEach(btn => {
    const isTarget = btn.dataset.target === `view-tab-${tabName}`;
    btn.classList.toggle("active", isTarget);
  });

  DOM.viewTabProfile.classList.toggle("active", tabName === "profile");
  DOM.viewTabGraph.classList.toggle("active", tabName === "graph");
  DOM.viewTabTimeline.classList.toggle("active", tabName === "timeline");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---------------------------------------------------------------------------
// Toast Notifications
// ---------------------------------------------------------------------------
let toastTimeout = null;
function showToast(message) {
  if (!DOM.toastPopup) return;
  DOM.toastPopup.textContent = message;
  DOM.toastPopup.hidden = false;
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    DOM.toastPopup.hidden = true;
  }, 2800);
}

// ---------------------------------------------------------------------------
// Bookmarks System
// ---------------------------------------------------------------------------
function updateBookmarkBadge() {
  const count = STATE.bookmarks.length;
  if (count > 0) {
    DOM.bookmarkBadge.textContent = count > 9 ? "9+" : count;
    DOM.bookmarkBadge.hidden = false;
  } else {
    DOM.bookmarkBadge.hidden = true;
  }
}

function renderBookmarksList() {
  DOM.bookmarksList.innerHTML = "";
  if (STATE.bookmarks.length === 0) {
    DOM.bookmarksEmptyNotice.hidden = false;
    return;
  }
  DOM.bookmarksEmptyNotice.hidden = true;

  STATE.bookmarks.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "bookmark-item-card";

    const info = document.createElement("div");
    info.className = "bookmark-item-info";
    info.innerHTML = `
      <div class="bookmark-item-title">${item.title}</div>
      <div class="bookmark-item-relation">${item.subtitle || "Sanatana Dharma"}</div>
    `;
    info.addEventListener("click", () => {
      closeBookmarksDrawer();
      fetchExplanation(item.query || item.title);
    });

    const removeBtn = document.createElement("button");
    removeBtn.className = "bookmark-remove-btn";
    removeBtn.innerHTML = `<span class="material-symbols-outlined text-[18px]">delete</span>`;
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      STATE.bookmarks.splice(index, 1);
      localStorage.setItem("dharmasetu_bookmarks", JSON.stringify(STATE.bookmarks));
      updateBookmarkBadge();
      renderBookmarksList();
      showToast(I18N[STATE.lang].toastBookmarkRemoved);
    });

    card.appendChild(info);
    card.appendChild(removeBtn);
    DOM.bookmarksList.appendChild(card);
  });
}

function openBookmarksDrawer() {
  renderBookmarksList();
  DOM.bookmarksBackdrop.hidden = false;
  DOM.bookmarksDrawer.hidden = false;
}

function closeBookmarksDrawer() {
  DOM.bookmarksBackdrop.hidden = true;
  DOM.bookmarksDrawer.hidden = true;
}

// ---------------------------------------------------------------------------
// API Client (Hybrid Wikipedia + Gemini Flow)
// ---------------------------------------------------------------------------
async function fetchWikiData(query, lang) {
  const cacheKey = `${lang}:${query.toLowerCase().trim()}`;
  if (STATE.wikiCache.has(cacheKey)) {
    return STATE.wikiCache.get(cacheKey);
  }

  try {
    const url = `/api/wiki?q=${encodeURIComponent(query)}&lang=${encodeURIComponent(lang)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    STATE.wikiCache.set(cacheKey, data);
    return data;
  } catch (err) {
    console.warn("Wiki fetch error:", err);
    return { found: false };
  }
}

async function fetchExplanation(query, context = null, isLangSwitch = false) {
  if (!query || !query.trim()) return;
  const trimmed = query.trim();

  // Handle back-stack history
  if (!isLangSwitch && STATE.currentQuery && STATE.currentQuery !== trimmed) {
    STATE.topicHistory.push({
      q: STATE.currentQuery,
      title: STATE.currentData?.title || STATE.currentQuery
    });
  }

  STATE.currentQuery = trimmed;
  DOM.resultSearchQueryText.textContent = trimmed;
  DOM.stickySearchInput.value = "";

  // Switch to loading view
  switchMainView("loading");
  startLoadingPhrases();

  // Reset Skeletons
  DOM.cardWiki.hidden = true;
  DOM.cardWikiSkeleton.hidden = false;
  DOM.cardAiSkeleton.hidden = false;
  DOM.cardHero.hidden = true;

  // Fire Wikipedia & Gemini /api/explain in parallel
  const wikiPromise = fetchWikiData(trimmed, STATE.lang);

  const explainPayload = {
    q: trimmed,
    lang: STATE.lang
  };
  if (context) explainPayload.context = context;

  const explainPromise = fetch("/api/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(explainPayload)
  });

  // Render Wikipedia Card as soon as it arrives!
  let resolvedWikiData = null;
  wikiPromise.then((wikiData) => {
    resolvedWikiData = wikiData;
    if (STATE.currentQuery === trimmed) {
      renderWikiPortrait(wikiData);
    }
  }).catch((err) => {
    console.warn("Wiki parallel resolution error:", err);
  });

  try {
    const explainRes = await explainPromise;
    if (!explainRes.ok) {
      throw new Error(`HTTP error: ${explainRes.status}`);
    }
    const data = await explainRes.json();

    // Check if user navigated away while fetching
    if (STATE.currentQuery !== trimmed) return;

    STATE.currentData = data;
    addRecentSearch(data.title || trimmed);

    // Switch to Result View
    switchMainView("result");
    switchResultTab("profile");

    // Render Full Results across all 3 Stitch screens!
    renderProfileView(data);
    renderConnectionGraph(data);
    renderTimelineView(data);

    // Ensure photo reflects official data type
    if (resolvedWikiData) {
      renderWikiPortrait(resolvedWikiData);
    }
  } catch (err) {
    console.error("Error fetching explanation:", err);
    // Special fallback for Draupadi if network is completely offline/overloaded
    if (/draupadi|drapati|panchali/i.test(trimmed)) {
      renderDraupadiShowcase();
      return;
    }
    showError(err.message);
  }
}

// ---------------------------------------------------------------------------
// Screen 2: Render Profile View
// ---------------------------------------------------------------------------
function renderProfileView(data) {
  DOM.cardAiSkeleton.hidden = true;
  DOM.cardHero.hidden = false;

  // Title & Devanagari
  const mainTitle = data.title || STATE.currentQuery;
  DOM.resTitleMain.textContent = mainTitle;
  
  // Extract Devanagari script if present in did_you_mean or title
  let devanagari = "";
  if (data.did_you_mean && Array.isArray(data.did_you_mean)) {
    const devaMatch = data.did_you_mean.find(d => /[\u0900-\u097F]/.test(d));
    if (devaMatch) devanagari = ` (${devaMatch})`;
  }
  DOM.resTitleDevanagari.textContent = devanagari;

  // Type Badge
  const typeMap = {
    person: "Vyakti",
    scripture: "Granth",
    event: "Ghatna",
    tradition: "Parampara",
    place: "Sthan",
    concept: "Siddhanta"
  };
  DOM.resTypeBadge.textContent = typeMap[data.type] || "Sanatana";
  DOM.resTypeBadge.className = `type-badge type-${data.type || "person"}`;

  // Summary
  DOM.resSummary.textContent = data.summary || "";

  // Misspelling Interpretation / Did you mean
  if (data.interpreted_as && data.interpreted_as.toLowerCase() !== STATE.currentQuery.toLowerCase()) {
    DOM.resInterpretedAs.textContent = data.interpreted_as;
    DOM.resInterpretedBox.hidden = false;
  } else {
    DOM.resInterpretedBox.hidden = true;
  }

  if (data.did_you_mean && data.did_you_mean.length > 0) {
    DOM.resDidYouMeanChips.innerHTML = "";
    data.did_you_mean.forEach(term => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "did-you-mean-chip";
      chip.textContent = term;
      chip.addEventListener("click", () => fetchExplanation(term));
      DOM.resDidYouMeanChips.appendChild(chip);
    });
    DOM.resDidYouMeanBox.hidden = false;
  } else {
    DOM.resDidYouMeanBox.hidden = true;
  }

  // Story Milestones Tabs (Screen 2: Janm, Vivah, Sabha Parv, Seekh etc.)
  if (data.story && Array.isArray(data.story) && data.story.length > 0) {
    renderStoryTabs(data.story);
    DOM.cardStory.hidden = false;
  } else {
    DOM.cardStory.hidden = true;
  }

  // Scripture Sources ("Granthon mein")
  DOM.resSourcesList.innerHTML = "";
  if (data.sources && Array.isArray(data.sources) && data.sources.length > 0) {
    data.sources.forEach(src => {
      const li = document.createElement("li");
      li.textContent = src;
      DOM.resSourcesList.appendChild(li);
    });
    DOM.cardSources.hidden = false;
  } else {
    DOM.cardSources.hidden = true;
  }

  // Real Life Mein
  if (data.real_life && data.real_life.trim()) {
    DOM.resRealLife.textContent = data.real_life;
    DOM.cardRealLife.hidden = false;
  } else {
    DOM.cardRealLife.hidden = true;
  }

  // Traditions Differ
  if (data.traditions_differ && data.traditions_differ.trim()) {
    DOM.resTraditions.textContent = data.traditions_differ;
    DOM.cardTraditions.hidden = false;
  } else {
    DOM.cardTraditions.hidden = true;
  }

  // Follow-up Questions
  DOM.resFollowupsList.innerHTML = "";
  if (data.follow_ups && Array.isArray(data.follow_ups) && data.follow_ups.length > 0) {
    data.follow_ups.forEach(q => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "followup-chip-btn";
      btn.textContent = q;
      btn.addEventListener("click", () => fetchExplanation(q, data.title));
      DOM.resFollowupsList.appendChild(btn);
    });
    DOM.cardFollowups.hidden = false;
  } else {
    DOM.cardFollowups.hidden = true;
  }

  // Confidence Notice
  DOM.resLowConfidence.hidden = data.confidence !== "low";

  // Breadcrumbs
  updateBreadcrumbs();
}

function renderStoryTabs(storyArray) {
  DOM.storyTabsNav.innerHTML = "";
  DOM.storyTabContent.innerHTML = "";
  STATE.activeStoryTab = 0;

  storyArray.forEach((item, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `story-tab-btn ${index === 0 ? "active" : ""}`;
    btn.textContent = item.tab || `Bhaag ${index + 1}`;
    btn.addEventListener("click", () => {
      STATE.activeStoryTab = index;
      DOM.storyTabsNav.querySelectorAll(".story-tab-btn").forEach((b, i) => {
        b.classList.toggle("active", i === index);
      });
      DOM.storyTabContent.textContent = item.text;
    });
    DOM.storyTabsNav.appendChild(btn);
  });

  DOM.storyTabContent.textContent = storyArray[0].text;
}

function renderWikiPortrait(wikiData) {
  DOM.cardWikiSkeleton.hidden = true;
  DOM.cardWiki.hidden = false;

  if (wikiData && wikiData.found && wikiData.imageUrl) {
    DOM.wikiThumbImg.src = wikiData.imageUrl;
    DOM.wikiThumbImg.hidden = false;
    DOM.wikiMandalaPlaceholder.hidden = true;
    DOM.wikiZoomBadge.hidden = false;

    if (wikiData.pageUrl) {
      DOM.wikiReadLink.href = wikiData.pageUrl;
      DOM.wikiReadLink.hidden = false;
    }
  } else {
    DOM.wikiThumbImg.hidden = true;
    DOM.wikiMandalaPlaceholder.hidden = false;
    DOM.wikiZoomBadge.hidden = true;
  }
}

// ---------------------------------------------------------------------------
// Screen 3: "Kaun kaun juda hai" Connection Graph
// ---------------------------------------------------------------------------
function renderConnectionGraph(data) {
  const centerName = data.title || STATE.currentQuery;
  DOM.graphCenterTitle.textContent = centerName;
  DOM.graphSubtitle.textContent = `${centerName} se jude log, ghatnayein aur pavitra granth`;

  // Parse connections into rich array
  let connectionsList = [];
  if (data.connections && Array.isArray(data.connections)) {
    connectionsList = data.connections.map((c, idx) => ({
      id: `node-${idx}`,
      name: c.name,
      devanagari: c.devanagari || "",
      type: c.type || "person",
      relation: c.relation || "Sambandh",
      icon: getNodeIconByType(c.type),
      desc: c.source ? `${c.name} ka sambandh ${c.relation} ke roop mein ${c.source} mein milta hai.` : `${c.name} se sacred sambandh.`,
      citation: c.source || "Shastra Pramaan"
    }));
  }

  // Merge with Curated Draupadi connections if matching
  if (/draupadi|panchali/i.test(centerName)) {
    connectionsList = Object.values(CURATED_DRAUPADI_DATA.connections);
  }

  // Update Filter Counts
  const counts = { all: connectionsList.length, person: 0, scripture: 0, event: 0 };
  connectionsList.forEach(c => {
    if (counts[c.type] !== undefined) counts[c.type]++;
  });
  document.getElementById("filter-count-all").textContent = counts.all;
  document.getElementById("filter-count-person").textContent = counts.person;
  document.getElementById("filter-count-scripture").textContent = counts.scripture;
  document.getElementById("filter-count-event").textContent = counts.event;

  // Render SVG Orbit Lines & Radial Nodes
  DOM.mapEdgesLayer.innerHTML = "";
  DOM.mapNodesLayer.innerHTML = "";

  const cx = 195;
  const cy = 195;
  const radius = 135;
  const total = Math.min(connectionsList.length, 8);

  connectionsList.slice(0, 8).forEach((node, index) => {
    const angle = (2 * Math.PI / total) * index - (Math.PI / 2);
    const nx = cx + radius * Math.cos(angle);
    const ny = cy + radius * Math.sin(angle);

    // Connector Line in SVG
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", cx);
    line.setAttribute("y1", cy);
    line.setAttribute("x2", nx);
    line.setAttribute("y2", ny);
    line.setAttribute("class", "map-edge");
    line.setAttribute("id", `map-edge-${index}`);
    DOM.mapEdgesLayer.appendChild(line);

    // Interactive Node Capsule (HTML element for crisp typography and accessibility)
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `graph-node-btn ${index === 0 ? "active-node" : ""}`;
    btn.dataset.type = node.type;
    btn.dataset.index = index;
    btn.style.left = `${nx}px`;
    btn.style.top = `${ny}px`;

    btn.innerHTML = `
      <div class="node-circle-capsule">
        <span class="node-title-text">${node.name}</span>
      </div>
      <span class="node-relation-label">${node.relation}</span>
    `;

    btn.addEventListener("click", () => {
      selectGraphNode(node, index);
    });

    DOM.mapNodesLayer.appendChild(btn);
  });

  // Select First Node by default
  if (connectionsList.length > 0) {
    selectGraphNode(connectionsList[0], 0);
  }
}

function selectGraphNode(node, index) {
  STATE.activeGraphNode = node;

  // Highlight active node in DOM
  DOM.mapNodesLayer.querySelectorAll(".graph-node-btn").forEach((btn, i) => {
    btn.classList.toggle("active-node", i === index);
  });

  // Highlight active SVG edge
  DOM.mapEdgesLayer.querySelectorAll(".map-edge").forEach((edge, i) => {
    edge.classList.toggle("highlighted", i === index);
  });

  // Update Bottom Sheet Card
  DOM.cardTitle.innerHTML = `${node.name} <span class="text-[15px] font-medium text-[#6B6258]">${node.devanagari || ""}</span>`;
  DOM.cardRelation.textContent = node.relation;
  DOM.cardIcon.textContent = node.icon || "spa";
  DOM.cardDescription.textContent = node.desc;
  DOM.cardCitation.textContent = node.citation;

  // Update Bookmark state for this relationship
  const isBookmarked = STATE.bookmarks.some(b => b.title === `${STATE.currentData?.title || 'Topic'} & ${node.name}`);
  DOM.cardBookmarkBtn.classList.toggle("saved", isBookmarked);
  DOM.cardBookmarkIcon.textContent = isBookmarked ? "bookmark" : "bookmark_border";
}

function getNodeIconByType(type) {
  switch (type) {
    case "person": return "person";
    case "scripture": return "menu_book";
    case "event": return "event";
    case "place": return "flag";
    case "tradition": return "spa";
    default: return "hub";
  }
}

// ---------------------------------------------------------------------------
// Screen 4: "Kab, kyun aur kaise" Timeline
// ---------------------------------------------------------------------------
function renderTimelineView(data) {
  const topic = data.title || STATE.currentQuery;
  let timelineItems = [];

  // If searching Draupadi, use the curated chronological timeline
  if (/draupadi|panchali/i.test(topic)) {
    timelineItems = CURATED_DRAUPADI_DATA.timeline;
  } else {
    // Dynamically derive timeline from story milestones and real-life tradition
    if (data.story && Array.isArray(data.story)) {
      data.story.forEach((item, idx) => {
        let phase = "is_kahani_mein";
        if (idx === 0) phase = "pehle";
        else if (idx === data.story.length - 1) phase = "baad_mein";

        timelineItems.push({
          phase,
          era: data.type === "person" ? "Katha prasang" : "Itihas",
          parva: item.tab || `Bhaag ${idx + 1}`,
          title: item.tab || `Prasang ${idx + 1}`,
          text: item.text,
          kyun_hua: idx % 2 === 1 ? `Shastra katha ke anusaar dharmik siksha aur maryada sthapna.` : null
        });
      });
    }
    if (data.real_life) {
      timelineItems.push({
        phase: "parampara",
        era: "Aaj ki parampara",
        parva: "Living Tradition",
        title: `${topic} ki Parampara aur Utsav`,
        text: data.real_life,
        cta: "Parampara ke baare mein vistar se jaanein"
      });
    }
  }

  DOM.timelineEventsContent.innerHTML = "";

  // Group items by phase
  const phases = [
    { key: "pehle", label: "Pehle", isSaffron: false },
    { key: "is_kahani_mein", label: "Is kahani mein", isSaffron: true },
    { key: "baad_mein", label: "Baad mein", isSaffron: false },
    { key: "parampara", label: "Living Heritage", isSaffron: true }
  ];

  phases.forEach(p => {
    const itemsInPhase = timelineItems.filter(it => it.phase === p.key);
    if (itemsInPhase.length === 0) return;

    const group = document.createElement("div");
    group.className = "timeline-phase-group";
    group.id = `timeline-sec-${p.key === "is_kahani_mein" ? "iskahani" : p.key}`;

    // Phase Header
    group.innerHTML = `
      <div class="timeline-phase-header">
        <div class="phase-dot ${p.isSaffron ? "saffron" : ""}"></div>
        <span class="phase-label-text ${p.isSaffron ? "saffron" : ""}">${p.label}</span>
      </div>
    `;

    // Phase Events
    itemsInPhase.forEach(item => {
      const row = document.createElement("div");
      row.className = "timeline-event-row";

      if (item.phase === "parampara") {
        // Living Heritage Final Card
        row.innerHTML = `
          <div class="timeline-node-marker saffron">
            <div class="node-circle-indicator">
              <div class="node-inner-dot"></div>
            </div>
          </div>
          <div class="living-tradition-card">
            <span class="text-[13px] font-medium text-[#6B6258]">${item.era}</span>
            <h3 class="event-title text-[18px]">${item.title}</h3>
            <p class="event-narrative">${item.text}</p>
            <button type="button" class="tradition-cta-btn" id="timeline-tradition-cta">
              <span>${item.cta || "Vistar se jaanein"}</span>
              <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        `;
        const ctaBtn = row.querySelector("#timeline-tradition-cta");
        if (ctaBtn) {
          ctaBtn.addEventListener("click", () => {
            fetchExplanation(item.title);
          });
        }
      } else {
        // Standard Event Card
        let kyunHuaMarkup = "";
        if (item.kyun_hua) {
          kyunHuaMarkup = `
            <div class="kyun-hua-box">
              <span class="kyun-hua-label">Kyun hua</span>
              <p class="kyun-hua-text">${item.kyun_hua}</p>
            </div>
          `;
        }

        row.innerHTML = `
          <div class="timeline-node-marker ${p.isSaffron ? "saffron" : ""}">
            <div class="node-circle-indicator">
              <div class="node-inner-dot"></div>
            </div>
          </div>
          <div class="timeline-event-card">
            <div class="event-meta-row">
              <span class="event-era-text">${item.era}</span>
              <span class="event-parva-badge">${item.parva}</span>
            </div>
            <h3 class="event-title">${item.title}</h3>
            <p class="event-narrative">${item.text}</p>
            ${kyunHuaMarkup}
          </div>
        `;
      }
      group.appendChild(row);
    });

    DOM.timelineEventsContent.appendChild(group);
  });
}

// ---------------------------------------------------------------------------
// Draupadi Full Showcase Fallback (Guarantees Instant Demo Offline)
// ---------------------------------------------------------------------------
function renderDraupadiShowcase() {
  const data = {
    title: CURATED_DRAUPADI_DATA.title,
    did_you_mean: ["Draupadi", "Panchali", "Yajnaseni"],
    speech_text: "Draupadi is the central heroine of the Mahabharata, born from sacred yajna fire and revered for her steadfast dedication to dharma.",
    type: "person",
    summary: CURATED_DRAUPADI_DATA.summary,
    story: CURATED_DRAUPADI_DATA.story,
    sources: CURATED_DRAUPADI_DATA.sources,
    real_life: CURATED_DRAUPADI_DATA.real_life,
    traditions_differ: CURATED_DRAUPADI_DATA.traditions_differ,
    connections: Object.values(CURATED_DRAUPADI_DATA.connections),
    follow_ups: ["Who is Arjuna?", "What happened in Sabha Parva?", "What is Draupadi Amman?"],
    confidence: "high"
  };

  STATE.currentData = data;
  switchMainView("result");
  switchResultTab("profile");
  renderProfileView(data);
  renderConnectionGraph(data);
  renderTimelineView(data);

  renderWikiPortrait({
    found: true,
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Raja_Ravi_Varma_-_Mahabharata_-_Draupadi.jpg/800px-Raja_Ravi_Varma_-_Mahabharata_-_Draupadi.jpg",
    pageUrl: "https://en.wikipedia.org/wiki/Draupadi"
  });
}

// ---------------------------------------------------------------------------
// Voice Assistant (Sunao Narration & Hands-Free Conversation)
// ---------------------------------------------------------------------------
const VoiceAssistant = {
  synth: window.speechSynthesis,
  recognition: null,

  init() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      this.recognition.onstart = () => {
        STATE.isListening = true;
        DOM.homeMicBtn?.classList.add("listening");
        DOM.stickyMicBtn?.classList.add("listening");
        DOM.voiceModalBackdrop.hidden = false;
        DOM.voiceModal.hidden = false;
        DOM.voiceTranscript.textContent = "";
      };

      this.recognition.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        DOM.voiceTranscript.textContent = transcript;
        if (event.results[0].isFinal) {
          setTimeout(() => {
            this.stopListening();
            fetchExplanation(transcript.trim());
          }, 350);
        }
      };

      this.recognition.onerror = (e) => {
        console.warn("Speech recognition error:", e.error);
        this.stopListening();
      };

      this.recognition.onend = () => {
        this.stopListening();
      };
    }
  },

  startListening() {
    if (!this.recognition) {
      showToast(I18N[STATE.lang].voiceNotSupported);
      return;
    }
    try {
      this.recognition.lang = STATE.lang === "hi" ? "hi-IN" : "en-IN";
      this.recognition.start();
    } catch (err) {
      console.warn("Start listening error:", err);
    }
  },

  stopListening() {
    STATE.isListening = false;
    DOM.homeMicBtn?.classList.remove("listening");
    DOM.stickyMicBtn?.classList.remove("listening");
    DOM.voiceModalBackdrop.hidden = true;
    DOM.voiceModal.hidden = true;
    try {
      this.recognition?.stop();
    } catch (_) {}
  },

  speak(text) {
    if (!this.synth) return;
    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = STATE.lang === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 0.95;

    utterance.onstart = () => {
      STATE.isSpeaking = true;
      this.updateUI(true);
    };

    utterance.onend = () => {
      STATE.isSpeaking = false;
      this.updateUI(false);
      if (STATE.handsFreeMode) {
        setTimeout(() => this.startListening(), 600);
      }
    };

    utterance.onerror = () => {
      STATE.isSpeaking = false;
      this.updateUI(false);
    };

    this.synth.speak(utterance);
  },

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      STATE.isSpeaking = false;
      this.updateUI(false);
    }
  },

  toggleSpeech() {
    if (STATE.isSpeaking) {
      this.stopSpeaking();
    } else {
      const text = STATE.currentData?.speech_text || STATE.currentData?.summary || "";
      if (text) this.speak(text);
    }
  },

  updateUI(isSpeaking) {
    DOM.iconSunaoPlay.hidden = isSpeaking;
    DOM.iconSunaoStop.hidden = !isSpeaking;
    DOM.audioWaveformBars.hidden = !isSpeaking;
    DOM.uiSunaoBtnText.textContent = isSpeaking ? I18N[STATE.lang].rokoBtn : I18N[STATE.lang].sunaoBtn;
    DOM.sunaoQuickIcon.textContent = isSpeaking ? "volume_off" : "volume_up";
  }
};

// ---------------------------------------------------------------------------
// Helpers & Utilities
// ---------------------------------------------------------------------------
function addRecentSearch(topic) {
  if (!topic) return;
  STATE.recentSearches = [topic, ...STATE.recentSearches.filter(s => s.toLowerCase() !== topic.toLowerCase())].slice(0, 8);
  localStorage.setItem("dharmasetu_recent", JSON.stringify(STATE.recentSearches));
  renderRecentSearches();
}

function renderRecentSearches() {
  if (STATE.recentSearches.length === 0) {
    DOM.recentSearchesBox.hidden = true;
    return;
  }
  DOM.recentChips.innerHTML = "";
  STATE.recentSearches.forEach(term => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip-btn";
    chip.textContent = term;
    chip.addEventListener("click", () => fetchExplanation(term));
    DOM.recentChips.appendChild(chip);
  });
  DOM.recentSearchesBox.hidden = false;
}

function updateBreadcrumbs() {
  if (STATE.topicHistory.length > 0) {
    const prev = STATE.topicHistory[STATE.topicHistory.length - 1];
    DOM.breadcrumbPrevTopic.textContent = prev.title;
    DOM.breadcrumbBar.hidden = false;
  } else {
    DOM.breadcrumbBar.hidden = true;
  }
}

function startLoadingPhrases() {
  const phrases = I18N[STATE.lang].loadingPhrases;
  let idx = 0;
  DOM.loadingPhrase.textContent = phrases[0];
  STATE.loadingTimer = setInterval(() => {
    idx = (idx + 1) % phrases.length;
    DOM.loadingPhrase.textContent = phrases[idx];
  }, 2400);
}

function showError(msg) {
  switchMainView("error");
  DOM.errorMessage.textContent = msg || I18N[STATE.lang].errorMsg;
}

// ---------------------------------------------------------------------------
// Event Listeners & Bootstrapping
// ---------------------------------------------------------------------------
function initApp() {
  applyTheme(STATE.theme);
  applyLanguage(STATE.lang);
  updateBookmarkBadge();
  renderRecentSearches();
  VoiceAssistant.init();

  // Theme Toggle
  DOM.themeToggleBtn.addEventListener("click", () => {
    applyTheme(STATE.theme === "light" ? "dark" : "light");
  });

  // Language Switch
  DOM.langBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      applyLanguage(btn.dataset.lang);
    });
  });

  // Bookmarks Drawer
  DOM.headerBookmarksBtn.addEventListener("click", openBookmarksDrawer);
  DOM.bookmarksCloseBtn.addEventListener("click", closeBookmarksDrawer);
  DOM.bookmarksBackdrop.addEventListener("click", closeBookmarksDrawer);

  // Home Brand Back to Home
  DOM.brandHomeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    switchMainView("home");
  });

  // Home Search Submit
  DOM.homeSearchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = DOM.homeSearchInput.value.trim();
    if (q) fetchExplanation(q);
  });

  DOM.homeClearBtn.addEventListener("click", () => {
    DOM.homeSearchInput.value = "";
    DOM.homeClearBtn.hidden = true;
    DOM.homeSearchInput.focus();
  });

  DOM.homeSearchInput.addEventListener("input", () => {
    DOM.homeClearBtn.hidden = !DOM.homeSearchInput.value.trim();
  });

  // Example Chips
  DOM.exampleChips.querySelectorAll(".chip-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      fetchExplanation(btn.dataset.query);
    });
  });

  // Clear Recent
  DOM.clearRecentBtn.addEventListener("click", () => {
    STATE.recentSearches = [];
    localStorage.removeItem("dharmasetu_recent");
    renderRecentSearches();
  });

  // Result Back Button
  DOM.resultBackBtn.addEventListener("click", () => {
    if (STATE.topicHistory.length > 0) {
      const prev = STATE.topicHistory.pop();
      fetchExplanation(prev.q);
    } else {
      switchMainView("home");
    }
  });

  DOM.breadcrumbBackBtn.addEventListener("click", () => {
    if (STATE.topicHistory.length > 0) {
      const prev = STATE.topicHistory.pop();
      fetchExplanation(prev.q);
    }
  });

  DOM.resultSearchClearBtn.addEventListener("click", () => {
    switchMainView("home");
    DOM.homeSearchInput.focus();
  });

  // View Switcher Tabs (Parichay, Sambandh, Timeline)
  DOM.viewTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.target.replace("view-tab-", "");
      switchResultTab(target);
    });
  });

  // Quick In-Page Jumps
  DOM.jumpToGraphBtn.addEventListener("click", () => switchResultTab("graph"));
  DOM.jumpToTimelineBtn.addEventListener("click", () => switchResultTab("timeline"));

  // Sunao Narration Buttons
  DOM.sunaoBtn.addEventListener("click", () => VoiceAssistant.toggleSpeech());
  DOM.sunaoQuickBtn.addEventListener("click", () => VoiceAssistant.toggleSpeech());

  // Hands-Free Toggle
  DOM.handsfreeToggleBtn.addEventListener("click", () => {
    STATE.handsFreeMode = !STATE.handsFreeMode;
    DOM.handsfreeToggleBtn.setAttribute("aria-pressed", STATE.handsFreeMode ? "true" : "false");
    showToast(STATE.handsFreeMode ? I18N[STATE.lang].handsfreeOnToast : I18N[STATE.lang].handsfreeOffToast);
    if (STATE.handsFreeMode && !STATE.isSpeaking) {
      VoiceAssistant.startListening();
    }
  });

  // Voice Mic Buttons
  DOM.homeMicBtn.addEventListener("click", () => VoiceAssistant.startListening());
  DOM.stickyMicBtn.addEventListener("click", () => VoiceAssistant.startListening());
  DOM.voiceCancelBtn.addEventListener("click", () => VoiceAssistant.stopListening());

  // Lightbox Modal
  DOM.wikiImageBox.addEventListener("click", () => {
    if (DOM.wikiThumbImg && !DOM.wikiThumbImg.hidden && DOM.wikiThumbImg.src) {
      DOM.lightboxImg.src = DOM.wikiThumbImg.src;
      DOM.lightboxCaption.textContent = STATE.currentData?.title || "Classical Painting";
      DOM.lightboxBackdrop.hidden = false;
      DOM.lightboxModal.hidden = false;
    }
  });
  DOM.lightboxCloseBtn.addEventListener("click", () => {
    DOM.lightboxBackdrop.hidden = true;
    DOM.lightboxModal.hidden = true;
  });
  DOM.lightboxBackdrop.addEventListener("click", () => {
    DOM.lightboxBackdrop.hidden = true;
    DOM.lightboxModal.hidden = true;
  });

  // Graph Filter Chips (Sab, Log, Granth, Ghatna)
  DOM.graphFilterBar.querySelectorAll(".filter-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      DOM.graphFilterBar.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      STATE.activeGraphFilter = filter;

      DOM.mapNodesLayer.querySelectorAll(".graph-node-btn").forEach(nodeEl => {
        const type = nodeEl.dataset.type;
        const visible = filter === "all" || type === filter;
        nodeEl.style.opacity = visible ? "1" : "0.2";
        nodeEl.style.pointerEvents = visible ? "auto" : "none";
      });
    });
  });

  // Graph Zoom Controls
  DOM.graphZoomInBtn.addEventListener("click", () => {
    STATE.graphZoom = Math.min(STATE.graphZoom + 0.15, 1.45);
    DOM.connectionSvg.style.transform = `scale(${STATE.graphZoom})`;
    DOM.mapNodesLayer.style.transform = `scale(${STATE.graphZoom})`;
  });
  DOM.graphZoomOutBtn.addEventListener("click", () => {
    STATE.graphZoom = Math.max(STATE.graphZoom - 0.15, 0.85);
    DOM.connectionSvg.style.transform = `scale(${STATE.graphZoom})`;
    DOM.mapNodesLayer.style.transform = `scale(${STATE.graphZoom})`;
  });

  // Connection Bottom Card CTA: Explore connection
  DOM.cardExploreBtn.addEventListener("click", () => {
    if (STATE.activeGraphNode) {
      fetchExplanation(STATE.activeGraphNode.name, STATE.currentData?.title);
    }
  });

  // Bookmark Connection Button
  DOM.cardBookmarkBtn.addEventListener("click", () => {
    if (!STATE.activeGraphNode) return;
    const itemTitle = `${STATE.currentData?.title || 'Topic'} & ${STATE.activeGraphNode.name}`;
    const idx = STATE.bookmarks.findIndex(b => b.title === itemTitle);

    if (idx >= 0) {
      STATE.bookmarks.splice(idx, 1);
      showToast(I18N[STATE.lang].toastBookmarkRemoved);
    } else {
      STATE.bookmarks.push({
        title: itemTitle,
        subtitle: STATE.activeGraphNode.relation,
        query: STATE.activeGraphNode.name
      });
      showToast(I18N[STATE.lang].toastBookmarkAdded);
    }
    localStorage.setItem("dharmasetu_bookmarks", JSON.stringify(STATE.bookmarks));
    updateBookmarkBadge();
    const isBookmarked = idx < 0;
    DOM.cardBookmarkBtn.classList.toggle("saved", isBookmarked);
    DOM.cardBookmarkIcon.textContent = isBookmarked ? "bookmark" : "bookmark_border";
  });

  // Sticky Bottom Search Form
  DOM.stickySearchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = DOM.stickySearchInput.value.trim();
    if (q) fetchExplanation(q);
  });

  // Share & Copy
  DOM.shareBtn.addEventListener("click", async () => {
    const t = I18N[STATE.lang];
    const shareData = {
      title: DOM.resTitleMain.textContent || "Dharma Setu",
      text: DOM.resSummary.textContent || "Sanatana Gyan, Shastra Pramaan",
      url: window.location.href
    };
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== "AbortError") copyToClipboard(window.location.href, t.toastCopied);
      }
    } else {
      copyToClipboard(window.location.href, t.toastCopied);
    }
  });

  DOM.copySummaryBtn.addEventListener("click", () => {
    const text = `${DOM.resTitleMain.textContent}\n\n${DOM.resSummary.textContent}\n\nVia Dharma Setu`;
    copyToClipboard(text, I18N[STATE.lang].toastSummaryCopied);
  });

  // Retry on error
  DOM.retryBtn.addEventListener("click", () => {
    if (STATE.currentQuery) fetchExplanation(STATE.currentQuery);
  });
}

function copyToClipboard(text, successToast) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(successToast);
  }).catch(() => {
    showToast(successToast);
  });
}

// Kick off when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
