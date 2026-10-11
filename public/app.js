/**
 * Dharma Setu (धर्म सेतु) — Mobile-First Client Application
 * Plain Vanilla JS, zero build step, zero external libraries.
 */

// ---------------------------------------------------------------------------
// Internationalization & UI Dictionary
// ---------------------------------------------------------------------------
const I18N = {
  hinglish: {
    tagline: "धर्म सेतु",
    homeHeading: "Sanatana Gyan, Shastra Pramaan",
    homeDesc: "Granthon ke aadhar par pramanik uttar, kathaayein aur sambandh.",
    searchPlaceholder: "Poochhein: Ram, Krishna, Ekadashi...",
    searchBtn: "Khojein",
    examplesLabel: "Udaharan:",
    recentTitle: "Haal hi mein dekha gaya",
    clearRecent: "Saaf karein",
    storyTitle: "Katha vistar",
    mapTitle: "Sambandh Naksha",
    mapSubtitle: "Kisi bhi vishay par tap karke sambandh jaanein",
    sourcesTitle: "Granthon mein (Pramaan)",
    realLifeTitle: "Real life mein (Parampara aur Manyata)",
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
    sheetRel: "Sambandh:",
    sheetSource: "Shastra Pramaan:",
    sheetExplore: "Iske bare mein jaanein",
    toastCopied: "Link clipboard par copy ho gaya!",
    toastSummaryCopied: "Jawab copy ho gaya!",
    loadingPhrases: [
      "Shastron se pramanik khoj jaari hai...",
      "Granthon ke sandarbh jode ja rahe hain...",
      "Puranon aur Itihas se katha vistar ban raha hai..."
    ]
  },
  hi: {
    tagline: "सनातन ज्ञान सेतु",
    homeHeading: "सनातन ज्ञान, शास्त्र प्रमाण",
    homeDesc: "ग्रंथों के आधार पर प्रामाणिक उत्तर, कथाएं और संबंध।",
    searchPlaceholder: "पूछें: राम, कृष्ण, एकादशी...",
    searchBtn: "खोजें",
    examplesLabel: "उदाहरण:",
    recentTitle: "हाल ही में देखा गया",
    clearRecent: "साफ करें",
    storyTitle: "कथा विस्तार",
    mapTitle: "संबंध नक्शा",
    mapSubtitle: "किसी भी विषय पर टैप करके संबंध जानें",
    sourcesTitle: "ग्रंथों में (प्रमाण)",
    realLifeTitle: "दैनिक जीवन में (परंपरा व मान्यता)",
    traditionsTitle: "परंपराओं में भेद",
    followupsTitle: "आगे के प्रश्न",
    shareBtn: "साझा करें",
    copyBtn: "कॉपी करें",
    lowConfNotice: "इस उत्तर को शास्त्रों से स्वयं सत्यापित करें।",
    footerDisclaimer: "उत्तर AI द्वारा जनरेटेड हैं, ग्रंथों से पुष्टि करें।",
    feedbackLink: "त्रुटि बताएं",
    backText: "पिछला विषय:",
    interpretedLabel: "मैंने समझा:",
    didYouMeanLabel: "क्या आपका तात्पर्य था:",
    retryBtn: "पुनः प्रयास करें",
    errorTitle: "कृपया क्षमा करें",
    errorMsg: "उत्तर प्राप्त करने में समय लग रहा है। कृपया पुनः प्रयास करें।",
    sheetRel: "संबंध:",
    sheetSource: "शास्त्र प्रमाण:",
    sheetExplore: "इसके बारे में जानें",
    toastCopied: "लिंक कॉपी हो गया!",
    toastSummaryCopied: "उत्तर कॉपी हो गया!",
    loadingPhrases: [
      "शास्त्रों से प्रामाणिक खोज जारी है...",
      "ग्रंथों के संदर्भ जोड़े जा रहे हैं...",
      "पुराणों और इतिहास से कथा विस्तार बन रहा है..."
    ]
  },
  en: {
    tagline: "Bridge to Dharma",
    homeHeading: "Timeless Wisdom, Scriptural Evidence",
    homeDesc: "Authentic answers, narratives, and connection maps grounded in Hindu scriptures.",
    searchPlaceholder: "Ask: Ram, Krishna, Ekadashi...",
    searchBtn: "Search",
    examplesLabel: "Examples:",
    recentTitle: "Recent Searches",
    clearRecent: "Clear",
    storyTitle: "Detailed Narrative",
    mapTitle: "Connection Map",
    mapSubtitle: "Tap any connected node to explore relationships",
    sourcesTitle: "Scriptural Sources",
    realLifeTitle: "In Daily Life (Tradition & Practice)",
    traditionsTitle: "Where Traditions Differ",
    followupsTitle: "Follow-up Questions",
    shareBtn: "Share",
    copyBtn: "Copy",
    lowConfNotice: "Please independently verify this answer with authentic scriptures.",
    footerDisclaimer: "Answers are AI-generated, verify with authentic scriptures.",
    feedbackLink: "Report an issue",
    backText: "Back to:",
    interpretedLabel: "Interpreted as:",
    didYouMeanLabel: "Did you mean:",
    retryBtn: "Retry",
    errorTitle: "We apologize",
    errorMsg: "The server is currently busy or taking longer than expected. Please try again.",
    sheetRel: "Relationship:",
    sheetSource: "Scriptural Citation:",
    sheetExplore: "Explore this topic",
    toastCopied: "Link copied to clipboard!",
    toastSummaryCopied: "Summary copied to clipboard!",
    loadingPhrases: [
      "Searching authentic scriptures...",
      "Tracing connections and references...",
      "Synthesizing classical commentary..."
    ]
  }
};

// ---------------------------------------------------------------------------
// Application State
// ---------------------------------------------------------------------------
const STATE = {
  lang: localStorage.getItem("dharmasetu_lang") || "hinglish",
  theme: localStorage.getItem("dharmasetu_theme") || "dark",
  currentQuery: "",
  currentData: null,
  topicHistory: [], // Breadcrumb stack: [{ q, title }]
  recentSearches: JSON.parse(localStorage.getItem("dharmasetu_recent") || "[]"),
  loadingTimer: null,
  activeStoryTab: 0,
  activeSheetNode: null
};

// ---------------------------------------------------------------------------
// DOM Elements
// ---------------------------------------------------------------------------
const DOM = {
  html: document.documentElement,
  brandHomeBtn: document.getElementById("brand-home-btn"),
  themeToggleBtn: document.getElementById("theme-toggle-btn"),
  langBtns: document.querySelectorAll(".lang-btn"),
  
  // Views
  homeView: document.getElementById("home-view"),
  loadingView: document.getElementById("loading-view"),
  errorView: document.getElementById("error-view"),
  resultView: document.getElementById("result-view"),
  
  // Home elements
  homeSearchForm: document.getElementById("home-search-form"),
  homeSearchInput: document.getElementById("home-search-input"),
  homeClearBtn: document.getElementById("home-clear-btn"),
  exampleChips: document.getElementById("example-chips"),
  recentSearchesBox: document.getElementById("recent-searches-box"),
  recentChips: document.getElementById("recent-chips"),
  clearRecentBtn: document.getElementById("clear-recent-btn"),
  
  // Loading & Error elements
  loadingPhrase: document.getElementById("loading-phrase"),
  retryBtn: document.getElementById("retry-btn"),
  errorMessage: document.getElementById("error-message"),
  errorTitle: document.getElementById("error-title"),
  
  // Result elements
  breadcrumbBar: document.getElementById("breadcrumb-bar"),
  breadcrumbBackBtn: document.getElementById("breadcrumb-back-btn"),
  breadcrumbBackText: document.getElementById("breadcrumb-back-text"),
  breadcrumbPrevTopic: document.getElementById("breadcrumb-prev-topic"),
  
  resInterpretedBox: document.getElementById("res-interpreted-box"),
  resInterpretedAs: document.getElementById("res-interpreted-as"),
  resDidYouMeanBox: document.getElementById("res-did-you-mean-box"),
  resDidYouMeanChips: document.getElementById("res-did-you-mean-chips"),

  resTitle: document.getElementById("res-title"),
  resTypeBadge: document.getElementById("res-type-badge"),
  resSummary: document.getElementById("res-summary"),
  resLowConfidence: document.getElementById("res-low-confidence"),
  
  cardStory: document.getElementById("card-story"),
  storyTabsNav: document.getElementById("story-tabs-nav"),
  storyTabContent: document.getElementById("story-tab-content"),
  
  cardConnections: document.getElementById("card-connections"),
  connectionSvg: document.getElementById("connection-svg"),
  mapEdgesLayer: document.getElementById("map-edges-layer"),
  mapNodesLayer: document.getElementById("map-nodes-layer"),
  
  resSourcesList: document.getElementById("res-sources-list"),
  resRealLife: document.getElementById("res-real-life"),
  cardTraditions: document.getElementById("card-traditions"),
  resTraditions: document.getElementById("res-traditions"),
  cardFollowups: document.getElementById("card-followups"),
  resFollowupsList: document.getElementById("res-followups-list"),
  
  shareBtn: document.getElementById("share-btn"),
  copySummaryBtn: document.getElementById("copy-summary-btn"),
  
  // Sticky bottom search
  stickyBottomBar: document.getElementById("sticky-bottom-bar"),
  stickySearchForm: document.getElementById("sticky-search-form"),
  stickySearchInput: document.getElementById("sticky-search-input"),
  
  // Bottom Sheet
  bottomSheetBackdrop: document.getElementById("bottom-sheet-backdrop"),
  nodeBottomSheet: document.getElementById("node-bottom-sheet"),
  sheetNodeName: document.getElementById("sheet-node-name"),
  sheetNodeType: document.getElementById("sheet-node-type"),
  sheetNodeRelation: document.getElementById("sheet-node-relation"),
  sheetNodeSource: document.getElementById("sheet-node-source"),
  sheetExploreBtn: document.getElementById("sheet-explore-btn"),
  sheetCloseBtn: document.getElementById("sheet-close-btn"),
  
  // Toast
  toastPopup: document.getElementById("toast-popup"),
  
  // Dynamic UI labels
  uiTagline: document.getElementById("ui-tagline"),
  uiHomeHeading: document.getElementById("ui-home-heading"),
  uiHomeDesc: document.getElementById("ui-home-desc"),
  uiSearchBtnText: document.getElementById("ui-search-btn-text"),
  uiExamplesLabel: document.getElementById("ui-examples-label"),
  uiRecentTitle: document.getElementById("ui-recent-title"),
  uiStoryTitle: document.getElementById("ui-story-title"),
  uiMapTitle: document.getElementById("ui-map-title"),
  uiMapSubtitle: document.getElementById("ui-map-subtitle"),
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
  uiSheetRelLabel: document.getElementById("ui-sheet-rel-label"),
  uiSheetSourceLabel: document.getElementById("ui-sheet-source-label"),
  uiSheetExploreText: document.getElementById("ui-sheet-explore-text"),
  uiInterpretedLabel: document.getElementById("ui-interpreted-label"),
  uiDidYouMeanLabel: document.getElementById("ui-did-you-mean-label")
};

// ---------------------------------------------------------------------------
// Theme & Language Initialization
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

  // Update language switcher buttons
  DOM.langBtns.forEach(btn => {
    const isCurrent = btn.dataset.lang === lang;
    btn.classList.toggle("active", isCurrent);
    btn.setAttribute("aria-pressed", isCurrent ? "true" : "false");
  });

  // Update text across all UI elements
  const t = I18N[lang];
  DOM.uiTagline.textContent = t.tagline;
  DOM.uiHomeHeading.textContent = t.homeHeading;
  DOM.uiHomeDesc.textContent = t.homeDesc;
  DOM.homeSearchInput.placeholder = t.searchPlaceholder;
  DOM.stickySearchInput.placeholder = t.searchPlaceholder;
  DOM.uiSearchBtnText.textContent = t.searchBtn;
  DOM.uiExamplesLabel.textContent = t.examplesLabel;
  DOM.uiRecentTitle.textContent = t.recentTitle;
  DOM.clearRecentBtn.textContent = t.clearRecent;
  DOM.uiStoryTitle.textContent = t.storyTitle;
  DOM.uiMapTitle.textContent = t.mapTitle;
  DOM.uiMapSubtitle.textContent = t.mapSubtitle;
  DOM.uiSourcesTitle.textContent = t.sourcesTitle;
  DOM.uiReallifeTitle.textContent = t.realLifeTitle;
  DOM.uiTraditionsTitle.textContent = t.traditionsTitle;
  DOM.uiFollowupsTitle.textContent = t.followupsTitle;
  DOM.uiShareBtnText.textContent = t.shareBtn;
  DOM.uiCopyBtnText.textContent = t.copyBtn;
  DOM.uiLowConfText.textContent = t.lowConfNotice;
  DOM.uiFooterDisclaimer.textContent = t.footerDisclaimer;
  DOM.uiFeedbackLink.textContent = t.feedbackLink;
  DOM.uiRetryBtnText.textContent = t.retryBtn;
  DOM.uiSheetRelLabel.textContent = t.sheetRel;
  DOM.uiSheetSourceLabel.textContent = t.sheetSource;
  DOM.uiSheetExploreText.textContent = t.sheetExplore;
  if (DOM.uiInterpretedLabel) DOM.uiInterpretedLabel.textContent = t.interpretedLabel;
  if (DOM.uiDidYouMeanLabel) DOM.uiDidYouMeanLabel.textContent = t.didYouMeanLabel;
  DOM.breadcrumbBackText.textContent = t.backText;
  DOM.errorTitle.textContent = t.errorTitle;
  DOM.errorMessage.textContent = t.errorMsg;

  // If already displaying results, refresh query with new language
  if (STATE.currentQuery && !DOM.resultView.hidden) {
    fetchExplanation(STATE.currentQuery, null, true);
  }
}

// ---------------------------------------------------------------------------
// Toast Notification
// ---------------------------------------------------------------------------
let toastTimeout = null;
function showToast(message) {
  if (toastTimeout) clearTimeout(toastTimeout);
  DOM.toastPopup.textContent = message;
  DOM.toastPopup.hidden = false;
  toastTimeout = setTimeout(() => {
    DOM.toastPopup.hidden = true;
  }, 2800);
}

// ---------------------------------------------------------------------------
// Recent Searches Management
// ---------------------------------------------------------------------------
function saveRecentSearch(q) {
  if (!q || typeof q !== "string") return;
  const trimmed = q.trim();
  if (!trimmed) return;

  // Filter out duplicates and limit to 8
  STATE.recentSearches = [trimmed, ...STATE.recentSearches.filter(item => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
  localStorage.setItem("dharmasetu_recent", JSON.stringify(STATE.recentSearches));
  renderRecentSearches();
}

function renderRecentSearches() {
  if (!STATE.recentSearches || STATE.recentSearches.length === 0) {
    DOM.recentSearchesBox.hidden = true;
    return;
  }

  DOM.recentChips.innerHTML = "";
  STATE.recentSearches.forEach(q => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip-btn";
    btn.textContent = q;
    btn.addEventListener("click", () => {
      fetchExplanation(q);
    });
    DOM.recentChips.appendChild(btn);
  });
  DOM.recentSearchesBox.hidden = false;
}

// ---------------------------------------------------------------------------
// View Navigation
// ---------------------------------------------------------------------------
function showView(viewName) {
  DOM.homeView.hidden = viewName !== "home";
  DOM.loadingView.hidden = viewName !== "loading";
  DOM.errorView.hidden = viewName !== "error";
  DOM.resultView.hidden = viewName !== "result";
  DOM.stickyBottomBar.hidden = viewName !== "result";

  document.body.setAttribute("data-view", viewName);

  if (viewName !== "result") {
    document.body.removeAttribute("data-topic-type");
  } else if (STATE.currentData && STATE.currentData.type) {
    document.body.setAttribute("data-topic-type", STATE.currentData.type);
  }

  if (viewName === "home") {
    DOM.homeSearchInput.value = "";
    DOM.homeClearBtn.hidden = true;
    STATE.currentQuery = "";
    STATE.topicHistory = [];
    DOM.breadcrumbBar.hidden = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

// ---------------------------------------------------------------------------
// API Interaction
// ---------------------------------------------------------------------------
async function fetchExplanation(query, context = null, isLangSwitch = false) {
  const trimmed = query?.trim();
  if (!trimmed) return;

  // Close any open bottom sheet
  closeBottomSheet();

  // If this is a new exploration, manage topic history for breadcrumb
  if (STATE.currentQuery && STATE.currentQuery.toLowerCase() !== trimmed.toLowerCase() && !isLangSwitch) {
    STATE.topicHistory.push({
      q: STATE.currentQuery,
      title: STATE.currentData?.title || STATE.currentQuery
    });
  }

  STATE.currentQuery = trimmed;
  saveRecentSearch(trimmed);

  // Update browser URL query params
  const newUrl = new URL(window.location.href);
  newUrl.searchParams.set("q", trimmed);
  newUrl.searchParams.set("lang", STATE.lang);
  window.history.pushState({ q: trimmed, lang: STATE.lang }, "", newUrl.toString());

  // Show loading view with cycling phrases
  showView("loading");
  startLoadingPhrases();

  try {
    const payload = {
      q: trimmed,
      lang: STATE.lang
    };
    if (context) {
      payload.context = context;
    }

    const response = await fetch("/api/explain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    stopLoadingPhrases();

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    STATE.currentData = data;
    renderResult(data);
    showView("result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error("Error fetching explanation:", err);
    stopLoadingPhrases();
    showView("error");
  }
}

function startLoadingPhrases() {
  const t = I18N[STATE.lang] || I18N.hinglish;
  let idx = 0;
  DOM.loadingPhrase.textContent = t.loadingPhrases[0];

  if (STATE.loadingTimer) clearInterval(STATE.loadingTimer);
  STATE.loadingTimer = setInterval(() => {
    idx = (idx + 1) % t.loadingPhrases.length;
    DOM.loadingPhrase.style.opacity = 0;
    setTimeout(() => {
      DOM.loadingPhrase.textContent = t.loadingPhrases[idx];
      DOM.loadingPhrase.style.opacity = 1;
    }, 200);
  }, 2200);
}

function stopLoadingPhrases() {
  if (STATE.loadingTimer) {
    clearInterval(STATE.loadingTimer);
    STATE.loadingTimer = null;
  }
}

// ---------------------------------------------------------------------------
// Render Results
// ---------------------------------------------------------------------------
function renderResult(data) {
  // Breadcrumb navigation update
  if (STATE.topicHistory.length > 0) {
    const prev = STATE.topicHistory[STATE.topicHistory.length - 1];
    DOM.breadcrumbPrevTopic.textContent = prev.title || prev.q;
    DOM.breadcrumbBar.hidden = false;
  } else {
    DOM.breadcrumbBar.hidden = true;
  }

  // Interpreted As & Did You Mean
  if (data.interpreted_as) {
    DOM.resInterpretedAs.textContent = data.interpreted_as;
    DOM.resInterpretedBox.hidden = false;
  } else {
    DOM.resInterpretedBox.hidden = true;
  }

  if (data.did_you_mean && Array.isArray(data.did_you_mean) && data.did_you_mean.length > 0) {
    DOM.resDidYouMeanChips.innerHTML = "";
    data.did_you_mean.forEach(item => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "did-you-mean-chip";
      chip.textContent = item;
      chip.addEventListener("click", () => fetchExplanation(item));
      DOM.resDidYouMeanChips.appendChild(chip);
    });
    DOM.resDidYouMeanBox.hidden = false;
  } else {
    DOM.resDidYouMeanBox.hidden = true;
  }

  // 1. Hero Card
  DOM.resTitle.textContent = data.title || STATE.currentQuery;
  DOM.resTypeBadge.textContent = data.type || "concept";
  DOM.resTypeBadge.setAttribute("data-type", data.type || "concept");
  document.body.setAttribute("data-topic-type", data.type || "concept");
  DOM.resSummary.textContent = data.summary || "";

  // Confidence check
  DOM.resLowConfidence.hidden = data.confidence !== "low";

  // 2. Story Tabs (Optional)
  if (data.story && Array.isArray(data.story) && data.story.length > 0) {
    renderStoryTabs(data.story);
    DOM.cardStory.hidden = false;
  } else {
    DOM.cardStory.hidden = true;
  }

  // 3. Interactive Connection Map
  if (data.connections && Array.isArray(data.connections) && data.connections.length > 0) {
    renderConnectionMap(data.title || STATE.currentQuery, data.type || "concept", data.connections);
    DOM.cardConnections.hidden = false;
  } else {
    DOM.cardConnections.hidden = true;
  }

  // 4. Scripture Sources
  DOM.resSourcesList.innerHTML = "";
  if (data.sources && Array.isArray(data.sources) && data.sources.length > 0) {
    data.sources.forEach(src => {
      const li = document.createElement("li");
      li.textContent = src;
      DOM.resSourcesList.appendChild(li);
    });
    document.getElementById("card-sources").hidden = false;
  } else {
    document.getElementById("card-sources").hidden = true;
  }

  // 5. Real Life
  if (data.real_life && data.real_life.trim()) {
    DOM.resRealLife.textContent = data.real_life;
    document.getElementById("card-real-life").hidden = false;
  } else {
    document.getElementById("card-real-life").hidden = true;
  }

  // 6. Traditions Differ
  if (data.traditions_differ && data.traditions_differ.trim()) {
    DOM.resTraditions.textContent = data.traditions_differ;
    DOM.cardTraditions.hidden = false;
  } else {
    DOM.cardTraditions.hidden = true;
  }

  // 7. Follow-up Questions
  DOM.resFollowupsList.innerHTML = "";
  if (data.follow_ups && Array.isArray(data.follow_ups) && data.follow_ups.length > 0) {
    data.follow_ups.forEach(q => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "followup-chip-btn";
      btn.textContent = q;
      btn.addEventListener("click", () => {
        fetchExplanation(q, data.title || STATE.currentQuery);
      });
      DOM.resFollowupsList.appendChild(btn);
    });
    DOM.cardFollowups.hidden = false;
  } else {
    DOM.cardFollowups.hidden = true;
  }

  // Pre-fill sticky search input with current topic
  DOM.stickySearchInput.value = "";
}

// ---------------------------------------------------------------------------
// Story Tabs Component
// ---------------------------------------------------------------------------
function renderStoryTabs(storyArray) {
  DOM.storyTabsNav.innerHTML = "";
  DOM.storyTabContent.innerHTML = "";
  STATE.activeStoryTab = 0;

  storyArray.forEach((item, index) => {
    const tabBtn = document.createElement("button");
    tabBtn.type = "button";
    tabBtn.className = `story-tab-btn ${index === 0 ? "active" : ""}`;
    tabBtn.textContent = item.tab || `Bhaag ${index + 1}`;
    tabBtn.setAttribute("role", "tab");
    tabBtn.setAttribute("aria-selected", index === 0 ? "true" : "false");

    tabBtn.addEventListener("click", () => {
      selectStoryTab(index, storyArray);
    });

    DOM.storyTabsNav.appendChild(tabBtn);
  });

  DOM.storyTabContent.textContent = storyArray[0].text;
}

function selectStoryTab(index, storyArray) {
  STATE.activeStoryTab = index;
  const tabButtons = DOM.storyTabsNav.querySelectorAll(".story-tab-btn");
  tabButtons.forEach((btn, i) => {
    btn.classList.toggle("active", i === index);
    btn.setAttribute("aria-selected", i === index ? "true" : "false");
  });
  DOM.storyTabContent.textContent = storyArray[index].text;
}

// ---------------------------------------------------------------------------
// Pure SVG Interactive Connection Map
// ---------------------------------------------------------------------------
function renderConnectionMap(centerName, centerType, connections) {
  DOM.mapEdgesLayer.innerHTML = "";
  DOM.mapNodesLayer.innerHTML = "";

  const cx = 250;
  const cy = 250;
  const radius = 160;
  const items = connections.slice(0, 8); // Max 8 nodes
  const total = items.length;

  // Center Node Render
  const centerGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  centerGroup.setAttribute("class", "map-node-group center-node");

  const centerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  centerCircle.setAttribute("cx", cx);
  centerCircle.setAttribute("cy", cy);
  centerCircle.setAttribute("r", 36);
  centerCircle.setAttribute("fill", "#1F2447");
  centerCircle.setAttribute("class", "map-node-circle center-node-circle");
  centerGroup.appendChild(centerCircle);

  const centerText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  centerText.setAttribute("x", cx);
  centerText.setAttribute("y", cy);
  centerText.setAttribute("class", "map-node-text");
  centerText.setAttribute("font-weight", "bold");
  centerText.textContent = truncateText(centerName, 12);
  centerGroup.appendChild(centerText);

  DOM.mapNodesLayer.appendChild(centerGroup);

  // Orbital Nodes Render
  items.forEach((item, index) => {
    const angle = (2 * Math.PI / total) * index - (Math.PI / 2);
    const nx = cx + radius * Math.cos(angle);
    const ny = cy + radius * Math.sin(angle);

    // Connecting Edge line
    const edge = document.createElementNS("http://www.w3.org/2000/svg", "line");
    edge.setAttribute("x1", cx);
    edge.setAttribute("y1", cy);
    edge.setAttribute("x2", nx);
    edge.setAttribute("y2", ny);
    edge.setAttribute("class", "map-edge");
    edge.setAttribute("id", `map-edge-${index}`);
    DOM.mapEdgesLayer.appendChild(edge);

    // Node Group
    const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    nodeGroup.setAttribute("class", "map-node-group");
    nodeGroup.setAttribute("tabindex", "0");
    nodeGroup.setAttribute("role", "button");
    nodeGroup.setAttribute("aria-label", `${item.name}: ${item.relation}`);

    // Node Circle
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", nx);
    circle.setAttribute("cy", ny);
    circle.setAttribute("r", 25);
    circle.setAttribute("fill", getTypeFillColor(item.type));
    circle.setAttribute("stroke", "#FFF8EC");
    circle.setAttribute("stroke-width", "2");
    circle.setAttribute("class", "map-node-circle");
    nodeGroup.appendChild(circle);

    // Node Name Label
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", nx);
    text.setAttribute("y", ny);
    text.setAttribute("class", "map-node-text");
    text.textContent = truncateText(item.name, 9);
    nodeGroup.appendChild(text);

    // Relation Tag below/above circle
    const relText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const labelOffset = ny > cy ? ny + 35 : ny - 30;
    relText.setAttribute("x", nx);
    relText.setAttribute("y", labelOffset);
    relText.setAttribute("class", "map-node-relation");
    relText.textContent = truncateText(item.relation, 14);
    nodeGroup.appendChild(relText);

    // Click / Touch Interaction: Open Bottom Sheet
    nodeGroup.addEventListener("click", () => {
      highlightMapEdge(index);
      openBottomSheet(item);
    });

    nodeGroup.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        highlightMapEdge(index);
        openBottomSheet(item);
      }
    });

    DOM.mapNodesLayer.appendChild(nodeGroup);
  });
}

function truncateText(text, maxChars) {
  if (!text) return "";
  return text.length > maxChars ? text.slice(0, maxChars - 1) + "…" : text;
}

function getTypeFillColor(type) {
  const colors = {
    person: "#FF9933",
    scripture: "#E8B84B",
    event: "#E55A5A",
    tradition: "#AF7AC5",
    place: "#38B2AC",
    concept: "#4299E1"
  };
  return colors[type] || "#FF9933";
}

function highlightMapEdge(highlightIndex) {
  const edges = DOM.mapEdgesLayer.querySelectorAll(".map-edge");
  edges.forEach((edge, i) => {
    edge.classList.toggle("highlighted", i === highlightIndex);
  });
}

// ---------------------------------------------------------------------------
// Bottom Sheet Drawer
// ---------------------------------------------------------------------------
function openBottomSheet(item) {
  STATE.activeSheetNode = item;
  DOM.sheetNodeName.textContent = item.name;
  DOM.sheetNodeType.textContent = item.type;
  DOM.sheetNodeType.setAttribute("data-type", item.type);
  DOM.sheetNodeRelation.textContent = item.relation;
  DOM.sheetNodeSource.textContent = item.source || "Parampara / Scripture";

  DOM.bottomSheetBackdrop.hidden = false;
  DOM.nodeBottomSheet.hidden = false;
}

function closeBottomSheet() {
  DOM.bottomSheetBackdrop.hidden = true;
  DOM.nodeBottomSheet.hidden = true;
  STATE.activeSheetNode = null;
  const highlighted = DOM.mapEdgesLayer.querySelectorAll(".map-edge.highlighted");
  highlighted.forEach(e => e.classList.remove("highlighted"));
}

// ---------------------------------------------------------------------------
// Share & Copy Actions
// ---------------------------------------------------------------------------
async function handleShare() {
  const t = I18N[STATE.lang] || I18N.hinglish;
  const shareData = {
    title: DOM.resTitle.textContent || "Dharma Setu",
    text: DOM.resSummary.textContent || "Explore Hindu Dharma with authentic scriptures.",
    url: window.location.href
  };

  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      if (err.name !== "AbortError") {
        copyToClipboard(window.location.href, t.toastCopied);
      }
    }
  } else {
    copyToClipboard(window.location.href, t.toastCopied);
  }
}

function handleCopySummary() {
  const t = I18N[STATE.lang] || I18N.hinglish;
  const title = DOM.resTitle.textContent;
  const summary = DOM.resSummary.textContent;
  const text = `${title} — Dharma Setu\n\n${summary}\n\nExplore: ${window.location.href}`;
  copyToClipboard(text, t.toastSummaryCopied);
}

function copyToClipboard(text, successMsg) {
  navigator.clipboard.writeText(text)
    .then(() => showToast(successMsg))
    .catch(() => {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast(successMsg);
    });
}

// ---------------------------------------------------------------------------
// Event Listeners Setup
// ---------------------------------------------------------------------------
function initEventListeners() {
  // Brand Logo -> Go Home
  DOM.brandHomeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const url = new URL(window.location.href);
    url.search = "";
    window.history.pushState({}, "", url.toString());
    showView("home");
  });

  // Theme Toggle
  DOM.themeToggleBtn.addEventListener("click", () => {
    const nextTheme = STATE.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  });

  // Language Switcher Buttons
  DOM.langBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const selected = btn.dataset.lang;
      if (selected !== STATE.lang) {
        applyLanguage(selected);
      }
    });
  });

  // Home Search Form Submit
  DOM.homeSearchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = DOM.homeSearchInput.value.trim();
    if (q) fetchExplanation(q);
  });

  // Clear Input Button
  DOM.homeSearchInput.addEventListener("input", () => {
    DOM.homeClearBtn.hidden = !DOM.homeSearchInput.value;
  });
  DOM.homeClearBtn.addEventListener("click", () => {
    DOM.homeSearchInput.value = "";
    DOM.homeClearBtn.hidden = true;
    DOM.homeSearchInput.focus();
  });

  // Example Chips
  DOM.exampleChips.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip-btn");
    if (chip && chip.dataset.query) {
      fetchExplanation(chip.dataset.query);
    }
  });

  // Clear Recent Searches
  DOM.clearRecentBtn.addEventListener("click", () => {
    STATE.recentSearches = [];
    localStorage.removeItem("dharmasetu_recent");
    renderRecentSearches();
  });

  // Breadcrumb Back Button
  DOM.breadcrumbBackBtn.addEventListener("click", () => {
    if (STATE.topicHistory.length > 0) {
      const prev = STATE.topicHistory.pop();
      fetchExplanation(prev.q, null, true);
    }
  });

  // Sticky Bottom Search Form Submit
  DOM.stickySearchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = DOM.stickySearchInput.value.trim();
    if (q) fetchExplanation(q);
  });

  // Bottom Sheet Close
  DOM.sheetCloseBtn.addEventListener("click", closeBottomSheet);
  DOM.bottomSheetBackdrop.addEventListener("click", closeBottomSheet);

  // Bottom Sheet Explore Button
  DOM.sheetExploreBtn.addEventListener("click", () => {
    if (STATE.activeSheetNode) {
      const targetQuery = STATE.activeSheetNode.name;
      const context = DOM.resTitle.textContent;
      closeBottomSheet();
      fetchExplanation(targetQuery, context);
    }
  });

  // Retry Button on Error View
  DOM.retryBtn.addEventListener("click", () => {
    if (STATE.currentQuery) {
      fetchExplanation(STATE.currentQuery);
    } else {
      showView("home");
    }
  });

  // Share & Copy Actions
  DOM.shareBtn.addEventListener("click", handleShare);
  DOM.copySummaryBtn.addEventListener("click", handleCopySummary);

  // Browser Navigation History (PopState)
  window.addEventListener("popstate", (e) => {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("q");
    const lang = url.searchParams.get("lang");

    if (lang && lang !== STATE.lang) {
      applyLanguage(lang);
    }

    if (q) {
      fetchExplanation(q, null, true);
    } else {
      showView("home");
    }
  });
}

// ---------------------------------------------------------------------------
// Ambient Particle Canvas Engine (Aarti Embers & Constellation Web)
// ---------------------------------------------------------------------------
const CanvasEngine = {
  canvas: null,
  ctx: null,
  particles: [],
  maxParticles: 42,
  width: 0,
  height: 0,
  dpr: 1,
  rafId: null,
  mouse: { x: -1000, y: -1000, active: false },
  reducedMotion: false,

  init() {
    this.canvas = document.getElementById("ambient-canvas");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    if (!this.ctx) return;

    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.resize();
    this.createParticles();
    this.bindEvents();

    if (!this.reducedMotion) {
      this.start();
    } else {
      this.drawStatic();
    }
  },

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.dpr, this.dpr);
  },

  createParticles() {
    this.particles = [];
    const count = this.width < 600 ? 28 : this.maxParticles;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2.2 + 0.8,
        vy: -(Math.random() * 0.45 + 0.22),
        baseVx: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.45 + 0.2,
        baseAlpha: Math.random() * 0.45 + 0.2,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        hue: Math.floor(Math.random() * 15 + 35) // warm gold / amber (35 - 50)
      });
    }
  },

  bindEvents() {
    window.addEventListener("resize", () => {
      this.resize();
      this.createParticles();
    }, { passive: true });

    window.addEventListener("pointermove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
    }, { passive: true });

    window.addEventListener("pointerleave", () => {
      this.mouse.active = false;
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    }, { passive: true });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.stop();
      } else if (!this.reducedMotion) {
        this.start();
      }
    });

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    mql.addEventListener("change", (e) => {
      this.reducedMotion = e.matches;
      if (this.reducedMotion) {
        this.stop();
        this.drawStatic();
      } else {
        this.start();
      }
    });
  },

  start() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    const loop = () => {
      this.updateAndDraw();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  },

  drawStatic() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
    for (const p of this.particles) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${p.hue}, 95%, 65%, ${p.alpha * 0.35})`;
      this.ctx.fill();
    }
  },

  updateAndDraw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const isResult = !DOM.resultView.hidden;

    // Constellation lines connecting nearby embers on result view
    if (isResult) {
      const maxDist = 72;
      const pLen = this.particles.length;
      this.ctx.lineWidth = 0.6;
      for (let i = 0; i < pLen; i++) {
        for (let j = i + 1; j < pLen; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * 0.15;
            this.ctx.strokeStyle = `rgba(232, 184, 75, ${lineAlpha})`;
            this.ctx.beginPath();
            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
            this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
            this.ctx.stroke();
          }
        }
      }
    }

    // Update and draw embers
    for (const p of this.particles) {
      p.phase += p.pulseSpeed;
      p.x += p.baseVx + Math.sin(p.phase) * 0.35;
      p.y += p.vy;

      // Mouse attraction
      if (this.mouse.active) {
        const mdx = this.mouse.x - p.x;
        const mdy = this.mouse.y - p.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 120 && mDist > 4) {
          p.x += (mdx / mDist) * 0.55;
          p.y += (mdy / mDist) * 0.55;
        }
      }

      // Recycle when rising off the screen
      if (p.y < -12) {
        p.y = this.height + 12;
        p.x = Math.random() * this.width;
      }
      if (p.x < -12) p.x = this.width + 12;
      if (p.x > this.width + 12) p.x = -12;

      // Dynamic glowing aarti ember
      const currentAlpha = p.baseAlpha + Math.sin(p.phase) * 0.15;
      const clampedAlpha = Math.max(0.08, Math.min(0.7, currentAlpha));

      const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.6);
      grad.addColorStop(0, `hsla(${p.hue}, 100%, 75%, ${clampedAlpha})`);
      grad.addColorStop(1, `hsla(${p.hue}, 90%, 55%, 0)`);

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius * 2.6, 0, Math.PI * 2);
      this.ctx.fill();

      // Core particle
      this.ctx.fillStyle = `hsla(${p.hue}, 100%, 88%, ${Math.min(1, clampedAlpha + 0.25)})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius * 0.85, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
};

// ---------------------------------------------------------------------------
// Mandala Parallax & Tilt Effect
// ---------------------------------------------------------------------------
const MandalaParallax = {
  wrap: null,
  targetX: 0,
  targetY: 0,
  currentX: 0,
  currentY: 0,
  rafId: null,

  init() {
    this.wrap = document.getElementById("mandala-parallax-wrap");
    if (!this.wrap) return;

    // Desktop pointer movement
    window.addEventListener("pointermove", (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      this.targetX = ((e.clientX - cx) / cx) * 20; // +/- 20px
      this.targetY = ((e.clientY - cy) / cy) * 14; // +/- 14px
    }, { passive: true });

    // Mobile gyroscope / device orientation tilt
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== "function") {
      window.addEventListener("deviceorientation", (e) => {
        if (e.gamma !== null && e.beta !== null) {
          this.targetX = Math.max(-24, Math.min(24, e.gamma * 0.6));
          this.targetY = Math.max(-18, Math.min(18, (e.beta - 45) * 0.5));
        }
      }, { passive: true });
    }

    this.animate();
  },

  animate() {
    this.currentX += (this.targetX - this.currentX) * 0.08;
    this.currentY += (this.targetY - this.currentY) * 0.08;

    if (this.wrap) {
      this.wrap.style.transform = `translateX(calc(-50% + ${this.currentX.toFixed(2)}px)) translateY(${this.currentY.toFixed(2)}px)`;
    }

    this.rafId = requestAnimationFrame(() => this.animate());
  }
};

// ---------------------------------------------------------------------------
// Tap / Click Tactile Ripple Effect
// ---------------------------------------------------------------------------
function initRippleEffect() {
  document.addEventListener("pointerdown", (e) => {
    const btn = e.target.closest(".ripple-effect");
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const circle = document.createElement("span");
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add("ripple-circle");

    const existing = btn.querySelector(".ripple-circle");
    if (existing) existing.remove();

    btn.appendChild(circle);
    setTimeout(() => circle.remove(), 620);
  });
}

// ---------------------------------------------------------------------------
// App Bootstrapping
// ---------------------------------------------------------------------------
function initApp() {
  applyTheme(STATE.theme);
  applyLanguage(STATE.lang);
  renderRecentSearches();
  initEventListeners();
  initRippleEffect();
  CanvasEngine.init();
  MandalaParallax.init();

  // Check URL on initial load for shareable link (?q=Ram&lang=hinglish)
  const urlParams = new URLSearchParams(window.location.search);
  const initialQ = urlParams.get("q");
  const initialLang = urlParams.get("lang");

  if (initialLang && I18N[initialLang]) {
    applyLanguage(initialLang);
  }

  if (initialQ) {
    DOM.homeSearchInput.value = initialQ;
    fetchExplanation(initialQ);
  } else {
    showView("home");
  }
}

document.addEventListener("DOMContentLoaded", initApp);
