import {
  getDefaultDictionary,
  getDictionaryValue,
  loadLocaleDictionary,
  type LocaleDictionary,
} from "@/modules/localization/dictionary";

type GlobalCopyBundle = {
  cta: typeof globalCtaCopy;
  label: typeof globalLabelCopy;
  navigation: typeof globalNavigationCopy;
  footer: typeof globalFooterCopy;
  locale: typeof globalLocaleCopy;
  monetization: typeof globalMonetizationCopy;
};

function createGlobalCopyBundle(dictionary: LocaleDictionary) {
  const cta = {
    generateKundli: getDictionaryValue(
      dictionary,
      "cta.generateKundli",
      "Generate Your Kundli"
    ),
    exploreAi: getDictionaryValue(dictionary, "cta.exploreAi", "Try NAVAGRAHA AI"),
    bookConsultation: getDictionaryValue(
      dictionary,
      "cta.bookConsultation",
      "Book Free Consultation"
    ),
    signInAccount: getDictionaryValue(
      dictionary,
      "cta.signInAccount",
      "Sign In / Account"
    ),
    unlockFullReport: getDictionaryValue(
      dictionary,
      "cta.unlockFullReport",
      "Get Free Report"
    ),
  } as const;

  const label = {
    currencyCode: getDictionaryValue(dictionary, "labels.currencyCode", "INR"),
    currencyNote: getDictionaryValue(
      dictionary,
      "labels.currencyNote",
      "All astrology services are currently free for limited launch access."
    ),
    limitedFreeAccessLabel: getDictionaryValue(
      dictionary,
      "labels.limitedFreeAccessLabel",
      "Currently Free (Limited Launch Access)"
    ),
    limitedFreeBanner: getDictionaryValue(
      dictionary,
      "labels.limitedFreeBanner",
      "Limited Launch Access: All Astrology Services Are Free"
    ),
    earlyAccessLabel: getDictionaryValue(
      dictionary,
      "labels.earlyAccessLabel",
      "Early Access Premium Experience"
    ),
    premiumExperienceLabel: getDictionaryValue(
      dictionary,
      "labels.premiumExperienceLabel",
      "Premium Experience"
    ),
    timezoneHint: getDictionaryValue(
      dictionary,
      "labels.timezoneHint",
      "Use an IANA timezone, for example: Asia/Kolkata, Europe/London, or America/New_York."
    ),
    dateHint: getDictionaryValue(
      dictionary,
      "labels.dateHint",
      "Use your birth date in local calendar format (YYYY-MM-DD)."
    ),
    timeHint: getDictionaryValue(
      dictionary,
      "labels.timeHint",
      "Use your birth time in local time (24-hour format)."
    ),
  } as const;

  const navigation = {
    home: getDictionaryValue(dictionary, "navigation.home", "Home"),
    kundli: getDictionaryValue(dictionary, "navigation.kundli", "Kundli"),
    compatibility: getDictionaryValue(
      dictionary,
      "navigation.compatibility",
      "Compatibility"
    ),
    rashifal: getDictionaryValue(dictionary, "navigation.rashifal", "Rashifal"),
    ai: getDictionaryValue(dictionary, "navigation.ai", "NAVAGRAHA AI"),
    reports: getDictionaryValue(dictionary, "navigation.reports", "Reports"),
    tools: getDictionaryValue(dictionary, "navigation.tools", "Tools"),
    panchang: getDictionaryValue(dictionary, "navigation.panchang", "Panchang"),
    consultation: getDictionaryValue(
      dictionary,
      "navigation.consultation",
      "Consultation"
    ),
    shop: getDictionaryValue(dictionary, "navigation.shop", "Shop"),
    insights: getDictionaryValue(dictionary, "navigation.insights", "Insights"),
    calculators: getDictionaryValue(
      dictionary,
      "navigation.calculators",
      "Calculators"
    ),
    timeTools: getDictionaryValue(dictionary, "navigation.timeTools", "Time Tools"),
    dailyRashifal: getDictionaryValue(
      dictionary,
      "navigation.dailyRashifal",
      "Daily Rashifal"
    ),
    pricing: getDictionaryValue(dictionary, "navigation.pricing", "Pricing"),
    plans: getDictionaryValue(dictionary, "navigation.plans", "Plans"),
    services: getDictionaryValue(dictionary, "navigation.services", "Services"),
    account: getDictionaryValue(dictionary, "navigation.account", "Account"),
    menu: getDictionaryValue(dictionary, "navigation.menu", "Menu"),
    dashboard: getDictionaryValue(dictionary, "navigation.dashboard", "Dashboard"),
    onboarding: getDictionaryValue(
      dictionary,
      "navigation.onboarding",
      "Onboarding"
    ),
    askMyChart: getDictionaryValue(
      dictionary,
      "navigation.askMyChart",
      "Ask My Chart"
    ),
    consultations: getDictionaryValue(
      dictionary,
      "navigation.consultations",
      "Consultations"
    ),
    orders: getDictionaryValue(dictionary, "navigation.orders", "Orders"),
    chart: getDictionaryValue(dictionary, "navigation.chart", "Chart"),
    report: getDictionaryValue(dictionary, "navigation.report", "Report"),
    settings: getDictionaryValue(dictionary, "navigation.settings", "Settings"),
    admin: getDictionaryValue(dictionary, "navigation.admin", "Admin"),
    styleGuide: getDictionaryValue(dictionary, "navigation.styleGuide", "Style Guide"),
    login: getDictionaryValue(dictionary, "navigation.login", "Login"),
    passwordReset: getDictionaryValue(
      dictionary,
      "navigation.passwordReset",
      "Password Reset"
    ),
  } as const;

  const footer = {
    columns: {
      centre: getDictionaryValue(dictionary, "footer.columns.centre", "Centre"),
      tools: getDictionaryValue(dictionary, "footer.columns.tools", "Tools"),
      services: getDictionaryValue(dictionary, "footer.columns.services", "Services"),
    },
    links: {
      about: getDictionaryValue(dictionary, "footer.links.about", "About"),
      contact: getDictionaryValue(dictionary, "footer.links.contact", "Contact"),
      astrologer: getDictionaryValue(dictionary, "footer.links.astrologer", "Astrologer"),
      allTools: getDictionaryValue(dictionary, "footer.links.allTools", "All Tools"),
      numerology: getDictionaryValue(dictionary, "footer.links.numerology", "Numerology"),
      muhurtaLite: getDictionaryValue(dictionary, "footer.links.muhurtaLite", "Muhurta Lite"),
      privacy: getDictionaryValue(dictionary, "footer.links.privacy", "Privacy"),
      terms: getDictionaryValue(dictionary, "footer.links.terms", "Terms"),
      disclaimer: getDictionaryValue(dictionary, "footer.links.disclaimer", "Disclaimer"),
      refundPolicy: getDictionaryValue(
        dictionary,
        "footer.links.refundPolicy",
        "Refund Policy"
      ),
    },
    languageLabel: getDictionaryValue(dictionary, "footer.languageLabel", "Language"),
    languageHelper: getDictionaryValue(
      dictionary,
      "footer.languageHelper",
      "English is active today. Future Indian and international languages are registered here and will remain disabled until complete translations are ready."
    ),
  } as const;

  const locale = {
    language: getDictionaryValue(dictionary, "common.language", "Language"),
    englishDefault: getDictionaryValue(
      dictionary,
      "common.englishDefault",
      "English (Default)"
    ),
    live: getDictionaryValue(dictionary, "common.live", "Live"),
    planned: getDictionaryValue(dictionary, "common.planned", "Planned"),
    comingSoon: getDictionaryValue(dictionary, "common.comingSoon", "Coming soon"),
    defaultExperience: getDictionaryValue(
      dictionary,
      "common.defaultExperience",
      "Default experience"
    ),
    futureLanguagesNote: getDictionaryValue(
      dictionary,
      "common.futureLanguagesNote",
      "English remains the live experience. Additional languages will appear here as they are released."
    ),
  } as const;

  const monetization = {
    bookConsultation: getDictionaryValue(
      dictionary,
      "monetization.bookConsultation",
      "Book Consultation"
    ),
    getDetailedReport: getDictionaryValue(
      dictionary,
      "monetization.getDetailedReport",
      "Get Detailed Report"
    ),
    exploreShop: getDictionaryValue(
      dictionary,
      "monetization.exploreShop",
      "Explore Shop"
    ),
    gemstoneGuidance: getDictionaryValue(
      dictionary,
      "monetization.gemstoneGuidance",
      "Gemstone Guidance"
    ),
    comingSoon: getDictionaryValue(
      dictionary,
      "monetization.comingSoon",
      "Coming Soon"
    ),
    premiumAi: getDictionaryValue(dictionary, "monetization.premiumAi", "Premium AI"),
    sponsored: getDictionaryValue(dictionary, "monetization.sponsored", "Sponsored"),
    advertisement: getDictionaryValue(
      dictionary,
      "monetization.advertisement",
      "Advertisement"
    ),
    relatedGuidance: getDictionaryValue(
      dictionary,
      "monetization.relatedGuidance",
      "Related Guidance"
    ),
    talkToAstrologer: getDictionaryValue(
      dictionary,
      "monetization.talkToAstrologer",
      "Talk to Astrologer"
    ),
    viewReports: getDictionaryValue(
      dictionary,
      "monetization.viewReports",
      "View Reports"
    ),
    continueReading: getDictionaryValue(
      dictionary,
      "monetization.continueReading",
      "Continue Reading"
    ),
  } as const;

  return {
    cta,
    label,
    navigation,
    footer,
    locale,
    monetization,
  } as const;
}

const defaultBundle = createGlobalCopyBundle(getDefaultDictionary());

export const globalCtaCopy = defaultBundle.cta;
export const globalLabelCopy = defaultBundle.label;
export const globalNavigationCopy = defaultBundle.navigation;
export const globalFooterCopy = defaultBundle.footer;
export const globalLocaleCopy = defaultBundle.locale;
export const globalMonetizationCopy = defaultBundle.monetization;

export async function getGlobalCopyBundleForLocale(locale?: string | null): Promise<GlobalCopyBundle> {
  const loaded = await loadLocaleDictionary(locale);

  return createGlobalCopyBundle(loaded.dictionary);
}
