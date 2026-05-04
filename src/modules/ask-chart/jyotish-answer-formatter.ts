import "server-only";

import {
  formatConfidenceLine,
  getAstrologyDisclaimer,
  resolvePredictionLocale,
} from "@/lib/astrology/accuracy";
import type { AstrologyAssistantStructuredResponse } from "@/modules/ask-chart/assistant-response-engine";
import type { ChartAiContext } from "@/modules/ask-chart/chart-context-mapper";
import type { PredictiveAssistantContextOutput } from "@/modules/astrology/predictive-assistant-context";
import type { UserPlanType } from "@/modules/subscriptions";

export type AskMyChartIntent =
  | "PLACEMENT_EXPLANATION"
  | "HOUSE_OR_ASPECT_EXPLANATION"
  | "CHART_SUMMARY"
  | "REMEDY_EXPLANATION"
  | "TRANSIT_EXPLANATION"
  | "UNSUPPORTED";

type AskChartFormatterToolBundle = {
  chartSummaryFacts: null | {
    ascendantSign: string;
    houseSystem: string;
    dominantBodies: string[];
    narrative: string;
    matchingPlacements: {
      body: string;
      sign: string;
      house: number;
      retrograde: boolean;
    }[];
    matchingHouses: {
      house: number;
      sign: string;
      ruler: string;
    }[];
    matchingAspects: {
      source: string;
      type: string;
      target: string;
      orb: number;
      exact: boolean;
    }[];
  };
  transitSnapshot: null | {
    transits: {
      body: string;
      sign: string;
      house: number;
      summary: string;
      intensity: string;
    }[];
  };
  predictiveAssistantContext: PredictiveAssistantContextOutput | null;
  approvedRemedies: {
    remedies: {
      id: string;
      slug: string;
      title: string;
      type: string;
      priorityTier: string;
      confidenceLabel: string;
      summary: string;
      cautionNote: string | null;
      whyThisRemedy: {
        summary: string;
        chartGrounding: string;
        approvedRecordBasis: string;
      };
      cautions: {
        label: string;
        note: string;
      }[];
      productMapping: {
        note: string;
        purchaseRequired: false;
        safety: {
          optionalPurchaseLabel: string;
          nonGuaranteeNote: string;
          noPressureNote: string;
          standaloneRemedyNote: string;
        };
      };
      signalKey: string;
    }[];
    consultationPreparation: {
      summary: string;
      topRecommendations: {
        slug: string;
        title: string;
        priorityTier: string;
        confidenceLabel: string;
        note: string;
      }[];
    };
  };
  relatedProducts: {
    products: {
      id: string;
      slug: string;
      name: string;
      summary: string;
      priceLabel: string;
      categoryLabel: string;
    }[];
  };
  consultationContext: null | {
    confirmationCode: string;
    serviceLabel: string;
    topicFocus: string | null;
    intakeSummary: string | null;
    remedyPreparation?: {
      summary: string;
      topRecommendations: {
        slug: string;
        title: string;
        priorityTier: string;
        confidenceLabel: string;
        note: string;
      }[];
    };
  };
  dailyPanchangSnapshot: null | {
    asOfDate: string;
    locationLabel: string;
    moonSign: string;
    dayFeel: string;
    dailyQuality: string;
    spiritualTone: string[];
    suitableFocus: string[];
    cautionAreas: string[];
    observanceHints: string[];
    sunriseLocalTime: string;
    sunsetLocalTime: string;
    transitionWindows: {
      cautionWindows: string[];
      supportiveWindows: string[];
      cautionTimeBlocks: string[];
      betterTimeBlocks: string[];
      note: string;
    };
  };
  dailyRashifalSnapshot: null | {
    signSlug: string;
    signName: string;
    shortPrediction: string;
    luckyColor: string;
    luckyNumber: string;
    luckyTime: string;
  };
};

type FormatterDomain =
  | "career"
  | "marriage"
  | "finance"
  | "health"
  | "education"
  | "business"
  | "remedy"
  | "family"
  | "daily_guidance"
  | "life_period"
  | "general";

type CareerFormatterIntent =
  | "job_service"
  | "business"
  | "career_growth"
  | "job_change"
  | "promotion"
  | "government_private_job"
  | "study_to_career"
  | "obstacles_work_pressure"
  | "income_gains"
  | "professional_reputation"
  | "general_career";

type BusinessFormatterIntent =
  | "business_suitability"
  | "job_vs_business"
  | "side_business"
  | "startup"
  | "partnership"
  | "client_growth"
  | "trade_commerce"
  | "investment_risk"
  | "debt_loan_pressure"
  | "profit_timing"
  | "expansion"
  | "foreign_business"
  | "family_business"
  | "legal_tax"
  | "business_remedy"
  | "general_business";

type RelationshipFormatterIntent =
  | "marriage_timing"
  | "relationship_stability"
  | "compatibility"
  | "partner_nature"
  | "marriage_delay"
  | "family_involvement"
  | "emotional_harmony"
  | "conflict_caution"
  | "breakup_divorce_fear"
  | "love_vs_arranged"
  | "second_marriage"
  | "consultation_report_guidance"
  | "general_relationship";

type FinanceFormatterIntent =
  | "income"
  | "savings"
  | "expenses"
  | "debt"
  | "wealth_growth"
  | "business_profit"
  | "investment_risk"
  | "financial_timing"
  | "sudden_gain_loss"
  | "financial_discipline"
  | "money_remedy"
  | "general_finance";

type HealthFormatterIntent =
  | "general_wellness"
  | "stress"
  | "sleep"
  | "energy_vitality"
  | "emotional_balance"
  | "emotional_distress"
  | "routine_discipline"
  | "health_caution_period"
  | "spiritual_lifestyle_support"
  | "medical_concern"
  | "mental_distress"
  | "emergency_self_harm_risk"
  | "general_health";

type EducationFormatterIntent =
  | "basic_education"
  | "subject_choice"
  | "higher_studies"
  | "competitive_exams"
  | "concentration_memory"
  | "study_routine"
  | "admission_timing"
  | "academic_pressure"
  | "learning_obstacles"
  | "study_to_career"
  | "education_remedy"
  | "general_education";

type RemedyFormatterIntent =
  | "mantra_prayer"
  | "charity_daan"
  | "fasting_discipline"
  | "puja_guidance"
  | "daily_spiritual_practice"
  | "graha_related"
  | "gemstone_rudraksha_yantra"
  | "lifestyle_correction"
  | "consultation_shop"
  | "general_remedy";

export type JyotishAnswerFormatterInput = {
  response: AstrologyAssistantStructuredResponse;
  locale?: string | null;
  includeDisclaimer?: boolean;
  intent?: AskMyChartIntent | null;
  question?: string | null;
  chartContext?: ChartAiContext | null;
  toolBundle?: AskChartFormatterToolBundle | null;
  planType?: UserPlanType | null;
};

const dailyPredictionQuestionPattern =
  /\b(today|today's|daily|tomorrow|tonight|how is my day|what should i focus on today|what should i avoid today|best time|auspicious time|lucky color|lucky number|lucky time|caution window|personalized daily guidance|daily prediction|daily personalized prediction|personalized daily prediction)\b/i;

function normalizeWhitespace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function toSentenceLines(text: string, maxLines: number) {
  const normalized = normalizeWhitespace(text);
  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!sentences.length) {
    return [normalized];
  }

  return sentences.slice(0, maxLines);
}

function titleCase(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function detectDomains(question: string): FormatterDomain[] {
  const normalized = question.toLowerCase();
  const domains = new Set<FormatterDomain>();
  const add = (domain: FormatterDomain, pattern: RegExp) => {
    if (pattern.test(normalized)) {
      domains.add(domain);
    }
  };

  add("career", /\bcareer|job|profession|promotion|work\b/i);
  add("marriage", /\bmarriage|relationship|partner|spouse|love\b/i);
  add("finance", /\bfinance|financial|money|income|wealth|investment|savings\b/i);
  add(
    "health",
    /\bhealth|wellbeing|well-being|wellness|stress|sleep|energy|vitality|routine|rest|fatigue|burnout|anxiety|emotional balance|mental health\b/i
  );
  add("education", /\beducation|study|exam|learning|academic\b/i);
  add("business", /\bbusiness|venture|trade|entrepreneur\b/i);
  add(
    "remedy",
    /\bremedy|remedies|mantra|prayer|puja|daan|charity|fasting|gemstone|rudraksha|yantra|mala|japa|stotra|homa|havan|upay|upaya|spiritual support\b/i
  );
  add("family", /\bfamily|parents|children|home\b/i);
  add(
    "daily_guidance",
    /\bdaily|today|today's|tomorrow|tonight|this week|routine|lucky color|lucky number|lucky time|auspicious time|caution window|best time|personalized daily guidance|daily prediction|daily personalized prediction|personalized daily prediction\b/i
  );
  add("life_period", /\bperiod|phase|dasha|transit|timing|current cycle\b/i);

  if (!domains.size) {
    domains.add("general");
  }

  return Array.from(domains);
}

function detectCareerIntents(question: string): CareerFormatterIntent[] {
  const normalized = question.toLowerCase();
  const intents = new Set<CareerFormatterIntent>();
  const add = (intent: CareerFormatterIntent, pattern: RegExp) => {
    if (pattern.test(normalized)) {
      intents.add(intent);
    }
  };

  add("job_service", /\bjob|service|employment|office|salary|interview\b/i);
  add("business", /\bbusiness|startup|venture|trade|entrepreneur|self[-\s]?employ\b/i);
  add(
    "career_growth",
    /\bcareer growth|career path|long[-\s]?term career|career progress|professional growth\b/i
  );
  add("job_change", /\bjob change|switch|transition|change job|new role\b/i);
  add("promotion", /\bpromotion|appraisal|raise|recognition\b/i);
  add(
    "government_private_job",
    /\bgovernment job|govt|public sector|private job|corporate\b/i
  );
  add("study_to_career", /\bstudy|education|degree|course|learning|campus\b/i);
  add(
    "obstacles_work_pressure",
    /\bobstacle|delay|pressure|work stress|competition|block\b/i
  );
  add(
    "income_gains",
    /\bincome|earning|salary growth|gains|network|resources|revenue\b/i
  );
  add(
    "professional_reputation",
    /\breputation|public image|authority|status|visibility\b/i
  );

  if (!intents.size) {
    intents.add("general_career");
  }

  return Array.from(intents);
}

function detectBusinessIntents(question: string): BusinessFormatterIntent[] {
  const normalized = question.toLowerCase();
  const intents = new Set<BusinessFormatterIntent>();
  const add = (intent: BusinessFormatterIntent, pattern: RegExp) => {
    if (pattern.test(normalized)) {
      intents.add(intent);
    }
  };

  add("business_suitability", /\bbusiness suitability|suitable for business|business or job|should i do business\b/i);
  add("job_vs_business", /\bjob vs business|business vs job|job or business|service or business\b/i);
  add("side_business", /\bside business|part-time business|small business|small venture\b/i);
  add("startup", /\bstartup|new venture|launch|found(?:ing|er)|begin a business\b/i);
  add("partnership", /\bpartnership|partner|cofounder|co-founder|joint venture\b/i);
  add("client_growth", /\bclient|customer|sales growth|customer growth|lead generation\b/i);
  add("trade_commerce", /\btrade|commerce|retail|wholesale|distribution|market\b/i);
  add("investment_risk", /\binvestment|invest|risk|capital|funding|venture capital\b/i);
  add("debt_loan_pressure", /\bdebt|loan|loan pressure|borrow|borrowing|repayment\b/i);
  add("profit_timing", /\bprofit timing|business profit|when.*profit|cash flow\b/i);
  add("expansion", /\bexpansion|scale|scaling|growth|grow the business\b/i);
  add("foreign_business", /\bforeign business|overseas|export|import|international\b/i);
  add("family_business", /\bfamily business|family venture|business with family\b/i);
  add("legal_tax", /\blegal|law|tax|taxes|contract|contracts|compliance|agreement|agreements\b/i);
  add("business_remedy", /\bbusiness remedy|remedy for business|business upay|upaya for business\b/i);

  if (!intents.size) {
    intents.add("general_business");
  }

  return Array.from(intents);
}

function detectRelationshipIntents(question: string): RelationshipFormatterIntent[] {
  const normalized = question.toLowerCase();
  const intents = new Set<RelationshipFormatterIntent>();
  const add = (intent: RelationshipFormatterIntent, pattern: RegExp) => {
    if (pattern.test(normalized)) {
      intents.add(intent);
    }
  };

  add("marriage_timing", /\bmarriage timing|when (?:will|can|should).{0,20}marry|wedding timing|marriage date\b/i);
  add("relationship_stability", /\bstable|stability|long[-\s]?term relationship|will it last|relationship harmony\b/i);
  add("compatibility", /\bcompatibility|matchmaking|guna milan|kundli matching|match score\b/i);
  add("partner_nature", /\bpartner nature|future spouse|spouse nature|life partner|partner character\b/i);
  add("marriage_delay", /\bdelay in marriage|late marriage|marriage delay\b/i);
  add("family_involvement", /\bfamily|parents|in[-\s]?laws|approval|support\b/i);
  add("emotional_harmony", /\bemotional|harmony|understanding|communication|bond\b/i);
  add("conflict_caution", /\bconflict|fight|argument|distance|tension|caution\b/i);
  add("breakup_divorce_fear", /\bbreakup|divorce|separation|split|ending\b/i);
  add("love_vs_arranged", /\blove marriage|arranged marriage\b/i);
  add("second_marriage", /\bsecond marriage|remarriage\b/i);
  add(
    "consultation_report_guidance",
    /\breport|consultation|session|expert|advisor\b/i
  );

  if (!intents.size) {
    intents.add("general_relationship");
  }

  return Array.from(intents);
}

function detectFinanceIntents(question: string): FinanceFormatterIntent[] {
  const normalized = question.toLowerCase();
  const intents = new Set<FinanceFormatterIntent>();
  const add = (intent: FinanceFormatterIntent, pattern: RegExp) => {
    if (pattern.test(normalized)) {
      intents.add(intent);
    }
  };

  add("income", /\bincome|salary|earnings|cash flow|cashflow|income growth\b/i);
  add("savings", /\bsavings|save|saving|reserve|emergency fund\b/i);
  add("expenses", /\bexpense|expenses|spending|spend|outflow|costs?\b/i);
  add("debt", /\bdebt|loan|loans|borrowing|repayment|emi|interest burden\b/i);
  add("wealth_growth", /\bwealth|wealth growth|net worth|assets|accumulation\b/i);
  add("business_profit", /\bbusiness profit|profit|margin|revenue|turnover|cash flow|cashflow\b/i);
  add("investment_risk", /\binvest|investment|portfolio|stocks?|crypto|trading|speculation|risk\b/i);
  add(
    "financial_timing",
    /\b(financial timing|finance timing|money timing|income timing|wealth timing|savings timing|debt timing|loan timing|cash flow timing|financial period|money period|income period|wealth period)\b/i
  );
  add("sudden_gain_loss", /\bsudden gain|sudden loss|unexpected gain|unexpected loss\b/i);
  add("financial_discipline", /\bdiscipline|budget|budgeting|planning|control|prudence\b/i);
  add("money_remedy", /\bremedy|mantra|prayer|ritual|upaya|solution\b/i);

  if (!intents.size) {
    intents.add("general_finance");
  }

  return Array.from(intents);
}

function detectHealthIntents(question: string): HealthFormatterIntent[] {
  const normalized = question.toLowerCase();
  const intents = new Set<HealthFormatterIntent>();
  const add = (intent: HealthFormatterIntent, pattern: RegExp) => {
    if (pattern.test(normalized)) {
      intents.add(intent);
    }
  };

  add("general_wellness", /\bwellness|well-being|wellbeing|health\b/i);
  add("stress", /\bstress|pressure|overwhelm|burnout|anxious|anxiety\b/i);
  add("sleep", /\bsleep|insomnia|rest|restless|fatigue\b/i);
  add("energy_vitality", /\benergy|vitality|strength|weakness|low energy\b/i);
  add("emotional_balance", /\bemotional|mood|balance|inner calm|peace\b/i);
  add("emotional_distress", /\bemotional distress|emotionally disturbed|distressed\b/i);
  add("routine_discipline", /\broutine|discipline|habit|lifestyle|daily\b/i);
  add("health_caution_period", /\bcaution|sensitive period|health period|health timing\b/i);
  add("spiritual_lifestyle_support", /\bprayer|mantra|meditation|charity|spiritual\b/i);
  add("medical_concern", /\bmedical|symptom|symptoms|illness|disease|doctor\b/i);
  add("mental_distress", /\bmental|distress|hopeless|depressed|depression|panic\b/i);
  add("emergency_self_harm_risk", /\bself[-\s]?harm|suicid|hurt myself|unsafe|emergency\b/i);

  if (!intents.size) {
    intents.add("general_health");
  }

  return Array.from(intents);
}

function detectEducationIntents(question: string): EducationFormatterIntent[] {
  const normalized = question.toLowerCase();
  const intents = new Set<EducationFormatterIntent>();
  const add = (intent: EducationFormatterIntent, pattern: RegExp) => {
    if (pattern.test(normalized)) {
      intents.add(intent);
    }
  };

  add("basic_education", /\b(school|college|university|education|study)\b/i);
  add(
    "subject_choice",
    /\b(subject choice|which subject|stream|major|course choice|what to study)\b/i
  );
  add("higher_studies", /\b(higher study|higher studies|postgraduate|masters|phd|research)\b/i);
  add(
    "competitive_exams",
    /\b(competitive exam|entrance exam|exam|exams|rank|ranking|pass|fail|score)\b/i
  );
  add(
    "concentration_memory",
    /\b(concentration|focus|memory|retention|attention|study focus)\b/i
  );
  add("study_routine", /\b(study routine|revision|timetable|schedule|daily study)\b/i);
  add("admission_timing", /\b(admission|entrance|enrol|enroll|application|deadline)\b/i);
  add(
    "academic_pressure",
    /\b(academic pressure|exam pressure|study stress|pressure|anxiety|failure anxiety)\b/i
  );
  add(
    "learning_obstacles",
    /\b(learning obstacle|learning difficulty|struggle with study|cannot study|distract)\b/i
  );
  add("study_to_career", /\bstudy to career|study[-\s]?career|career direction\b/i);
  add("education_remedy", /\b(education remedy|study remedy|remedy for study|remedy for exam)\b/i);

  if (!intents.size) {
    intents.add("general_education");
  }

  return Array.from(intents);
}

function detectRemedyIntents(question: string): RemedyFormatterIntent[] {
  const normalized = question.toLowerCase();
  const intents = new Set<RemedyFormatterIntent>();
  const add = (intent: RemedyFormatterIntent, pattern: RegExp) => {
    if (pattern.test(normalized)) {
      intents.add(intent);
    }
  };

  add("mantra_prayer", /\bmantra|prayer|japa|stotra|chant|chanting|naam\b/i);
  add("charity_daan", /\bdaan|daanam|charity|donation|seva\b/i);
  add("fasting_discipline", /\bfast|vrat|vow|discipline|observe a fast\b/i);
  add("puja_guidance", /\bpuja|pooja|homa|havan|ritual|worship\b/i);
  add("daily_spiritual_practice", /\bdaily remedy|daily practice|daily spiritual|routine\b/i);
  add(
    "graha_related",
    /\bgraha|planetary|planet|sun remedy|moon remedy|saturn remedy|rahu remedy|ketu remedy|mars remedy|jupiter remedy|venus remedy|mercury remedy\b/i
  );
  add("gemstone_rudraksha_yantra", /\bgemstone|rudraksha|yantra|crystal|mala\b/i);
  add("lifestyle_correction", /\blifestyle|habits|sleep|diet|routine|correction\b/i);
  add("consultation_shop", /\bconsult|consultation|shop|product|buy|purchase|recommended item\b/i);

  if (!intents.size) {
    intents.add("general_remedy");
  }

  return Array.from(intents);
}

function isCareerQuestion(input: { question: string; domains: FormatterDomain[] }) {
  if (input.domains.includes("career") || input.domains.includes("business")) {
    return true;
  }

  return /\bcareer|job|profession|promotion|employment|work|business|entrepreneur|income|salary|gains|network|reputation\b/i.test(
    input.question
  );
}

function isBusinessQuestion(input: { question: string; domains: FormatterDomain[] }) {
  if (input.domains.includes("business")) {
    return true;
  }

  return /\bbusiness|startup|entrepreneur|entrepreneurship|venture|trade|commerce|client|customer|partnership|co[-\s]?founder|cofounder|side business|family business|export|import|retail|wholesale|distribution|launch|scale|scaling|expansion|foreign business\b/i.test(
    input.question
  );
}

function isRelationshipQuestion(input: {
  question: string;
  domains: FormatterDomain[];
}) {
  const question = input.question;

  if (
    /\bmarriage|relationship|compatibility|spouse|love|love marriage|arranged marriage|wedding|divorce|breakup|separation|remarriage|second marriage\b/i.test(
      question
    )
  ) {
    return true;
  }

  if (
    /\bpartner|fianc(?:e|ee)|in[-\s]?laws?\b/i.test(question) &&
    !/\bcareer|job|profession|promotion|employment|work|business|entrepreneur|income|salary|gains|network|reputation|startup|trade\b/i.test(
      question
    )
  ) {
    return true;
  }

  return false;
}

function buildChartAnchorLine(chartContext: ChartAiContext | null | undefined) {
  if (!chartContext) {
    return "Chart anchor is limited in this reply.";
  }

  const lagna = chartContext.lagna.sign;
  const moon = chartContext.moonSign;
  const sun = chartContext.sunSign;

  const parts = [`Lagna in ${lagna}`];

  if (moon) {
    parts.push(`Moon in ${moon}`);
  }

  if (sun) {
    parts.push(`Sun in ${sun}`);
  }

  return `${parts.join(", ")} is the core chart anchor for this answer.`;
}

function buildTimingInsight(input: {
  toolBundle?: AskChartFormatterToolBundle | null;
}) {
  const predictive = input.toolBundle?.predictiveAssistantContext;

  if (predictive?.active_period_context?.active_chain?.length) {
    const activeChain = predictive.active_period_context.active_chain
      .map((planet) => titleCase(planet))
      .join(" -> ");
    const nextTransition = predictive.active_period_context.next_transition_at
      ? ` Next transition: ${new Date(
          predictive.active_period_context.next_transition_at
        ).toLocaleDateString("en-IN")}.`
      : "";

    return `Current dasha chain is ${activeChain}.${nextTransition}`;
  }

  const leadTransit = input.toolBundle?.transitSnapshot?.transits?.[0];

  if (leadTransit) {
    return `${titleCase(leadTransit.body)} transit in ${leadTransit.sign} (house ${leadTransit.house}) currently sets the main timing tone.`;
  }

  return "Timing context is limited right now, so treat this guidance as a measured trend rather than a fixed outcome.";
}

function buildDailyPredictionCoreMessage(input: {
  summaryLines: string[];
  toolBundle?: AskChartFormatterToolBundle | null;
  compact: boolean;
}) {
  const lines = input.summaryLines.slice(0, input.compact ? 2 : 3);
  const dailySnapshot = input.toolBundle?.dailyRashifalSnapshot;
  const panchangSnapshot = input.toolBundle?.dailyPanchangSnapshot;

  if (dailySnapshot) {
    lines.push(`Personalized daily cue for ${dailySnapshot.signName}: ${dailySnapshot.shortPrediction}`);
  } else if (panchangSnapshot) {
    lines.push(
      `Daily tone for ${panchangSnapshot.asOfDate} in ${panchangSnapshot.locationLabel} feels ${panchangSnapshot.dayFeel.toLowerCase()} with a ${panchangSnapshot.dailyQuality.toLowerCase()} quality.`
    );
  } else {
    lines.push("This is personalized daily guidance, so treat it as a timing trend rather than a fixed event.");
  }

  return lines.join(" ");
}

function buildDailyPredictionTimingInsight(input: {
  toolBundle?: AskChartFormatterToolBundle | null;
  compact: boolean;
}) {
  const predictive = input.toolBundle?.predictiveAssistantContext;
  const leadTransit = input.toolBundle?.transitSnapshot?.transits?.[0];
  const panchang = input.toolBundle?.dailyPanchangSnapshot;
  const lines: string[] = [];

  if (predictive?.active_period_context?.active_chain?.length) {
    lines.push(
      `Current dasha chain is ${predictive.active_period_context.active_chain
        .map((planet) => titleCase(planet))
        .join(" -> ")}.`
    );
  }

  if (predictive?.timing_focus?.length) {
    lines.push(`Transit and timing focus today leans toward ${predictive.timing_focus.slice(0, 3).join(", ")}.`);
  }

  if (leadTransit) {
    lines.push(
      `Lead transit is ${titleCase(leadTransit.body)} in ${leadTransit.sign} (house ${leadTransit.house}), setting a ${leadTransit.intensity.toLowerCase()} timing tone.`
    );
  }

  if (panchang) {
    lines.push(
      `Panchang for ${panchang.asOfDate} in ${panchang.locationLabel} gives the day a ${panchang.dayFeel.toLowerCase()} / ${panchang.dailyQuality.toLowerCase()} tone.`
    );
    if (panchang.transitionWindows.supportiveWindows.length) {
      lines.push(
        `Supportive windows: ${panchang.transitionWindows.supportiveWindows.slice(0, 2).join(", ")}.`
      );
    }
    if (panchang.transitionWindows.cautionWindows.length) {
      lines.push(
        `Caution windows: ${panchang.transitionWindows.cautionWindows.slice(0, 2).join(", ")}.`
      );
    }
    lines.push("These windows are the day-level timing blocks already calculated in the Panchang snapshot.");
  }

  if (!lines.length) {
    return input.compact
      ? "Timing context is limited, so keep today practical and observation-led."
      : "Timing context is limited, so keep today practical, observation-led, and flexible rather than treating it as a fixed prediction.";
  }

  const output = input.compact ? lines.slice(0, 2) : lines.slice(0, 4);

  return `${output.join(" ")} Daily timing is a cue, not a guarantee.`;
}

function buildDailyPredictionWorkFocus(input: {
  domains: FormatterDomain[];
  compact: boolean;
}) {
  if (input.domains.includes("career") || input.domains.includes("business")) {
    return input.compact
      ? "Work focus: keep one priority task moving and avoid reactive changes."
      : "Work focus: keep one priority task moving, communicate clearly, and avoid reactive changes.";
  }

  if (input.domains.includes("education")) {
    return input.compact
      ? "Study focus: use a clean revision block and short practice session."
      : "Study focus: use a clean revision block, short practice session, and one clear learning goal.";
  }

  if (input.domains.includes("finance")) {
    return input.compact
      ? "Money focus: review spending and avoid impulsive commitments."
      : "Money focus: review spending, check documents, and avoid impulsive commitments.";
  }

  if (input.domains.includes("health")) {
    return input.compact
      ? "Energy focus: protect rest, hydration, and a steady pace."
      : "Energy focus: protect rest, hydration, and a steady pace instead of pushing hard all day.";
  }

  return input.compact
    ? "Keep one practical priority moving and avoid multitasking."
    : "Keep one practical priority moving, avoid multitasking, and finish the day with one review point.";
}

function buildDailyPredictionRelationshipFocus(input: {
  domains: FormatterDomain[];
  compact: boolean;
}) {
  if (input.domains.includes("marriage") || input.domains.includes("family")) {
    return input.compact
      ? "Relationship focus: keep communication calm and avoid forcing conclusions."
      : "Relationship focus: keep communication calm, listen first, and avoid forcing conclusions today.";
  }

  return input.compact
    ? "Keep communication steady and avoid emotional overreaction."
    : "Keep communication steady, avoid emotional overreaction, and leave space before reacting.";
}

function buildDailyPredictionMoneyCaution(input: {
  domains: FormatterDomain[];
  compact: boolean;
}) {
  if (input.domains.includes("finance") || input.domains.includes("business")) {
    return input.compact
      ? "Money caution: avoid new risk, rushed borrowing, and irreversible commitments."
      : "Money caution: avoid new risk, rushed borrowing, and irreversible commitments today.";
  }

  return input.compact
    ? "Keep spending modest and avoid sudden money decisions."
    : "Keep spending modest, avoid sudden money decisions, and review documents before signing anything.";
}

function buildDailyPredictionHealthBalance(input: {
  domains: FormatterDomain[];
  compact: boolean;
}) {
  if (input.domains.includes("health")) {
    return input.compact
      ? "Health balance: prioritize rest, hydration, and a calm routine."
      : "Health balance: prioritize rest, hydration, and a calm routine so energy stays steady.";
  }

  return input.compact
    ? "Protect energy with rest, water, and smaller task blocks."
    : "Protect energy with rest, water, smaller task blocks, and a calmer pace through the day.";
}

function buildDailyPredictionLuckyIndicators(input: {
  toolBundle?: AskChartFormatterToolBundle | null;
  compact: boolean;
}) {
  const dailyRashifal = input.toolBundle?.dailyRashifalSnapshot;
  const panchang = input.toolBundle?.dailyPanchangSnapshot;

  if (dailyRashifal) {
    return input.compact
      ? `Lucky Color: ${dailyRashifal.luckyColor}. Lucky Number: ${dailyRashifal.luckyNumber}. Lucky Time: ${dailyRashifal.luckyTime}. These are supportive indicators, not guarantees.`
      : `Personalized sign cue: ${dailyRashifal.signName} suggests ${dailyRashifal.shortPrediction}. Lucky Color: ${dailyRashifal.luckyColor}. Lucky Number: ${dailyRashifal.luckyNumber}. Lucky Time: ${dailyRashifal.luckyTime}. Treat these as supportive indicators, not guarantees.`;
  }

  if (panchang) {
    return input.compact
      ? "Lucky values are not available in this reply, so use the timing windows above instead."
      : "Lucky values are not available in this reply, so use the supportive and caution windows in the timing insight as your practical daily cue.";
  }

  return input.compact
    ? "Lucky values are not available, so keep to the core timing guidance."
    : "Lucky values are not available in this reply, so keep to the core timing guidance and avoid forcing certainty.";
}

function buildDailyPredictionOptionalSupport(question: string) {
  if (/\b(remedy|prayer|mantra|charity|gratitude|ritual|upay|upaya|spiritual)\b/i.test(question)) {
    return "Optional support: a short prayer, mantra, gratitude practice, or calm routine can help anchor the day, but it should stay optional and practical.";
  }

  return null;
}

function buildDailyPredictionSoftNextStep(input: {
  chartContext?: ChartAiContext | null;
  toolBundle?: AskChartFormatterToolBundle | null;
  planType: UserPlanType;
}) {
  if (!input.chartContext || !input.toolBundle?.predictiveAssistantContext) {
    return "Generate or refresh your Kundli first so daily timing can be read more clearly.";
  }

  if (!input.toolBundle?.dailyPanchangSnapshot) {
    return "Set your location and timezone for sharper daily windows, or ask tomorrow's guidance for a fresh check-in.";
  }

  if (input.planType === "FREE") {
    return "Ask one deeper daily follow-up for a more precise timing read, or return tomorrow for a fresh daily check-in.";
  }

  return "If this day includes an important decision, continue with Ask My Chart or a consultation for a more context-rich review.";
}

function buildRemedySummary(input: {
  summaryLines: string[];
  toolBundle?: AskChartFormatterToolBundle | null;
  compact: boolean;
}) {
  const lines = input.summaryLines.slice(0, input.compact ? 1 : 2);
  const firstRemedy = input.toolBundle?.approvedRemedies?.remedies?.[0];

  if (firstRemedy) {
    lines.unshift("This remedy guidance is optional and chart-grounded.");
  } else {
    lines.unshift("This is optional spiritual guidance rather than a required action.");
  }

  if (!input.compact && firstRemedy) {
    lines.push(
      "The approved remedy record is being kept grounded to the mapped chart signals rather than a general ritual claim."
    );
  }

  return lines.join(" ");
}

function buildRemedyWhySuggested(input: {
  chartContext?: ChartAiContext | null;
  toolBundle?: AskChartFormatterToolBundle | null;
  intents: RemedyFormatterIntent[];
  compact: boolean;
}) {
  const firstRemedy = input.toolBundle?.approvedRemedies?.remedies?.[0];
  const predictive = input.toolBundle?.predictiveAssistantContext;
  const panchang = input.toolBundle?.dailyPanchangSnapshot;
  const lines: string[] = [];

  if (firstRemedy) {
    lines.push(firstRemedy.whyThisRemedy.summary);
    lines.push(firstRemedy.whyThisRemedy.chartGrounding);
    lines.push(firstRemedy.whyThisRemedy.approvedRecordBasis);

    if (firstRemedy.cautionNote) {
      lines.push(firstRemedy.cautionNote);
    }
  }

  if (predictive?.active_period_context?.active_chain?.length) {
    lines.push(
      `Current dasha flow is ${predictive.active_period_context.active_chain
        .map((planet) => titleCase(planet))
        .join(" -> ")}, so the remedy is being read as timing support rather than a fixed outcome.`
    );
  }

  if (predictive?.supportive_factors?.length) {
    lines.push("Supportive timing factors favor a calmer, steadier remedy approach.");
  }

  if (predictive?.pressure_factors?.length) {
    lines.push("Pressure factors suggest keeping the remedy simple, measured, and non-fear-based.");
  }

  if (input.intents.includes("gemstone_rudraksha_yantra")) {
    lines.push("Because gemstone or yantra language is present, suitability should stay consultative and optional.");
  }

  if (input.intents.includes("mantra_prayer") || input.intents.includes("charity_daan")) {
    lines.push("The remedy leans toward simple spiritual support rather than a purchase-led solution.");
  }

  if (panchang) {
    const supportive = panchang.transitionWindows.supportiveWindows.slice(0, 2).join(", ");
    const caution = panchang.transitionWindows.cautionWindows.slice(0, 2).join(", ");

    if (supportive) {
      lines.push(`Supportive timing windows for ${panchang.locationLabel}: ${supportive}.`);
    }

    if (caution) {
      lines.push(`Caution windows for ${panchang.locationLabel}: ${caution}.`);
    }
  }

  if (!firstRemedy && input.chartContext) {
    lines.push(buildChartAnchorLine(input.chartContext));
  }

  if (!lines.length) {
    lines.push("The remedy guidance is general because detailed remedy context is limited in this reply.");
  }

  return listToBullets(
    lines.slice(0, input.compact ? 2 : 4),
    "The remedy is being suggested as a calm, chart-grounded support, not as a fixed guarantee."
  );
}

function buildRemedyPracticeSteps(input: {
  intents: RemedyFormatterIntent[];
  toolBundle?: AskChartFormatterToolBundle | null;
  compact: boolean;
}) {
  const firstRemedy = input.toolBundle?.approvedRemedies?.remedies?.[0];
  const actions: string[] = [];

  if (firstRemedy) {
    actions.push("Follow the approved remedy calmly and consistently instead of mixing several remedies at once.");
    actions.push(firstRemedy.productMapping.safety.standaloneRemedyNote);
  }

  if (input.intents.includes("mantra_prayer")) {
    actions.push("Keep mantra or prayer practice short, steady, and done at the same calm time each day.");
  }

  if (input.intents.includes("charity_daan")) {
    actions.push("Choose a modest, consistent act of charity rather than a large one-time gesture.");
  }

  if (input.intents.includes("fasting_discipline")) {
    actions.push("Use fasting only if it is safe and sustainable; discipline matters more than intensity.");
  }

  if (input.intents.includes("puja_guidance")) {
    actions.push("Keep puja or ritual guidance simple, respectful, and tied to steady intention.");
  }

  if (input.intents.includes("daily_spiritual_practice")) {
    actions.push("Support the remedy with a calm daily routine, gratitude, and one repeatable discipline.");
  }

  if (input.intents.includes("gemstone_rudraksha_yantra")) {
    actions.push("Do not buy or wear a gemstone, rudraksha, or yantra until suitability is reviewed by an expert.");
  }

  if (input.intents.includes("lifestyle_correction")) {
    actions.push("Pair spiritual support with practical correction in sleep, habits, and daily conduct.");
  }

  if (!actions.length) {
    actions.push("Keep the remedy simple, repeatable, and practical rather than trying many things at once.");
  }

  return listToBullets(actions.slice(0, input.compact ? 2 : 4), actions[0]);
}

function buildRemedyTimingDiscipline(input: {
  toolBundle?: AskChartFormatterToolBundle | null;
  compact: boolean;
}) {
  const predictive = input.toolBundle?.predictiveAssistantContext;
  const panchang = input.toolBundle?.dailyPanchangSnapshot;
  const lines: string[] = [];

  if (predictive?.active_period_context?.active_chain?.length) {
    lines.push(
      `The active dasha chain is ${predictive.active_period_context.active_chain
        .map((planet) => titleCase(planet))
        .join(" -> ")}, so steady discipline matters more than exact timing claims.`
    );
  }

  if (panchang) {
    const supportiveWindows = panchang.transitionWindows.supportiveWindows.slice(0, 2).join(", ");
    const cautionWindows = panchang.transitionWindows.cautionWindows.slice(0, 2).join(", ");
    const betterBlocks = panchang.transitionWindows.betterTimeBlocks.slice(0, 2).join(", ");
    const cautionBlocks = panchang.transitionWindows.cautionTimeBlocks.slice(0, 2).join(", ");

    lines.push(
      `For ${panchang.locationLabel}, favorable discipline windows include ${supportiveWindows || betterBlocks || "a steady daily time"}; caution windows include ${cautionWindows || cautionBlocks || "avoid rushing"}.`
    );
    lines.push("Treat these windows as practical rhythm cues, not as guaranteed outcome periods.");
  }

  if (!lines.length) {
    lines.push("Keep the remedy at a consistent calm time each day and avoid chasing exact timing promises.");
  }

  return lines.slice(0, input.compact ? 1 : 2).join(" ");
}

function buildRemedyCautionNote(input: {
  question: string;
  intents: RemedyFormatterIntent[];
  toolBundle?: AskChartFormatterToolBundle | null;
}) {
  const normalized = input.question.toLowerCase();
  const hasGemstoneFocus = input.intents.includes("gemstone_rudraksha_yantra");
  const hasHealthFocus = /\bhealth|medical|disease|illness|symptom|doctor|cure\b/i.test(normalized);
  const hasMoneyFocus = /\bfinance|money|income|wealth|invest|business|job|salary|loan|debt\b/i.test(
    normalized
  );
  const hasLegalFocus = /\blegal|law|tax|contract|compliance|agreement\b/i.test(normalized);
  const firstRemedy = input.toolBundle?.approvedRemedies?.remedies?.[0];
  const lines: string[] = ["Remedies are optional support, not a guarantee or a fear-based requirement."];

  if (hasGemstoneFocus) {
    lines.push("Gemstones, rudraksha, and yantra should only be considered after expert suitability review.");
  }

  if (firstRemedy?.productMapping?.safety?.nonGuaranteeNote) {
    lines.push(firstRemedy.productMapping.safety.nonGuaranteeNote);
  }

  if (firstRemedy?.productMapping?.safety?.noPressureNote) {
    lines.push(firstRemedy.productMapping.safety.noPressureNote);
  }

  if (hasHealthFocus) {
    lines.push("Spiritual support does not replace medical care or treatment advice.");
  }

  if (hasMoneyFocus) {
    lines.push("Spiritual support does not replace financial planning, budgeting, or qualified advice.");
  }

  if (hasLegalFocus) {
    lines.push("Spiritual support does not replace legal, tax, or compliance guidance from a qualified professional.");
  }

  return lines.join(" ");
}

function buildRemedyOptionalProductOrConsultationGuidance(input: {
  question: string;
  toolBundle?: AskChartFormatterToolBundle | null;
  intents: RemedyFormatterIntent[];
}) {
  const relatedProducts = input.toolBundle?.relatedProducts?.products ?? [];
  const consultationContext = input.toolBundle?.consultationContext;
  const firstRemedy = input.toolBundle?.approvedRemedies?.remedies?.[0];
  const normalized = input.question.toLowerCase();

  const productRelevant =
    input.intents.includes("gemstone_rudraksha_yantra") ||
    /\bgemstone|rudraksha|yantra|shop|product|buy|purchase\b/i.test(normalized);
  const consultationRelevant =
    input.intents.includes("consultation_shop") ||
    /\bconsult|consultation|expert|personalized|serious|review\b/i.test(normalized) ||
    (Boolean(consultationContext?.remedyPreparation?.topRecommendations?.length) &&
      input.intents.includes("gemstone_rudraksha_yantra")) ||
    Boolean(firstRemedy?.cautionNote && /\bconsult|review|expert|gemstone|rudraksha|yantra\b/i.test(firstRemedy.cautionNote));

  if (!productRelevant && !consultationRelevant) {
    return null;
  }

  const lines: string[] = [];

  if (productRelevant) {
    lines.push("If a product is tied to the approved remedy, review it as optional support only.");
    lines.push("Do not treat a shop item as required, and confirm suitability before using gemstones, rudraksha, or yantra.");
    if (relatedProducts.length) {
      lines.push("The related shop items are supportive references, not mandatory purchases.");
    }
  }

  if (consultationRelevant) {
    lines.push("For personalized or serious cases, a consultation is the safer way to confirm the right remedy path.");
  }

  return `Optional Product or Consultation Guidance:\n${lines.join(" ")}`;
}

function buildRemedySoftNextStep(input: {
  chartContext?: ChartAiContext | null;
  toolBundle?: AskChartFormatterToolBundle | null;
  planType: UserPlanType;
  intents: RemedyFormatterIntent[];
}) {
  if (!input.chartContext || !input.toolBundle?.predictiveAssistantContext) {
    return "Generate or refresh your Kundli first so remedy suitability can be read more clearly.";
  }

  if (input.intents.includes("gemstone_rudraksha_yantra") || input.intents.includes("consultation_shop")) {
    return "If the remedy involves a product, continue with consultation or review the related shop details as optional support only.";
  }

  if (input.planType !== "FREE") {
    return "If you want deeper continuity, ask one focused remedy follow-up or book consultation for a more personalized review.";
  }

  return "Ask one deeper remedy follow-up if you want a more personalized chart-grounded path.";
}

function buildRelationshipTimingInsight(input: {
  toolBundle?: AskChartFormatterToolBundle | null;
  compact: boolean;
}) {
  const predictive = input.toolBundle?.predictiveAssistantContext;
  const activeChain = predictive?.active_period_context?.active_chain ?? [];
  const supportiveCount = predictive?.supportive_factors?.length ?? 0;
  const pressureCount = predictive?.pressure_factors?.length ?? 0;

  let tone = "Timing is mixed, so patience and clear communication matter more than rushing a conclusion.";

  if (supportiveCount >= pressureCount + 2) {
    tone = "Timing leans toward progress or formalization when communication stays steady.";
  } else if (pressureCount >= supportiveCount + 2) {
    tone = "Timing leans toward caution, healing, and slower pacing before final decisions.";
  } else if (pressureCount > 0) {
    tone = "Timing is active but mixed, so observe consistency before making a major commitment.";
  }

  const periodLine = activeChain.length
    ? `The active dasha chain is ${activeChain.map(titleCase).join(" -> ")}.`
    : "A clear dasha chain is not available in this reply.";
  const transitionLine = predictive?.active_period_context?.next_transition_level
    ? "A timing shift is approaching, so avoid forcing a final conclusion too early."
    : null;

  const parts = input.compact
    ? [tone, periodLine]
    : [periodLine, tone];

  if (transitionLine) {
    parts.push(transitionLine);
  }

  return parts.join(" ");
}

function buildPracticalGuidance(domains: FormatterDomain[]) {
  if (domains.includes("career")) {
    return "Prioritize one practical career decision this cycle and build consistency before expanding scope.";
  }

  if (domains.includes("marriage")) {
    return "Use calm communication and steady expectations; focus on clarity and timing rather than pressure.";
  }

  if (domains.includes("finance")) {
    return "Keep financial decisions disciplined, phased, and risk-aware; avoid impulsive commitments.";
  }

  if (domains.includes("health")) {
    return "Support your routine with sleep, stress pacing, and gentle spiritual discipline as optional grounding.";
  }

  if (domains.includes("education")) {
    return "Use a structured study rhythm and focus on repeatable daily effort over short bursts.";
  }

  if (domains.includes("business")) {
    return "Take measured business steps, validate assumptions, and avoid overstretching resources in one move.";
  }

  if (domains.includes("family")) {
    return "Keep family communication direct and patient; small consistent improvements will work better than forceful decisions.";
  }

  if (domains.includes("daily_guidance")) {
    return "Use this as practical daily guidance and keep actions steady, simple, and reviewable.";
  }

  return "Take one grounded next action, review outcomes calmly, and refine your next question with specifics.";
}

function buildSafetyNote(input: {
  domains: FormatterDomain[];
  question: string;
  confidence: AstrologyAssistantStructuredResponse["confidence"];
  intent?: AskMyChartIntent | null;
}) {
  const normalized = input.question.toLowerCase();

  if (
    input.domains.includes("health") ||
    /\bmedical|diagnos|treatment|disease|sick|unwell|fever|cough|dizzy|dizziness|nausea|vomit\b/i.test(normalized)
  ) {
    return "This is spiritual guidance, not medical advice. For health decisions, use qualified professional care.";
  }

  if (
    input.domains.includes("finance") ||
    /\binvestment|stocks|trading|sure profit\b/i.test(normalized)
  ) {
    return "This is not financial advice and does not guarantee outcomes. Use professional financial judgement for high-stakes decisions.";
  }

  if (
    input.domains.includes("business") ||
    /\bbusiness|startup|entrepreneur|entrepreneurship|venture|trade|commerce|client|customer|partnership|co[-\s]?founder|cofounder|side business|family business|export|import|retail|wholesale|distribution|launch|scale|scaling|expansion|foreign business\b/i.test(
      normalized
    )
  ) {
    return "This is business guidance, not legal, tax, funding, or investment advice. Use qualified professional judgement for contracts, compliance, and high-stakes financial decisions.";
  }

  if (input.domains.includes("marriage")) {
    if (/\babuse|violent|violence|coerc|unsafe|threat|control|harass\b/i.test(normalized)) {
      return "If the relationship involves abuse, coercion, or safety risk, prioritize trusted human, local, or professional support. Astrology should never be used to justify harm.";
    }

    return "Relationship timing is contextual; avoid deterministic conclusions from one factor alone. Keep decisions grounded in communication, consistency, and emotional safety.";
  }

  if (/\bself[-\s]?harm|suicid|hurt myself|hopeless|panic|depress|abuse|violent|violence|unsafe|emergency\b/i.test(normalized)) {
    return "If you are in immediate danger, thinking about self-harm, or overwhelmed by crisis, pause astrology and contact trusted immediate support or local emergency services right away.";
  }

  if (input.intent === "UNSUPPORTED") {
    return "This request was outside supported scope, so only safe chart-grounded guidance is provided.";
  }

  if (input.confidence === "low") {
    return "Confidence is currently low, so use this as tentative guidance and validate with deeper chart review.";
  }

  return null;
}

function buildNextStep(input: {
  domains: FormatterDomain[];
  planType: UserPlanType;
  toolBundle?: AskChartFormatterToolBundle | null;
}) {
  if (
    input.domains.some((domain) =>
      ["career", "marriage", "finance", "health", "business"].includes(domain)
    )
  ) {
    return "If you want deeper continuity, continue with a focused follow-up question or a full report.";
  }

  if (!input.toolBundle?.predictiveAssistantContext) {
    return "Generate or refresh your Kundli context first for stronger timing depth in the next question.";
  }

  if (input.planType === "FREE") {
    return "Ask one deeper follow-up question focused on one life area for a more precise chart-grounded answer.";
  }

  return "If needed, continue with a deeper Ask My Chart follow-up or consultation for high-context decisions.";
}

function listToBullets(items: string[], fallback: string) {
  const cleaned = items.map((item) => normalizeWhitespace(item)).filter(Boolean);

  if (!cleaned.length) {
    return fallback;
  }

  return cleaned.slice(0, 3).map((item) => `- ${item}`).join("\n");
}

function getHouseOccupants(chartContext: ChartAiContext | null | undefined, house: number) {
  const placement = chartContext?.housePlacements.find((entry) => entry.house === house);

  return placement?.occupants ?? [];
}

function buildCareerTendency(input: {
  chartContext?: ChartAiContext | null;
  toolBundle?: AskChartFormatterToolBundle | null;
  intents: CareerFormatterIntent[];
}) {
  const dominantHouses = input.toolBundle?.predictiveAssistantContext?.dominant_houses ?? [];
  const dominantSet = new Set<number>(dominantHouses);
  const serviceScore = Number(dominantSet.has(6)) + Number(dominantSet.has(10));
  const businessScore = Number(dominantSet.has(7)) + Number(dominantSet.has(11));
  const leadershipScore =
    Number(dominantSet.has(10)) + Number(dominantSet.has(5)) + Number(dominantSet.has(9));

  if (input.intents.includes("business") && businessScore >= serviceScore) {
    return "Business or partnership-oriented work has stronger support now, provided decisions stay measured and risk-aware.";
  }

  if (input.intents.includes("job_service") && serviceScore >= businessScore) {
    return "Service and job-structured roles are currently more supported than speculative independent expansion.";
  }

  if (businessScore > serviceScore + 1) {
    return "Independent, client-facing, or partnership-led work looks relatively stronger than rigid service roles in this period.";
  }

  if (serviceScore > businessScore + 1) {
    return "Disciplined service or structured job pathways look stronger than high-uncertainty business moves right now.";
  }

  const hasTenthOccupants = getHouseOccupants(input.chartContext, 10).length > 0;
  const hasSeventhOccupants = getHouseOccupants(input.chartContext, 7).length > 0;

  if (leadershipScore >= 2 && hasTenthOccupants) {
    return "The pattern supports gradual leadership and responsibility-building, with results improving through consistency and visibility.";
  }

  if (hasSeventhOccupants && businessScore > 0) {
    return "A mixed tendency is visible: job stability can coexist with selective business/partnership opportunities.";
  }

  return "The chart context currently favors a balanced approach: stable role execution with selective exploration of growth opportunities.";
}

function buildCareerTimingInsight(input: {
  toolBundle?: AskChartFormatterToolBundle | null;
  compact: boolean;
}) {
  const predictive = input.toolBundle?.predictiveAssistantContext;
  const supportiveCount = predictive?.supportive_factors?.length ?? 0;
  const pressureCount = predictive?.pressure_factors?.length ?? 0;
  const baseTiming = buildTimingInsight({ toolBundle: input.toolBundle });

  let tone = "This period supports steady effort with disciplined planning.";

  if (supportiveCount >= pressureCount + 2) {
    tone = "Current timing leans toward growth and opportunity when actions stay structured.";
  } else if (pressureCount >= supportiveCount + 2) {
    tone = "Current timing asks for discipline, pacing, and careful decision-making before large transitions.";
  } else if (pressureCount > 0) {
    tone = "Current timing is mixed; progress is possible with consistency and careful prioritization.";
  }

  if (input.compact) {
    return `${tone} ${baseTiming}`;
  }

  return `${baseTiming} ${tone}`;
}

function buildCareerGrowthOpportunities(input: {
  chartContext?: ChartAiContext | null;
  toolBundle?: AskChartFormatterToolBundle | null;
  intents: CareerFormatterIntent[];
  compact: boolean;
}) {
  const items: string[] = [];
  const predictive = input.toolBundle?.predictiveAssistantContext;
  const dominantHouses = predictive?.dominant_houses ?? [];
  const hasHouse = (value: number) => dominantHouses.includes(value);

  if (hasHouse(10)) {
    items.push("Career visibility and responsibility-building can improve through consistent delivery.");
  }

  if (hasHouse(11)) {
    items.push("Network quality and collaborative alliances can open useful growth channels.");
  }

  if (hasHouse(5) || input.intents.includes("study_to_career")) {
    items.push("Skill-building, creativity, and learning depth can materially improve outcomes.");
  }

  if (hasHouse(2)) {
    items.push("Communication clarity and value-driven decisions can strengthen income progression.");
  }

  if (hasHouse(9)) {
    items.push("Mentor guidance, structured learning, and ethical alignment can accelerate professional maturity.");
  }

  if (hasHouse(6)) {
    items.push("Routine discipline, process quality, and consistency are key leverage points now.");
  }

  if (!items.length && predictive?.supportive_factors?.length) {
    items.push(...predictive.supportive_factors.slice(0, 2));
  }

  if (input.compact) {
    return listToBullets(items.slice(0, 2), "Build momentum through one key skill upgrade and one consistent weekly execution goal.");
  }

  return listToBullets(items, "Growth looks most practical through skill focus, communication quality, and sustained effort.");
}

function buildCareerCautionAreas(input: {
  domains: FormatterDomain[];
  intents: CareerFormatterIntent[];
  confidence: AstrologyAssistantStructuredResponse["confidence"];
  toolBundle?: AskChartFormatterToolBundle | null;
  compact: boolean;
}) {
  const cautionItems: string[] = [];
  const predictive = input.toolBundle?.predictiveAssistantContext;

  if (predictive?.pressure_factors?.length) {
    cautionItems.push(...predictive.pressure_factors.slice(0, input.compact ? 1 : 2));
  }

  if (input.domains.includes("finance") || input.intents.includes("income_gains")) {
    cautionItems.push("Avoid over-risking money decisions based on short-term confidence spikes.");
  }

  if (input.intents.includes("business") || input.intents.includes("job_change")) {
    cautionItems.push("Take transitions in phases instead of abrupt all-in moves.");
  }

  if (input.intents.includes("obstacles_work_pressure")) {
    cautionItems.push("Manage workload pressure with clear priorities to prevent reactive decisions.");
  }

  if (input.confidence === "low") {
    cautionItems.push("Context confidence is limited, so treat this as directional guidance rather than a fixed outcome.");
  }

  return listToBullets(
    cautionItems,
    "No major caution signal is dominant, but avoid impulsive decisions and keep execution steady."
  );
}

function buildCareerPracticalGuidance(input: {
  intents: CareerFormatterIntent[];
  compact: boolean;
}) {
  const actions: string[] = [];

  if (input.intents.includes("job_service") || input.intents.includes("career_growth")) {
    actions.push("Prioritize one role-critical skill and track weekly improvement with measurable outcomes.");
  }

  if (input.intents.includes("promotion") || input.intents.includes("professional_reputation")) {
    actions.push("Improve visibility through reliable delivery, clearer stakeholder communication, and ownership of key tasks.");
  }

  if (input.intents.includes("job_change")) {
    actions.push("Prepare transition readiness first: resume quality, interview preparation, and timing discipline.");
  }

  if (input.intents.includes("business")) {
    actions.push("Use phased business planning with conservative cash-flow decisions and realistic timelines.");
  }

  if (input.intents.includes("study_to_career")) {
    actions.push("Choose learning pathways that map directly to target roles and build portfolio-level proof.");
  }

  if (input.intents.includes("income_gains")) {
    actions.push("Strengthen income progression through communication quality, negotiation readiness, and network leverage.");
  }

  if (!actions.length) {
    actions.push(
      "Focus on disciplined daily execution, communication clarity, and practical networking before expanding scope."
    );
  }

  return listToBullets(actions.slice(0, input.compact ? 2 : 3), actions[0] ?? "Stay disciplined and practical in career planning.");
}

function buildCareerSoftNextStep(input: {
  chartContext?: ChartAiContext | null;
  toolBundle?: AskChartFormatterToolBundle | null;
  planType: UserPlanType;
  intents: CareerFormatterIntent[];
}) {
  if (!input.chartContext || !input.toolBundle?.predictiveAssistantContext) {
    return "Generate or refresh your Kundli first so career timing and house context can be read more clearly.";
  }

  if (
    input.intents.includes("job_change") ||
    input.intents.includes("promotion") ||
    input.intents.includes("business") ||
    input.intents.includes("professional_reputation")
  ) {
    return "If you want deeper continuity, view a Career Report or ask one focused follow-up career question.";
  }

  if (input.planType !== "FREE" && input.intents.includes("obstacles_work_pressure")) {
    return "For high-stakes decisions, use one deeper career question or book consultation for context-rich review.";
  }

  if (input.planType === "FREE") {
    return "Ask one deeper career follow-up focused on a single decision for sharper chart-grounded guidance.";
  }

  return null;
}

function buildBusinessTendency(input: {
  chartContext?: ChartAiContext | null;
  toolBundle?: AskChartFormatterToolBundle | null;
  intents: BusinessFormatterIntent[];
}) {
  const dominantHouses = input.toolBundle?.predictiveAssistantContext?.dominant_houses ?? [];
  const dominantSet = new Set<number>(dominantHouses);
  const businessScore =
    Number(dominantSet.has(7)) +
    Number(dominantSet.has(10)) +
    Number(dominantSet.has(11));
  const supportScore =
    Number(dominantSet.has(2)) +
    Number(dominantSet.has(3)) +
    Number(dominantSet.has(5)) +
    Number(dominantSet.has(9));
  const cautionScore =
    Number(dominantSet.has(6)) + Number(dominantSet.has(8)) + Number(dominantSet.has(12));
  const hasTenthOccupants = getHouseOccupants(input.chartContext, 10).length > 0;
  const hasSeventhOccupants = getHouseOccupants(input.chartContext, 7).length > 0;

  if (input.intents.includes("job_vs_business") && businessScore >= supportScore) {
    return "Business or partnership-led work has clearer support than forcing a rigid service-only path right now.";
  }

  if (input.intents.includes("business_suitability") && supportScore > cautionScore) {
    return "The chart pattern supports business effort, but it works best with planning, patience, and measured execution.";
  }

  if (input.intents.includes("startup")) {
    return "A startup approach is possible, but it should begin with testing, small steps, and realistic cash-flow planning.";
  }

  if (input.intents.includes("partnership")) {
    return "Partnerships can work if roles, expectations, and accountability are clear from the start.";
  }

  if (businessScore > supportScore + 1) {
    return "Client-facing, entrepreneurial, or trade-oriented work appears better supported than passive execution alone.";
  }

  if (supportScore > businessScore + 1) {
    return "Steady preparation, skill-building, and relationship-building matter more than pushing a large business move immediately.";
  }

  if (hasSeventhOccupants && businessScore > 0) {
    return "A mixed pattern is visible: business can work, but partnership choices need careful filtering.";
  }

  if (hasTenthOccupants) {
    return "The chart supports business growth through responsibility, visible delivery, and structured decision-making.";
  }

  return "The chart suggests a balanced business approach: practical planning, selective risk, and steady execution over quick leaps.";
}

function buildBusinessTimingInsight(input: {
  toolBundle?: AskChartFormatterToolBundle | null;
  compact: boolean;
}) {
  const predictive = input.toolBundle?.predictiveAssistantContext;
  const supportiveCount = predictive?.supportive_factors?.length ?? 0;
  const pressureCount = predictive?.pressure_factors?.length ?? 0;
  const baseTiming = buildTimingInsight({ toolBundle: input.toolBundle });

  let tone = "This timing supports careful planning before large business commitments.";

  if (supportiveCount >= pressureCount + 2) {
    tone = "Current timing leans toward growth if the plan stays disciplined and gradual.";
  } else if (pressureCount >= supportiveCount + 2) {
    tone = "Current timing asks for caution, cash-flow control, and phased execution.";
  } else if (pressureCount > 0) {
    tone = "Current timing is mixed, so testing ideas before scaling is the prudent path.";
  }

  if (input.compact) {
    return `${tone} ${baseTiming}`;
  }

  return `${baseTiming} ${tone}`;
}

function buildBusinessGrowthOpportunities(input: {
  chartContext?: ChartAiContext | null;
  toolBundle?: AskChartFormatterToolBundle | null;
  intents: BusinessFormatterIntent[];
  compact: boolean;
}) {
  const items: string[] = [];
  const predictive = input.toolBundle?.predictiveAssistantContext;
  const dominantHouses = predictive?.dominant_houses ?? [];
  const hasHouse = (value: number) => dominantHouses.includes(value);

  if (hasHouse(10)) {
    items.push("Clear delivery and visible responsibility can improve business credibility.");
  }

  if (hasHouse(11)) {
    items.push("Networks, referrals, and client expansion can become important growth levers.");
  }

  if (hasHouse(3)) {
    items.push("Sales, communication, and initiative can materially strengthen results.");
  }

  if (hasHouse(2)) {
    items.push("Capital discipline and value-based pricing can stabilize income flow.");
  }

  if (hasHouse(9)) {
    items.push("Mentor guidance and ethical decisions can improve business maturity.");
  }

  if (hasHouse(5) || input.intents.includes("startup")) {
    items.push("Strategy, innovation, and testing ideas can support early-stage growth.");
  }

  if (!items.length && predictive?.supportive_factors?.length) {
    items.push(...predictive.supportive_factors.slice(0, 2));
  }

  if (input.compact) {
    return listToBullets(
      items.slice(0, 2),
      "Build momentum through communication, clear positioning, and consistent customer trust."
    );
  }

  return listToBullets(
    items,
    "Growth looks most practical through customer trust, disciplined execution, and measured scaling."
  );
}

function buildBusinessRiskAreas(input: {
  domains: FormatterDomain[];
  intents: BusinessFormatterIntent[];
  confidence: AstrologyAssistantStructuredResponse["confidence"];
  toolBundle?: AskChartFormatterToolBundle | null;
  compact: boolean;
}) {
  const cautionItems: string[] = [];
  const predictive = input.toolBundle?.predictiveAssistantContext;

  if (predictive?.pressure_factors?.length) {
    cautionItems.push(...predictive.pressure_factors.slice(0, input.compact ? 1 : 2));
  }

  if (input.intents.includes("investment_risk") || input.domains.includes("finance")) {
    cautionItems.push("Avoid committing capital too quickly without validating demand and repayment capacity.");
  }

  if (input.intents.includes("partnership")) {
    cautionItems.push("Unclear roles or trust issues in partnerships can create avoidable strain.");
  }

  if (input.intents.includes("legal_tax")) {
    cautionItems.push("Legal, contract, and tax questions need qualified professional review rather than astrology alone.");
  }

  if (input.intents.includes("debt_loan_pressure")) {
    cautionItems.push("Debt pressure needs conservative planning and clear cash-flow review.");
  }

  if (input.intents.includes("expansion")) {
    cautionItems.push("Overexpansion can strain execution if systems are not stable yet.");
  }

  if (input.intents.includes("foreign_business")) {
    cautionItems.push("Cross-border business may need extra attention to compliance, costs, and timing.");
  }

  if (input.confidence === "low") {
    cautionItems.push("Context confidence is limited, so treat this as directional guidance rather than a fixed outcome.");
  }

  return listToBullets(
    cautionItems,
    "No single failure signal dominates, but keep risk measured and avoid rushed commitments."
  );
}

function buildBusinessPracticalGuidance(input: {
  intents: BusinessFormatterIntent[];
  compact: boolean;
}) {
  const actions: string[] = [];

  if (input.intents.includes("startup") || input.intents.includes("business_suitability")) {
    actions.push("Start small, test real demand, and validate the model before bigger investment.");
  }

  if (input.intents.includes("partnership")) {
    actions.push("Write roles, expectations, and accountability clearly before committing to a partnership.");
  }

  if (input.intents.includes("client_growth") || input.intents.includes("trade_commerce")) {
    actions.push("Strengthen customer trust through reliability, communication, and consistent delivery.");
  }

  if (input.intents.includes("expansion")) {
    actions.push("Scale only after cash flow, operations, and customer retention are stable.");
  }

  if (input.intents.includes("debt_loan_pressure")) {
    actions.push("Review repayment capacity carefully before taking on new debt.");
  }

  if (input.intents.includes("foreign_business")) {
    actions.push("Check compliance, logistics, and local-market fit before cross-border expansion.");
  }

  if (input.intents.includes("legal_tax")) {
    actions.push("Review contracts, compliance, and tax details with a qualified professional before acting.");
  }

  if (input.intents.includes("business_remedy")) {
    actions.push("Treat remedies as optional support, not as a replacement for planning and execution.");
  }

  if (!actions.length) {
    actions.push("Keep accounts clear, plan conservatively, and let evidence from the market guide the next move.");
  }

  return listToBullets(actions.slice(0, input.compact ? 2 : 4), actions[0]);
}

function buildBusinessOptionalSupport(question: string, intents: BusinessFormatterIntent[]) {
  if (
    intents.includes("business_remedy") ||
    /\b(remedy|mantra|prayer|business upay|upaya|ritual|charity)\b/i.test(question)
  ) {
    return "Optional support: discipline, prayer, mantra practice, charity, gratitude, and honest accounting can support a business mindset. Keep it optional and practical.";
  }

  return null;
}

function buildBusinessSoftNextStep(input: {
  chartContext?: ChartAiContext | null;
  toolBundle?: AskChartFormatterToolBundle | null;
  planType: UserPlanType;
  intents: BusinessFormatterIntent[];
}) {
  if (!input.chartContext || !input.toolBundle?.predictiveAssistantContext) {
    return "Generate or refresh your Kundli first so business timing and partnership context can be read more clearly.";
  }

  if (
    input.intents.includes("business_suitability") ||
    input.intents.includes("job_vs_business") ||
    input.intents.includes("startup") ||
    input.intents.includes("partnership") ||
    input.intents.includes("expansion")
  ) {
    return "If you want deeper continuity, view a Business, Career, or Finance Report, or ask one focused follow-up question.";
  }

  if (input.planType !== "FREE" && input.intents.includes("investment_risk")) {
    return "For high-stakes business decisions, use one deeper business question or book consultation for context-rich review.";
  }

  return "Ask one deeper business question if you want more specific timing and strategy guidance.";
}

function buildRelationshipTendency(input: {
  chartContext?: ChartAiContext | null;
  toolBundle?: AskChartFormatterToolBundle | null;
  intents: RelationshipFormatterIntent[];
}) {
  const predictive = input.toolBundle?.predictiveAssistantContext;
  const dominantHouses = new Set<number>(predictive?.dominant_houses ?? []);
  const summaryFacts = input.toolBundle?.chartSummaryFacts;
  const venus = input.chartContext?.rashiPlacements.find((entry) => entry.body === "VENUS");
  const moon = input.chartContext?.rashiPlacements.find((entry) => entry.body === "MOON");
  const jupiter = input.chartContext?.rashiPlacements.find((entry) => entry.body === "JUPITER");
  const keySignals: string[] = [];

  if (summaryFacts?.matchingPlacements?.length) {
    const relationshipPlacements = summaryFacts.matchingPlacements
      .filter((placement) => ["VENUS", "MOON", "JUPITER", "MARS"].includes(placement.body))
      .slice(0, 2)
      .map((placement) => `${titleCase(placement.body)} in ${placement.sign}`);

    if (relationshipPlacements.length) {
      keySignals.push(`Relevant compatibility cues include ${relationshipPlacements.join(" and ")}.`);
    } else {
      keySignals.push("The answer is grounded in the chart matches already linked to this relationship question.");
    }
  } else if (summaryFacts?.narrative) {
    keySignals.push(summaryFacts.narrative);
  }

  if (dominantHouses.has(7) || venus || moon || jupiter) {
    keySignals.push("Partnership, emotional tone, and mutual respect are central to the reading.");
  }

  if (dominantHouses.has(2) || dominantHouses.has(4)) {
    keySignals.push("Family alignment and emotional comfort matter as much as attraction.");
  }

  if (dominantHouses.has(5) || dominantHouses.has(11)) {
    keySignals.push("Romance, communication, and supportive social context can strengthen harmony.");
  }

  if (dominantHouses.has(8)) {
    keySignals.push("The relationship pattern is sensitive, so trust and timing need careful handling.");
  }

  if (!keySignals.length) {
    keySignals.push("The current chart pattern suggests a relationship read that should stay calm, practical, and non-deterministic.");
  }

  return keySignals.join(" ");
}

function buildRelationshipCompatibilityHarmony(input: {
  toolBundle?: AskChartFormatterToolBundle | null;
  intents: RelationshipFormatterIntent[];
  compact: boolean;
}) {
  const predictive = input.toolBundle?.predictiveAssistantContext;
  const matchingHouses = input.toolBundle?.chartSummaryFacts?.matchingHouses ?? [];
  const harmonyItems: string[] = [];

  if (predictive?.supportive_factors?.length) {
    harmonyItems.push("Supportive timing is present, so the relationship can improve through patient effort.");
  }

  if (matchingHouses.length) {
    const relevantHouses = matchingHouses
      .map((house) => house.house)
      .filter((house) => [7, 2, 4, 5, 8, 11].includes(house));

    if (relevantHouses.length) {
      harmonyItems.push("The current compatibility context is centered on partnership, family, romance, and emotional steadiness rather than a yes/no verdict.");
    }
  }

  if (input.intents.includes("compatibility")) {
    harmonyItems.push("Mutual respect, communication, and family alignment are the main points to compare gently.");
  }

  if (input.intents.includes("love_vs_arranged")) {
    harmonyItems.push("Whether the path is love or arranged, consistency and emotional maturity matter more than pressure.");
  }

  if (input.intents.includes("second_marriage")) {
    harmonyItems.push("For remarriage questions, clarity, trust, and timing discipline are more important than rushing a conclusion.");
  }

  if (input.compact) {
    return listToBullets(
      harmonyItems.slice(0, 2),
      "Compatibility should be read through emotional steadiness, communication, and family alignment."
    );
  }

  return listToBullets(
    harmonyItems,
    "Compatibility should be read through emotional steadiness, communication, and family alignment."
  );
}

function buildRelationshipCautionAreas(input: {
  domains: FormatterDomain[];
  intents: RelationshipFormatterIntent[];
  confidence: AstrologyAssistantStructuredResponse["confidence"];
  toolBundle?: AskChartFormatterToolBundle | null;
  compact: boolean;
  question: string;
}) {
  const cautionItems: string[] = [];
  const predictive = input.toolBundle?.predictiveAssistantContext;
  const normalized = input.question.toLowerCase();

  if (predictive?.pressure_factors?.length) {
    cautionItems.push(...predictive.pressure_factors.slice(0, input.compact ? 1 : 2));
  }

  if (input.intents.includes("marriage_delay") || input.intents.includes("marriage_timing")) {
    cautionItems.push("Avoid turning timing pressure into fear; relationship progress often needs patience and clear signals.");
  }

  if (input.intents.includes("conflict_caution") || input.intents.includes("breakup_divorce_fear")) {
    cautionItems.push("Do not use one factor to predict breakup or divorce; look for consistency, communication, and repeated behavior.");
  }

  if (input.domains.includes("marriage")) {
    cautionItems.push("Family pressure or emotional urgency should not replace mutual readiness and clarity.");
  }

  if (/\babuse|violent|violence|coerc|unsafe|threat|control|harass\b/i.test(normalized)) {
    cautionItems.push("If the situation feels unsafe or coercive, prioritize trusted human, local, or professional support.");
  }

  if (input.confidence === "low") {
    cautionItems.push("Context confidence is limited, so treat this as directional guidance rather than a fixed outcome.");
  }

  return listToBullets(
    cautionItems,
    "No major caution signal is dominant, but avoid rushing, coercion, or fear-based conclusions."
  );
}

function buildRelationshipPracticalGuidance(input: {
  intents: RelationshipFormatterIntent[];
  compact: boolean;
}) {
  const actions: string[] = [];

  actions.push("Communicate clearly and observe consistency before making a major commitment.");

  if (input.intents.includes("compatibility")) {
    actions.push("Review values, family alignment, and emotional maturity together rather than focusing only on attraction.");
  }

  if (input.intents.includes("marriage_timing") || input.intents.includes("relationship_stability")) {
    actions.push("Move with patience and let timing confirm stability before formalizing decisions.");
  }

  if (input.intents.includes("family_involvement")) {
    actions.push("Bring family into the process at the right stage so pressure does not replace clarity.");
  }

  if (input.intents.includes("love_vs_arranged")) {
    actions.push("Whether love or arranged, keep expectations realistic and check for mutual readiness.");
  }

  if (input.intents.includes("second_marriage")) {
    actions.push("For remarriage, prioritize trust rebuilding, emotional maturity, and clear boundaries.");
  }

  return listToBullets(actions.slice(0, input.compact ? 2 : 3), actions[0]);
}

function buildRelationshipOptionalRemedy(question: string) {
  const normalized = question.toLowerCase();

  if (!/\bremedy|upaya|mantra|prayer|ritual|solution|what should i do\b/i.test(normalized)) {
    return null;
  }

  return "Optional Remedy / Spiritual Support:\nIf helpful, keep it simple: a short prayer, mantra practice, Friday or Thursday devotion, or a calm communication ritual. Treat it as support, not a guarantee.";
}

function buildRelationshipSoftNextStep(input: {
  chartContext?: ChartAiContext | null;
  toolBundle?: AskChartFormatterToolBundle | null;
  planType: UserPlanType;
  intents: RelationshipFormatterIntent[];
}) {
  if (!input.chartContext || !input.toolBundle?.predictiveAssistantContext) {
    return "Generate or refresh your Kundli first so relationship timing and partnership context can be read more clearly.";
  }

  if (
    input.intents.includes("compatibility") ||
    input.intents.includes("marriage_timing") ||
    input.intents.includes("partner_nature") ||
    input.intents.includes("love_vs_arranged") ||
    input.intents.includes("second_marriage")
  ) {
    return "If you want deeper continuity, check Compatibility, view the Compatibility Report, or ask one focused relationship follow-up question.";
  }

  if (input.planType !== "FREE") {
    return "For major decisions, continue with a focused relationship follow-up or book consultation for a context-rich review.";
  }

  return "Ask one deeper relationship follow-up focused on a single decision for sharper chart-grounded guidance.";
}

function buildFinanceTendency(input: {
  chartContext?: ChartAiContext | null;
  toolBundle?: AskChartFormatterToolBundle | null;
  intents: FinanceFormatterIntent[];
}) {
  const predictive = input.toolBundle?.predictiveAssistantContext;
  const dominantHouses = new Set<number>(predictive?.dominant_houses ?? []);
  const summaryFacts = input.toolBundle?.chartSummaryFacts;
  const chartPlacements = input.chartContext?.rashiPlacements ?? [];
  const financeSignals: string[] = [];

  const incomeScore =
    Number(dominantHouses.has(2)) +
    Number(dominantHouses.has(10)) +
    Number(dominantHouses.has(11));
  const cautionScore =
    Number(dominantHouses.has(6)) +
    Number(dominantHouses.has(8)) +
    Number(dominantHouses.has(12));

  if (summaryFacts?.matchingPlacements?.length) {
    const moneyPlacements = summaryFacts.matchingPlacements
      .filter((placement) => ["JUPITER", "VENUS", "SATURN", "MERCURY"].includes(placement.body))
      .slice(0, 2)
      .map((placement) => `${titleCase(placement.body)} in ${placement.sign}`);

    if (moneyPlacements.length) {
      financeSignals.push(`Relevant money cues include ${moneyPlacements.join(" and ")}.`);
    }
  } else {
    const directPlacements = chartPlacements
      .filter((placement) => ["JUPITER", "VENUS", "SATURN", "MERCURY"].includes(placement.body))
      .slice(0, 2)
      .map((placement) => `${titleCase(placement.body)} in ${placement.sign}`);

    if (directPlacements.length) {
      financeSignals.push(`Relevant money cues include ${directPlacements.join(" and ")}.`);
    }
  }

  if (incomeScore > cautionScore + 1) {
    financeSignals.push("Income and accumulation can improve through steady execution and disciplined planning.");
  } else if (cautionScore > incomeScore + 1) {
    financeSignals.push("The chart leans toward caution, so expense control and conservative pacing matter more now.");
  } else {
    financeSignals.push("Financial outcomes look mixed, so stability and careful review are stronger than quick moves.");
  }

  if (input.intents.includes("investment_risk")) {
    financeSignals.push("Speculative risk should stay secondary to verified calculations and risk control.");
  }

  if (input.intents.includes("debt") || input.intents.includes("expenses")) {
    financeSignals.push("Debt and expense pressure should be handled with documented repayment and budget discipline.");
  }

  if (input.intents.includes("business_profit")) {
    financeSignals.push("Business profit is better read as a trend and cash-flow rhythm, not a guaranteed result.");
  }

  return listToBullets(
    financeSignals.slice(0, 3),
    "Money decisions are best handled through discipline, review, and steady accumulation rather than speed."
  );
}

function buildFinanceTimingInsight(input: {
  toolBundle?: AskChartFormatterToolBundle | null;
  compact: boolean;
}) {
  const predictive = input.toolBundle?.predictiveAssistantContext;
  const supportiveCount = predictive?.supportive_factors?.length ?? 0;
  const pressureCount = predictive?.pressure_factors?.length ?? 0;
  const baseTiming = buildTimingInsight({ toolBundle: input.toolBundle });

  let tone = "Timing is mixed, so budget discipline and careful pacing matter more than fast commitments.";

  if (supportiveCount >= pressureCount + 2) {
    tone = "Timing leans toward gradual financial growth when planning stays disciplined and realistic.";
  } else if (pressureCount >= supportiveCount + 2) {
    tone = "Timing leans toward caution, expense control, and conservative money handling.";
  } else if (pressureCount > 0) {
    tone = "Timing is active but mixed, so review money steps carefully before making larger commitments.";
  }

  return input.compact ? `${tone} ${baseTiming}` : `${baseTiming} ${tone}`;
}

function buildFinanceGrowthOpportunities(input: {
  chartContext?: ChartAiContext | null;
  toolBundle?: AskChartFormatterToolBundle | null;
  intents: FinanceFormatterIntent[];
  compact: boolean;
}) {
  const items: string[] = [];
  const predictive = input.toolBundle?.predictiveAssistantContext;
  const dominantHouses = new Set<number>(predictive?.dominant_houses ?? []);
  const housePlacements = input.chartContext?.housePlacements ?? [];
  const hasHouse = (value: number) => dominantHouses.has(value);

  if (hasHouse(2)) {
    items.push("Income stability can improve through value-driven communication and careful resource management.");
  }

  if (hasHouse(11)) {
    items.push("Network support and long-range goals can strengthen gains when efforts remain consistent.");
  }

  if (housePlacements.some((house) => house.house === 2 || house.house === 11)) {
    items.push("Resource management and gains planning are supported by the visible house structure in the chart.");
  }

  if (hasHouse(10)) {
    items.push("Professional responsibility can translate into stronger earning capacity over time.");
  }

  if (hasHouse(5) || input.intents.includes("investment_risk")) {
    items.push("Planning, analysis, and informed decision-making are stronger than impulse-driven risk.");
  }

  if (hasHouse(6) || input.intents.includes("debt")) {
    items.push("Debt handling improves through process discipline, repayment planning, and clear documentation.");
  }

  if (hasHouse(9)) {
    items.push("Guidance from mentors or experienced advisors can improve money decisions.");
  }

  if (!items.length && predictive?.supportive_factors?.length) {
    items.push(...predictive.supportive_factors.slice(0, 2));
  }

  return listToBullets(
    items.slice(0, input.compact ? 2 : 3),
    "Steady income growth is more likely to come from patience, planning, and disciplined execution."
  );
}

function buildFinanceRiskCautionAreas(input: {
  domains: FormatterDomain[];
  intents: FinanceFormatterIntent[];
  confidence: AstrologyAssistantStructuredResponse["confidence"];
  toolBundle?: AskChartFormatterToolBundle | null;
  compact: boolean;
  question: string;
}) {
  const cautionItems: string[] = [];
  const predictive = input.toolBundle?.predictiveAssistantContext;
  const normalized = input.question.toLowerCase();

  if (predictive?.pressure_factors?.length) {
    cautionItems.push(...predictive.pressure_factors.slice(0, input.compact ? 1 : 2));
  }

  if (input.domains.includes("finance")) {
    cautionItems.push("Keep financial decisions grounded in documented facts rather than urgency.");
  }

  if (input.intents.includes("investment_risk")) {
    cautionItems.push("This is not investment advice, and high-risk moves should be reviewed with a qualified financial advisor.");
  }

  if (input.intents.includes("debt")) {
    cautionItems.push("New borrowing should be checked against repayment ability and documented terms.");
  }

  if (input.intents.includes("business_profit")) {
    cautionItems.push("Profit assumptions should stay conservative until cash flow is verified.");
  }

  if (input.intents.includes("sudden_gain_loss")) {
    cautionItems.push("Sudden gain or loss signals should be treated as directional, not guaranteed outcomes.");
  }

  if (/\bgamble|lottery|bet|betting|speculat(e|ion)|crypto|stock tip|sure profit\b/i.test(normalized)) {
    cautionItems.push("Avoid gambling-style or certainty-seeking money decisions.");
  }

  if (input.confidence === "low") {
    cautionItems.push("Context confidence is limited, so treat this as directional guidance rather than a fixed outcome.");
  }

  return listToBullets(
    cautionItems,
    "No major money caution signal is dominant, but keep spending, borrowing, and risk choices measured."
  );
}

function buildFinancePracticalGuidance(input: {
  intents: FinanceFormatterIntent[];
  compact: boolean;
}) {
  const actions: string[] = [];

  actions.push("Build decisions around a realistic budget, steady saving, and clear written tracking.");

  if (input.intents.includes("income")) {
    actions.push("Strengthen income through repeatable effort, better positioning, and measurable skill growth.");
  }

  if (input.intents.includes("savings")) {
    actions.push("Protect savings first and keep an emergency reserve before expanding discretionary spending.");
  }

  if (input.intents.includes("expenses")) {
    actions.push("Review recurring expenses and cut avoidable outflow before making new commitments.");
  }

  if (input.intents.includes("debt")) {
    actions.push("Avoid unnecessary loans and keep repayment planning conservative and documented.");
  }

  if (input.intents.includes("business_profit")) {
    actions.push("Treat business money as cash-flow management first and growth second.");
  }

  if (input.intents.includes("investment_risk")) {
    actions.push("For investments, seek qualified financial advice and avoid acting only on short-term confidence.");
  }

  if (input.intents.includes("financial_discipline")) {
    actions.push("Use a weekly money review so discipline stays visible and practical.");
  }

  return listToBullets(actions.slice(0, input.compact ? 2 : 3), actions[0]);
}

function buildFinanceOptionalSupport(question: string) {
  const normalized = question.toLowerCase();

  if (!/\bremedy|mantra|prayer|ritual|upaya|solution|what should i do\b/i.test(normalized)) {
    return null;
  }

  return "Optional Remedy / Spiritual Support:\nIf helpful, keep it simple: a short prayer, mantra practice, or a calm money-discipline ritual. Treat it as support, not a guarantee.";
}

function buildFinanceSoftNextStep(input: {
  chartContext?: ChartAiContext | null;
  toolBundle?: AskChartFormatterToolBundle | null;
  planType: UserPlanType;
  intents: FinanceFormatterIntent[];
}) {
  if (!input.chartContext || !input.toolBundle?.predictiveAssistantContext) {
    return "Generate or refresh your Kundli first so finance timing and wealth context can be read more clearly.";
  }

  if (
    input.intents.includes("investment_risk") ||
    input.intents.includes("business_profit") ||
    input.intents.includes("debt") ||
    input.intents.includes("wealth_growth")
  ) {
    return "If you want deeper continuity, view the Finance Report or ask one focused finance follow-up question.";
  }

  if (input.planType !== "FREE") {
    return "For major money decisions, continue with a focused finance follow-up or book consultation for a context-rich review.";
  }

  return "Ask one deeper finance follow-up focused on a single money decision for sharper chart-grounded guidance.";
}

function buildHealthWellnessIndicators(input: {
  chartContext?: ChartAiContext | null;
  toolBundle?: AskChartFormatterToolBundle | null;
  intents: HealthFormatterIntent[];
  compact: boolean;
}) {
  const predictive = input.toolBundle?.predictiveAssistantContext;
  const summaryFacts = input.toolBundle?.chartSummaryFacts;
  const lagna = input.chartContext?.lagna.sign ?? null;
  const moon = input.chartContext?.moonSign ?? null;
  const sun = input.chartContext?.sunSign ?? null;
  const dominantHouses = new Set<number>(predictive?.dominant_houses ?? []);
  const pressureLabels: string[] = [];
  const supportLabels: string[] = [];

  if (lagna) {
    supportLabels.push(`Lagna in ${lagna} keeps the discussion rooted in personal vitality and baseline resilience.`);
  }

  if (moon) {
    supportLabels.push(`Moon in ${moon} points to emotional balance and rest quality as part of the wellness picture.`);
  }

  if (sun) {
    supportLabels.push(`Sun in ${sun} can highlight vitality, recovery rhythm, and how energy is expressed day to day.`);
  }

  if (input.intents.includes("sleep")) {
    supportLabels.push("Sleep and rest quality become central parts of the wellness reading.");
  }

  if (
    input.intents.includes("stress") ||
    input.intents.includes("mental_distress") ||
    input.intents.includes("emotional_distress")
  ) {
    supportLabels.push("Stress load and mental strain deserve careful pacing rather than forceful self-correction.");
  }

  if (input.intents.includes("energy_vitality")) {
    supportLabels.push("Energy and stamina are best handled through recovery, hydration, and steady routine rather than extremes.");
  }

  if (dominantHouses.has(1) || dominantHouses.has(6) || dominantHouses.has(8) || dominantHouses.has(12)) {
    pressureLabels.push("The current pattern gives extra weight to routine, recovery, rest, and caution around overstrain.");
  }

  if (summaryFacts?.matchingHouses?.length) {
    const houses = summaryFacts.matchingHouses.slice(0, 3).map((entry) => entry.house).join(", ");
    supportLabels.push(`The current chart facts place emphasis around houses ${houses}, so the wellness answer is centered on those signals rather than broad generalities.`);
  }

  const lines = [
    ...supportLabels.slice(0, 3),
    ...pressureLabels.slice(0, 2),
  ];

  if (!lines.length) {
    return input.compact
      ? "The available chart context is limited, so this wellness reading stays broad and supportive."
      : "The available chart context is limited, so this wellness reading stays broad and supportive. The focus remains on routine, sleep, stress load, and practical self-care rather than diagnosis.";
  }

  return lines.join(" ");
}

function buildHealthTimingFocus(input: {
  toolBundle?: AskChartFormatterToolBundle | null;
  intents: HealthFormatterIntent[];
  compact: boolean;
}) {
  const predictive = input.toolBundle?.predictiveAssistantContext;
  const activeChain = predictive?.active_period_context?.active_chain?.length
    ? predictive.active_period_context.active_chain.map((planet) => titleCase(planet)).join(" -> ")
    : null;
  const timingFocus = predictive?.timing_focus?.length
    ? predictive.timing_focus.slice(0, 3).join(", ")
    : null;

  const lines = [
    activeChain ? `Current dasha flow suggests ${activeChain}, so the timing message should focus on routine, rest, or discipline rather than prediction certainty.` : null,
    timingFocus ? `Timing labels currently emphasize ${timingFocus}.` : null,
    input.intents.includes("sleep") || input.intents.includes("routine_discipline")
      ? "Use this period to strengthen sleep rhythm, screen-time boundaries, and daily structure."
      : "Treat current timing as a cue for steadier self-care and calmer pacing, not as a medical forecast.",
  ].filter((line): line is string => Boolean(line));

  if (!lines.length) {
    return input.compact
      ? "Timing context is limited, so focus on routine and observation rather than fixed health predictions."
      : "Timing context is limited, so this answer should stay with routine, stress pacing, and observation rather than any fixed health prediction.";
  }

  return lines.join(" ");
}

function buildHealthPracticalGuidance(input: {
  intents: HealthFormatterIntent[];
  compact: boolean;
}) {
  const lines: string[] = [];

  if (input.intents.includes("sleep")) {
    lines.push("Keep a consistent sleep window, reduce late-night screen exposure, and track rest quality for a week.");
  }

  if (
    input.intents.includes("stress") ||
    input.intents.includes("mental_distress") ||
    input.intents.includes("emotional_distress")
  ) {
    lines.push("Use gentle breathing, prayer or meditation, and shorter task blocks to lower stress load.");
  }

  if (input.intents.includes("energy_vitality")) {
    lines.push("Support energy with hydration, balanced meals, light movement, and fewer unnecessary overcommitments.");
  }

  if (input.intents.includes("routine_discipline") || input.intents.includes("general_wellness")) {
    lines.push("Keep meals, sleep, and movement regular; small stable habits matter more than dramatic changes.");
  }

  if (!lines.length) {
    lines.push("Keep the wellness response grounded in sleep, hydration, balanced meals, stress pacing, and simple daily discipline.");
  }

  if (input.compact) {
    return lines[0];
  }

  return lines.slice(0, 3).join(" ");
}

function buildHealthMedicalSafetyNote(question: string, intents: HealthFormatterIntent[]) {
  const normalized = question.toLowerCase();
  const urgent = /\bself[-\s]?harm|suicid|unsafe|emergency|chest pain|trouble breathing|fainting|severe pain|urgent\b/i.test(
    normalized
  );
  const medical = intents.includes("medical_concern") || /\bmedical|symptom|symptoms|illness|disease|doctor\b/i.test(normalized);

  if (urgent) {
    return "This is not emergency or crisis care. If there is immediate danger, self-harm risk, severe symptoms, chest pain, trouble breathing, or abuse, contact local emergency services or trusted immediate support now.";
  }

  if (medical) {
    return "This is astrology-informed wellness guidance, not medical diagnosis or treatment. Please consult a qualified healthcare professional for symptoms, tests, medicines, or urgent medical decisions.";
  }

  return "This is astrology-informed wellness guidance, not medical advice. Use it as a gentle lifestyle reflection rather than a health diagnosis.";
}

function buildHealthOptionalSupport(question: string, intents: HealthFormatterIntent[]) {
  const normalized = question.toLowerCase();

  if (
    /\bprayer|mantra|meditation|charity|spiritual|remedy\b/i.test(normalized) ||
    intents.includes("spiritual_lifestyle_support")
  ) {
    return "Optional spiritual support can include prayer, mantra, gratitude, charity, calm routine, or disciplined rest. Keep it supportive, not fear-based.";
  }

  return null;
}

function buildHealthSoftNextStep(input: {
  toolBundle?: AskChartFormatterToolBundle | null;
  planType: UserPlanType;
  intents: HealthFormatterIntent[];
}) {
  const hasPredictiveContext = Boolean(input.toolBundle?.predictiveAssistantContext);
  const medicalConcern = input.intents.includes("medical_concern");

  if (!hasPredictiveContext) {
    return medicalConcern
      ? "Generate Kundli first if you want a deeper astrology-based wellness review, and consult a doctor for the medical concern itself."
      : "Generate Kundli first if you want a deeper wellness reading with stronger timing context.";
  }

  if (medicalConcern) {
    return "You can ask a deeper wellness question, view a Health Report if available, or consult a doctor for the medical concern itself.";
  }

  if (input.planType === "FREE") {
    return "Ask one deeper wellness question focused on sleep, stress, routine, or energy for a more precise chart-grounded answer.";
  }

  return "If needed, continue with a deeper wellness follow-up or consultation for a more context-rich astrology review.";
}

function buildEducationTendency(input: {
  chartContext?: ChartAiContext | null;
  toolBundle?: AskChartFormatterToolBundle | null;
  intents: EducationFormatterIntent[];
  compact: boolean;
}) {
  const predictive = input.toolBundle?.predictiveAssistantContext;
  const dominantHouses = new Set<number>(predictive?.dominant_houses ?? []);
  const supportiveCount = predictive?.supportive_factors?.length ?? 0;
  const pressureCount = predictive?.pressure_factors?.length ?? 0;
  const hasHouse = (value: number) => dominantHouses.has(value);

  if (input.intents.includes("subject_choice")) {
    if (hasHouse(5) || hasHouse(9)) {
      return "Subject choice improves when it matches aptitude, memory, and a subject you can revise steadily.";
    }

    return "Subject choice is best handled by matching aptitude with repeatable effort rather than forcing interest.";
  }

  if (input.intents.includes("competitive_exams")) {
    if (hasHouse(6) || hasHouse(3)) {
      return "Competitive exam performance can improve through disciplined practice, repetition, and calm execution.";
    }

    return "Competitive exams look more manageable through steady revision than through last-minute pressure.";
  }

  if (input.intents.includes("higher_studies")) {
    if (hasHouse(9) || hasHouse(5)) {
      return "Higher study is better supported when you stay aligned with mentors, clarity, and deeper learning.";
    }

    return "Higher study can work best if the path is chosen carefully and backed by consistent preparation.";
  }

  if (input.intents.includes("study_to_career")) {
    return "Education looks strongest when you align study choices with a real career direction and build practical proof.";
  }

  if (input.intents.includes("concentration_memory")) {
    if (hasHouse(5) || hasHouse(4)) {
      return "Concentration and memory improve when the study setting is stable and the revision pattern is regular.";
    }

    return "Concentration improves more through routine and repetition than through trying to study in one stretch.";
  }

  if (input.intents.includes("admission_timing")) {
    return "Admission and application timing should be approached with preparation, documentation, and realistic pacing.";
  }

  if (supportiveCount >= pressureCount + 2) {
    return "The current education pattern supports learning progress when effort stays consistent and organized.";
  }

  if (pressureCount >= supportiveCount + 2) {
    return "The chart timing asks for patience, discipline, and steady revision rather than forcing fast academic conclusions.";
  }

  if (pressureCount > 0) {
    return "Education timing is mixed, so steady effort and clear study habits matter more than momentary pressure.";
  }

  if (!input.chartContext) {
    return "Education guidance is general here, so use it as a study-planning guide unless deeper chart context is available.";
  }

  return input.compact
    ? "Education looks most responsive to consistent revision, mentor guidance, and practical study habits."
    : "Education looks most responsive to consistent revision, mentor guidance, and practical study habits rather than short bursts of effort.";
}

function buildEducationTimingInsight(input: {
  toolBundle?: AskChartFormatterToolBundle | null;
  compact: boolean;
}) {
  const baseTiming = buildTimingInsight({
    toolBundle: input.toolBundle,
  });
  const predictive = input.toolBundle?.predictiveAssistantContext;
  const supportiveCount = predictive?.supportive_factors?.length ?? 0;
  const pressureCount = predictive?.pressure_factors?.length ?? 0;

  let tone = "This timing supports patient revision, focus, and disciplined practice.";

  if (supportiveCount >= pressureCount + 2) {
    tone = "This timing supports focus, revision, and steady academic progress.";
  } else if (pressureCount >= supportiveCount + 2) {
    tone = "This timing asks for patience, structured revision, and calm pacing before expecting results.";
  } else if (pressureCount > 0) {
    tone = "This timing is mixed, so steady effort and consistent revision matter more than quick conclusions.";
  }

  return input.compact ? `${tone} ${baseTiming}` : `${baseTiming} ${tone}`;
}

function buildEducationStrengths(input: {
  chartContext?: ChartAiContext | null;
  toolBundle?: AskChartFormatterToolBundle | null;
  intents: EducationFormatterIntent[];
  compact: boolean;
}) {
  const items: string[] = [];
  const predictive = input.toolBundle?.predictiveAssistantContext;
  const dominantHouses = predictive?.dominant_houses ?? [];
  const hasHouse = (value: number) => dominantHouses.includes(value);

  if (hasHouse(5)) {
    items.push("Memory, creativity, and conceptual understanding can strengthen with revision.");
  }

  if (hasHouse(9)) {
    items.push("Higher learning, mentors, and guided study can support academic progress.");
  }

  if (hasHouse(3)) {
    items.push("Writing practice, communication, and skill repetition can improve results.");
  }

  if (hasHouse(6)) {
    items.push("Discipline and competitive effort can help when the routine stays consistent.");
  }

  if (hasHouse(4)) {
    items.push("A stable study environment can help retention and concentration.");
  }

  if (input.intents.includes("study_to_career")) {
    items.push("Linking studies to a practical career direction can improve motivation.");
  }

  if (!items.length && predictive?.supportive_factors?.length) {
    items.push(...predictive.supportive_factors.slice(0, input.compact ? 1 : 2));
  }

  return listToBullets(
    items,
    "Your strongest gains are likely to come from steady revision, mentor feedback, and one focused subject plan at a time."
  );
}

function buildEducationChallenges(input: {
  intents: EducationFormatterIntent[];
  confidence: AstrologyAssistantStructuredResponse["confidence"];
  toolBundle?: AskChartFormatterToolBundle | null;
  compact: boolean;
}) {
  const items: string[] = [];
  const predictive = input.toolBundle?.predictiveAssistantContext;

  if (predictive?.pressure_factors?.length) {
    items.push(...predictive.pressure_factors.slice(0, input.compact ? 1 : 2));
  }

  if (input.intents.includes("academic_pressure")) {
    items.push("Exam pressure is better handled with a calm routine than with last-minute intensity.");
  }

  if (input.intents.includes("learning_obstacles")) {
    items.push("Distraction or inconsistent revision can slow progress more than lack of talent.");
  }

  if (input.intents.includes("concentration_memory")) {
    items.push("Concentration may drop when rest, structure, or repetition is missing.");
  }

  if (input.intents.includes("subject_choice")) {
    items.push("Overthinking subject choice can delay momentum, so avoid changing direction too often.");
  }

  if (input.confidence === "low") {
    items.push("Context confidence is limited, so keep this as directional guidance rather than a fixed forecast.");
  }

  return listToBullets(
    items,
    "No major obstacle is dominant, but study consistency matters more than occasional bursts of effort."
  );
}

function buildEducationPracticalGuidance(input: {
  intents: EducationFormatterIntent[];
  compact: boolean;
}) {
  const actions: string[] = [];

  actions.push("Keep a fixed daily study slot and protect it like an appointment.");

  if (input.intents.includes("competitive_exams")) {
    actions.push("Use revision cycles and mock tests instead of only reading once.");
  }

  if (input.intents.includes("subject_choice") || input.intents.includes("higher_studies")) {
    actions.push("Compare subjects by aptitude, interest, and long-term usefulness before deciding.");
  }

  if (input.intents.includes("concentration_memory")) {
    actions.push("Use shorter focus blocks, remove distractions, and revise in small repeats.");
  }

  if (input.intents.includes("admission_timing")) {
    actions.push("Prepare documents early and avoid leaving applications to the last moment.");
  }

  if (input.intents.includes("study_to_career")) {
    actions.push("Choose study paths that map to usable career skills and portfolio proof.");
  }

  actions.push("Sleep, routine, and mentor feedback matter more than a single intense study push.");

  return listToBullets(actions.slice(0, input.compact ? 3 : 5), actions[0]);
}

function buildEducationOptionalSupport(question: string, intents: EducationFormatterIntent[]) {
  if (
    intents.includes("education_remedy") ||
    /\b(remedy|mantra|prayer|saraswati|guru|study remedy|exam remedy)\b/i.test(question)
  ) {
    return "Optional support: a calm Saraswati or Guru prayer, disciplined morning study, gratitude, and a short revision ritual can support focus. Keep it optional and practical.";
  }

  return null;
}

function buildEducationSoftNextStep(input: {
  chartContext?: ChartAiContext | null;
  toolBundle?: AskChartFormatterToolBundle | null;
  planType: UserPlanType;
  intents: EducationFormatterIntent[];
}) {
  if (!input.chartContext || !input.toolBundle?.predictiveAssistantContext) {
    return "Generate or refresh your Kundli first so study timing and learning context can be read more clearly.";
  }

  if (
    input.intents.includes("subject_choice") ||
    input.intents.includes("higher_studies") ||
    input.intents.includes("competitive_exams") ||
    input.intents.includes("admission_timing") ||
    input.intents.includes("study_to_career")
  ) {
    return "If you want deeper continuity, view an Education Report or ask one focused follow-up education question.";
  }

  if (input.planType !== "FREE" && input.intents.includes("academic_pressure")) {
    return "For high-stakes study planning, use one deeper education question or book consultation for context-rich guidance.";
  }

  return "Ask one deeper education question if you want more specific study and timing guidance.";
}

function shouldUseCompactCareerFormat(input: { question: string }) {
  const questionLength = normalizeWhitespace(input.question).length;

  return questionLength <= 80;
}

function shouldUseCompactFormat(input: {
  question: string;
  domains: FormatterDomain[];
  intent?: AskMyChartIntent | null;
}) {
  const questionLength = normalizeWhitespace(input.question).length;
  const specificDomain = input.domains.some((domain) => domain !== "general");
  const highStakes =
    input.domains.includes("health") ||
    input.domains.includes("finance") ||
    input.domains.includes("marriage") ||
    input.domains.includes("business");

  if (specificDomain || highStakes) {
    return false;
  }

  if (input.intent === "REMEDY_EXPLANATION" || input.intent === "TRANSIT_EXPLANATION") {
    return false;
  }

  return questionLength <= 70;
}

function formatConfidenceLabel(value: AstrologyAssistantStructuredResponse["confidence"]) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toPredictionConfidenceLevel(
  value: AstrologyAssistantStructuredResponse["confidence"]
) {
  if (value === "high") {
    return "HIGH" as const;
  }

  if (value === "medium") {
    return "MEDIUM" as const;
  }

  return "LOW" as const;
}

export function formatJyotishAnswerForConversation(
  input: JyotishAnswerFormatterInput
) {
  const locale = resolvePredictionLocale(input.locale);
  const question = normalizeWhitespace(input.question ?? "");
  const domains = detectDomains(question);
  const planType = input.planType ?? "FREE";
  const summaryLines = toSentenceLines(input.response.answer, 3);
  const chartAnchor = buildChartAnchorLine(input.chartContext);
  const timingInsight = buildTimingInsight({
    toolBundle: input.toolBundle,
  });
  const practicalGuidance = buildPracticalGuidance(domains);
  const safetyNote = buildSafetyNote({
    domains,
    question,
    confidence: input.response.confidence,
    intent: input.intent,
  });
  const nextStep = buildNextStep({
    domains,
    planType,
    toolBundle: input.toolBundle,
  });
  const compact = shouldUseCompactFormat({
    question,
    domains,
    intent: input.intent,
  });
  const remedyApplies =
    input.intent === "REMEDY_EXPLANATION" ||
    /\b(remedy|remedies|mantra|prayer|puja|daan|charity|fasting|graha remedy|daily remedy|gemstone|gemstones|rudraksha|yantra|mala|japa|stotra|homa|havan|upay|upaya|spiritual support)\b/i.test(
      question
    );
  const dailyPredictionApplies =
    (domains.includes("daily_guidance") || dailyPredictionQuestionPattern.test(question)) &&
    !remedyApplies;
  const relationshipApplies = isRelationshipQuestion({
    question,
    domains,
  });
  const healthApplies =
    domains.includes("health") ||
    /\bhealth|wellness|wellbeing|well-being|stress|sleep|energy|vitality|routine|rest|fatigue|burnout|anxiety|emotional balance|emotional distress|emotionally disturbed|mental health|mentally exhausted|insomnia|mood|panic\b/i.test(
      question
    );
  const educationApplies =
    domains.includes("education") ||
    /\b(education|study|studies|exam|exams|learning|academic|subject choice|which subject|higher study|higher studies|admission|scholarship|concentration|memory|revision|entrance exam|competitive exam|study routine|career direction|remedy for study|remedy for exam|school|college|university)\b/i.test(
      question
    );
  const businessApplies = isBusinessQuestion({
    question,
    domains,
  });
  const financeApplies = domains.includes("finance") || detectFinanceIntents(question).length > 0;
  const careerApplies = isCareerQuestion({
    question,
    domains,
  });
  const sections: string[] = [];

  if (remedyApplies) {
    const remedyIntents = detectRemedyIntents(question);
    const remedyCompact = normalizeWhitespace(question).length <= 90;
    const remedySummary = buildRemedySummary({
      summaryLines,
      toolBundle: input.toolBundle,
      compact: remedyCompact,
    });
    const whySuggested = buildRemedyWhySuggested({
      chartContext: input.chartContext,
      toolBundle: input.toolBundle,
      intents: remedyIntents,
      compact: remedyCompact,
    });
    const practiceSteps = buildRemedyPracticeSteps({
      intents: remedyIntents,
      toolBundle: input.toolBundle,
      compact: remedyCompact,
    });
    const timingDiscipline = buildRemedyTimingDiscipline({
      toolBundle: input.toolBundle,
      compact: remedyCompact,
    });
    const cautionNote = buildRemedyCautionNote({
      question,
      intents: remedyIntents,
      toolBundle: input.toolBundle,
    });
    const optionalProductOrConsultation = buildRemedyOptionalProductOrConsultationGuidance({
      question,
      toolBundle: input.toolBundle,
      intents: remedyIntents,
    });
    const softNextStep = buildRemedySoftNextStep({
      chartContext: input.chartContext,
      toolBundle: input.toolBundle,
      planType,
      intents: remedyIntents,
    });

    sections.push(
      `Remedy Summary:\n${remedySummary}`,
      `Why This Remedy Is Suggested:\n${whySuggested}`,
      `Simple Practice Steps:\n${practiceSteps}`,
      `Best Timing / Discipline:\n${timingDiscipline}`,
      `Caution / Safety Note:\n${cautionNote}`
    );

    if (optionalProductOrConsultation) {
      sections.push(optionalProductOrConsultation);
    }

    if (softNextStep) {
      sections.push(`Soft Next Step:\n${softNextStep}`);
    }

    sections.push(
      `Confidence: ${formatConfidenceLabel(input.response.confidence)}`,
      formatConfidenceLine({
        locale,
        level: toPredictionConfidenceLevel(input.response.confidence),
      })
    );

    if (input.includeDisclaimer) {
      sections.push(`Disclaimer: ${getAstrologyDisclaimer(locale)}`);
    }

    return sections.join("\n\n");
  }

  if (dailyPredictionApplies) {
    const dailyCompact = normalizeWhitespace(question).length <= 90;
    const coreMessage = buildDailyPredictionCoreMessage({
      summaryLines,
      toolBundle: input.toolBundle,
      compact: dailyCompact,
    });
    const timingInsight = buildDailyPredictionTimingInsight({
      toolBundle: input.toolBundle,
      compact: dailyCompact,
    });
    const focusLine = buildDailyPredictionWorkFocus({
      domains,
      compact: dailyCompact,
    });
    const relationshipLine = buildDailyPredictionRelationshipFocus({
      domains,
      compact: dailyCompact,
    });
    const moneyLine = buildDailyPredictionMoneyCaution({
      domains,
      compact: dailyCompact,
    });
    const healthLine = buildDailyPredictionHealthBalance({
      domains,
      compact: dailyCompact,
    });
    const luckyLine = buildDailyPredictionLuckyIndicators({
      toolBundle: input.toolBundle,
      compact: dailyCompact,
    });
    const optionalSupport = buildDailyPredictionOptionalSupport(question);
    const softNextStep = buildDailyPredictionSoftNextStep({
      chartContext: input.chartContext,
      toolBundle: input.toolBundle,
      planType,
    });

    sections.push(
      `Today's Core Message:\n${coreMessage}`,
      `Personal Timing Insight:\n${timingInsight}`,
      `Work / Study / Business Focus:\n${focusLine}`,
      `Relationship / Family Focus:\n${relationshipLine}`,
      `Money / Decision Caution:\n${moneyLine}`,
      `Health / Energy Balance:\n${healthLine}`,
      `Lucky Color / Number / Time:\n${luckyLine}`
    );

    if (optionalSupport) {
      sections.push(`Daily Remedy / Spiritual Support:\n${optionalSupport}`);
    }

    if (softNextStep) {
      sections.push(`Soft Next Step:\n${softNextStep}`);
    }

    const safetyNote = buildSafetyNote({
      domains,
      question,
      confidence: input.response.confidence,
      intent: input.intent,
    });

    if (safetyNote) {
      sections.push(`Caution / Safety Note:\n${safetyNote}`);
    }

    sections.push(
      `Confidence: ${formatConfidenceLabel(input.response.confidence)}`,
      formatConfidenceLine({
        locale,
        level: toPredictionConfidenceLevel(input.response.confidence),
      })
    );

    if (input.includeDisclaimer) {
      sections.push(`Disclaimer: ${getAstrologyDisclaimer(locale)}`);
    }

    return sections.join("\n\n");
  }

  if (relationshipApplies) {
    const relationshipIntents = detectRelationshipIntents(question);
    const relationshipCompact = normalizeWhitespace(question).length <= 90;
    const relationshipTendency = buildRelationshipTendency({
      chartContext: input.chartContext,
      toolBundle: input.toolBundle,
      intents: relationshipIntents,
    });
    const relationshipTimingInsight = buildRelationshipTimingInsight({
      toolBundle: input.toolBundle,
      compact: relationshipCompact,
    });
    const harmonyFactors = buildRelationshipCompatibilityHarmony({
      toolBundle: input.toolBundle,
      intents: relationshipIntents,
      compact: relationshipCompact,
    });
    const cautions = buildRelationshipCautionAreas({
      domains,
      intents: relationshipIntents,
      confidence: input.response.confidence,
      toolBundle: input.toolBundle,
      compact: relationshipCompact,
      question,
    });
    const practicalSteps = buildRelationshipPracticalGuidance({
      intents: relationshipIntents,
      compact: relationshipCompact,
    });
    const optionalSupport = buildRelationshipOptionalRemedy(question);
    const softNextStep = buildRelationshipSoftNextStep({
      chartContext: input.chartContext,
      toolBundle: input.toolBundle,
      planType,
      intents: relationshipIntents,
    });

    sections.push(
      `Direct Relationship Summary:\n${summaryLines.join("\n")}`,
      `Marriage / Partnership Tendency:\n${relationshipTendency}`,
      `Timing Insight:\n${relationshipTimingInsight}`,
      `Compatibility & Harmony Factors:\n${harmonyFactors}`,
      `Caution Areas:\n${cautions}`,
      `Practical Relationship Guidance:\n${practicalSteps}`
    );

    if (optionalSupport) {
      sections.push(optionalSupport);
    }

    if (softNextStep) {
      sections.push(`Soft Next Step:\n${softNextStep}`);
    }

    const safetyNote = buildSafetyNote({
      domains,
      question,
      confidence: input.response.confidence,
      intent: input.intent,
    });

    if (safetyNote) {
      sections.push(`Caution / Safety Note:\n${safetyNote}`);
    }

    sections.push(
      `Confidence: ${formatConfidenceLabel(input.response.confidence)}`,
      formatConfidenceLine({
        locale,
        level: toPredictionConfidenceLevel(input.response.confidence),
      })
    );

    if (input.includeDisclaimer) {
      sections.push(`Disclaimer: ${getAstrologyDisclaimer(locale)}`);
    }

    return sections.join("\n\n");
  }

  if (healthApplies) {
    const healthIntents = detectHealthIntents(question);
    const healthCompact = normalizeWhitespace(question).length <= 90;
    const wellnessIndicators = buildHealthWellnessIndicators({
      chartContext: input.chartContext,
      toolBundle: input.toolBundle,
      intents: healthIntents,
      compact: healthCompact,
    });
    const timingFocus = buildHealthTimingFocus({
      toolBundle: input.toolBundle,
      intents: healthIntents,
      compact: healthCompact,
    });
    const practicalSteps = buildHealthPracticalGuidance({
      intents: healthIntents,
      compact: healthCompact,
    });
    const optionalSupport = buildHealthOptionalSupport(question, healthIntents);
    const softNextStep = buildHealthSoftNextStep({
      toolBundle: input.toolBundle,
      planType,
      intents: healthIntents,
    });
    const safetyNote = buildHealthMedicalSafetyNote(question, healthIntents);

    sections.push(
      `Wellness Summary:\n${summaryLines.join("\n")}`,
      `Chart-Based Wellness Indicators:\n${wellnessIndicators}`,
      `Timing / Routine Focus:\n${timingFocus}`,
      `Practical Lifestyle Guidance:\n${practicalSteps}`,
      `Medical Safety Note:\n${safetyNote}`
    );

    if (optionalSupport) {
      sections.push(`Optional Spiritual Support:\n${optionalSupport}`);
    }

    if (softNextStep) {
      sections.push(`Soft Next Step:\n${softNextStep}`);
    }

    sections.push(
      `Confidence: ${formatConfidenceLabel(input.response.confidence)}`,
      formatConfidenceLine({
        locale,
        level: toPredictionConfidenceLevel(input.response.confidence),
      })
    );

    if (input.includeDisclaimer) {
      sections.push(`Disclaimer: ${getAstrologyDisclaimer(locale)}`);
    }

    return sections.join("\n\n");
  }

  if (educationApplies) {
    const educationIntents = detectEducationIntents(question);
    const educationCompact = normalizeWhitespace(question).length <= 90;
    const educationTendency = buildEducationTendency({
      chartContext: input.chartContext,
      toolBundle: input.toolBundle,
      intents: educationIntents,
      compact: educationCompact,
    });
    const timingInsight = buildEducationTimingInsight({
      toolBundle: input.toolBundle,
      compact: educationCompact,
    });
    const strengths = buildEducationStrengths({
      chartContext: input.chartContext,
      toolBundle: input.toolBundle,
      intents: educationIntents,
      compact: educationCompact,
    });
    const challenges = buildEducationChallenges({
      intents: educationIntents,
      confidence: input.response.confidence,
      toolBundle: input.toolBundle,
      compact: educationCompact,
    });
    const practicalSteps = buildEducationPracticalGuidance({
      intents: educationIntents,
      compact: educationCompact,
    });
    const optionalSupport = buildEducationOptionalSupport(question, educationIntents);
    const softNextStep = buildEducationSoftNextStep({
      chartContext: input.chartContext,
      toolBundle: input.toolBundle,
      planType,
      intents: educationIntents,
    });

    sections.push(
      `Education Summary:\n${summaryLines.join("\n")}`,
      `Learning / Subject Tendency:\n${educationTendency}`,
      `Timing Insight:\n${timingInsight}`,
      `Strengths & Opportunities:\n${strengths}`,
      `Study Challenges / Caution:\n${challenges}`,
      `Practical Study Guidance:\n${practicalSteps}`
    );

    if (optionalSupport) {
      sections.push(`Optional Spiritual Support:\n${optionalSupport}`);
    }

    if (softNextStep) {
      sections.push(`Soft Next Step:\n${softNextStep}`);
    }

    const safetyNote = buildSafetyNote({
      domains,
      question,
      confidence: input.response.confidence,
      intent: input.intent,
    });

    if (safetyNote) {
      sections.push(`Caution / Safety Note:\n${safetyNote}`);
    }

    sections.push(
      `Confidence: ${formatConfidenceLabel(input.response.confidence)}`,
      formatConfidenceLine({
        locale,
        level: toPredictionConfidenceLevel(input.response.confidence),
      })
    );

    if (input.includeDisclaimer) {
      sections.push(`Disclaimer: ${getAstrologyDisclaimer(locale)}`);
    }

    return sections.join("\n\n");
  }

  if (businessApplies) {
    const businessIntents = detectBusinessIntents(question);
    const businessCompact = normalizeWhitespace(question).length <= 90;
    const businessTendency = buildBusinessTendency({
      chartContext: input.chartContext,
      toolBundle: input.toolBundle,
      intents: businessIntents,
    });
    const businessTimingInsight = buildBusinessTimingInsight({
      toolBundle: input.toolBundle,
      compact: businessCompact,
    });
    const growthOpportunities = buildBusinessGrowthOpportunities({
      chartContext: input.chartContext,
      toolBundle: input.toolBundle,
      intents: businessIntents,
      compact: businessCompact,
    });
    const cautions = buildBusinessRiskAreas({
      domains,
      intents: businessIntents,
      confidence: input.response.confidence,
      toolBundle: input.toolBundle,
      compact: businessCompact,
    });
    const practicalSteps = buildBusinessPracticalGuidance({
      intents: businessIntents,
      compact: businessCompact,
    });
    const optionalSupport = buildBusinessOptionalSupport(question, businessIntents);
    const softNextStep = buildBusinessSoftNextStep({
      chartContext: input.chartContext,
      toolBundle: input.toolBundle,
      planType,
      intents: businessIntents,
    });

    sections.push(
      `Business Summary:\n${summaryLines.join("\n")}`,
      `Business / Job / Partnership Tendency:\n${businessTendency}`,
      `Timing Insight:\n${businessTimingInsight}`,
      `Growth Opportunities:\n${growthOpportunities}`,
      `Risk / Caution Areas:\n${cautions}`,
      `Practical Business Guidance:\n${practicalSteps}`
    );

    if (optionalSupport) {
      sections.push(`Optional Spiritual Support:\n${optionalSupport}`);
    }

    if (softNextStep) {
      sections.push(`Soft Next Step:\n${softNextStep}`);
    }

    const safetyNote = buildSafetyNote({
      domains,
      question,
      confidence: input.response.confidence,
      intent: input.intent,
    });

    if (safetyNote) {
      sections.push(`Caution / Safety Note:\n${safetyNote}`);
    }

    sections.push(
      `Confidence: ${formatConfidenceLabel(input.response.confidence)}`,
      formatConfidenceLine({
        locale,
        level: toPredictionConfidenceLevel(input.response.confidence),
      })
    );

    if (input.includeDisclaimer) {
      sections.push(`Disclaimer: ${getAstrologyDisclaimer(locale)}`);
    }

    return sections.join("\n\n");
  }

  if (financeApplies) {
    const financeIntents = detectFinanceIntents(question);
    const financeCompact = normalizeWhitespace(question).length <= 90;
    const financeTendency = buildFinanceTendency({
      chartContext: input.chartContext,
      toolBundle: input.toolBundle,
      intents: financeIntents,
    });
    const financeTimingInsight = buildFinanceTimingInsight({
      toolBundle: input.toolBundle,
      compact: financeCompact,
    });
    const growthOpportunities = buildFinanceGrowthOpportunities({
      chartContext: input.chartContext,
      toolBundle: input.toolBundle,
      intents: financeIntents,
      compact: financeCompact,
    });
    const cautions = buildFinanceRiskCautionAreas({
      domains,
      intents: financeIntents,
      confidence: input.response.confidence,
      toolBundle: input.toolBundle,
      compact: financeCompact,
      question,
    });
    const practicalSteps = buildFinancePracticalGuidance({
      intents: financeIntents,
      compact: financeCompact,
    });
    const optionalSupport = buildFinanceOptionalSupport(question);
    const softNextStep = buildFinanceSoftNextStep({
      chartContext: input.chartContext,
      toolBundle: input.toolBundle,
      planType,
      intents: financeIntents,
    });

    sections.push(
      `Financial Summary:\n${summaryLines.join("\n")}`,
      `Income / Savings Tendency:\n${financeTendency}`,
      `Timing Insight:\n${financeTimingInsight}`,
      `Growth Opportunities:\n${growthOpportunities}`,
      `Expense / Risk Caution:\n${cautions}`,
      `Practical Financial Guidance:\n${practicalSteps}`
    );

    if (optionalSupport) {
      sections.push(optionalSupport);
    }

    if (softNextStep) {
      sections.push(`Soft Next Step:\n${softNextStep}`);
    }

    const safetyNote = buildSafetyNote({
      domains,
      question,
      confidence: input.response.confidence,
      intent: input.intent,
    });

    if (safetyNote) {
      sections.push(`Caution / Safety Note:\n${safetyNote}`);
    }

    sections.push(
      `Confidence: ${formatConfidenceLabel(input.response.confidence)}`,
      formatConfidenceLine({
        locale,
        level: toPredictionConfidenceLevel(input.response.confidence),
      })
    );

    if (input.includeDisclaimer) {
      sections.push(`Disclaimer: ${getAstrologyDisclaimer(locale)}`);
    }

    return sections.join("\n\n");
  }

  if (careerApplies) {
    const careerIntents = detectCareerIntents(question);
    const careerCompact = shouldUseCompactCareerFormat({ question });
    const tendency = buildCareerTendency({
      chartContext: input.chartContext,
      toolBundle: input.toolBundle,
      intents: careerIntents,
    });
    const careerTimingInsight = buildCareerTimingInsight({
      toolBundle: input.toolBundle,
      compact: careerCompact,
    });
    const opportunities = buildCareerGrowthOpportunities({
      chartContext: input.chartContext,
      toolBundle: input.toolBundle,
      intents: careerIntents,
      compact: careerCompact,
    });
    const cautions = buildCareerCautionAreas({
      domains,
      intents: careerIntents,
      confidence: input.response.confidence,
      toolBundle: input.toolBundle,
      compact: careerCompact,
    });
    const practicalSteps = buildCareerPracticalGuidance({
      intents: careerIntents,
      compact: careerCompact,
    });
    const softNextStep = buildCareerSoftNextStep({
      chartContext: input.chartContext,
      toolBundle: input.toolBundle,
      planType,
      intents: careerIntents,
    });

    sections.push(
      `Career Summary:\n${summaryLines.join("\n")}`,
      `Job / Business Tendency:\n${tendency}`,
      `Timing Insight:\n${careerTimingInsight}`,
      `Growth Opportunities:\n${opportunities}`,
      `Caution Areas:\n${cautions}`,
      `Practical Guidance:\n${practicalSteps}`
    );

    if (softNextStep) {
      sections.push(`Soft Next Step:\n${softNextStep}`);
    }

    const safetyNote = buildSafetyNote({
      domains,
      question,
      confidence: input.response.confidence,
      intent: input.intent,
    });

    if (safetyNote) {
      sections.push(`Caution / Safety Note:\n${safetyNote}`);
    }

    sections.push(
      `Confidence: ${formatConfidenceLabel(input.response.confidence)}`,
      formatConfidenceLine({
        locale,
        level: toPredictionConfidenceLevel(input.response.confidence),
      })
    );

    if (input.includeDisclaimer) {
      sections.push(`Disclaimer: ${getAstrologyDisclaimer(locale)}`);
    }

    return sections.join("\n\n");
  }

  if (compact) {
    sections.push(
      `Direct Summary:\n${summaryLines.join("\n")}`,
      `Chart-Based Reasoning:\n${input.response.reasoning} ${chartAnchor}`,
      `Timing Insight:\n${timingInsight}`
    );
  } else {
    sections.push(
      `Direct Summary:\n${summaryLines.join("\n")}`,
      `Chart-Based Reasoning:\n${input.response.reasoning} ${chartAnchor}`,
      `Timing Insight:\n${timingInsight}`,
      `Practical Guidance:\n${practicalGuidance}`
    );

    if (safetyNote) {
      sections.push(`Caution / Safety Note:\n${safetyNote}`);
    }

    sections.push(`Next Step:\n${nextStep}`);
  }

  sections.push(
    `Confidence: ${formatConfidenceLabel(input.response.confidence)}`,
    formatConfidenceLine({
      locale,
      level: toPredictionConfidenceLevel(input.response.confidence),
    })
  );

  if (input.includeDisclaimer) {
    sections.push(`Disclaimer: ${getAstrologyDisclaimer(locale)}`);
  }

  return sections.join("\n\n");
}
