import "server-only";

import {
  buildPredictionPrompt,
  resolvePredictionLocale,
  validateAssistantStructuredOutput,
} from "@/lib/astrology/accuracy";
import { getAiGroundedTextService } from "@/modules/ai/server";
import { resolvePromptVersionByTemplateKey } from "@/modules/ai/prompt-versioning";
import type { AiTaskKind } from "@/modules/ai/tasks";
import type {
  AstrologyAssistantConfidence,
  ChartAiContext,
} from "@/modules/ask-chart/chart-context-mapper";
import type { PlanetaryBody } from "@/modules/astrology/types";
import { getRashifalSignBySlug } from "@/modules/rashifal/content";

export type AstrologyAssistantStructuredResponse = {
  answer: string;
  reasoning: string;
  confidence: AstrologyAssistantConfidence;
};

export type AstrologyAssistantEngineInput = {
  question: string;
  userName: string;
  preferredLocaleCode?: string | null;
  preferredLanguageLabel: string;
  planType: "FREE" | "PREMIUM" | "PRO";
  groundedScope: string;
  taskKind: AiTaskKind;
  chartContext: ChartAiContext;
  toolContext: unknown;
  fallback: AstrologyAssistantStructuredResponse;
};

export type AstrologyAssistantEngineResult = {
  structured: AstrologyAssistantStructuredResponse;
  providerKey: string;
  model: string | null;
  promptTemplateKey: string;
  promptVersionLabel: string;
  rawText: string;
};

type PredictiveAssistantContextSlice = {
  chart_identity?: {
    lagna_sign?: string | null;
    moon_sign?: string | null;
  } | null;
  active_period_context?: {
    mahadasha?: string | null;
    antardasha?: string | null;
    pratyantar?: string | null;
    day_dasha?: string | null;
    active_chain?: string[] | null;
    next_transition_at?: string | null;
    next_transition_level?: string | null;
  } | null;
  timing_focus?: string[] | null;
  dominant_planets?: string[] | null;
  dominant_houses?: number[] | null;
  supportive_factors?: string[] | null;
  pressure_factors?: string[] | null;
  confidence?: {
    level?: string | null;
    reasons?: string[] | null;
  } | null;
};

type AskChartToolContextSlice = {
  transitSnapshot?: {
    transits?: Array<{
      body: string;
      sign: string;
      house: number;
      summary: string;
      intensity: string;
    }> | null;
    aspects?: Array<{
      source: string;
      type: string;
      target: string;
      orb: number;
      exact: boolean;
    }> | null;
  } | null;
  dailyPanchangSnapshot?: {
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
  } | null;
  chartSummaryFacts?: {
    matchingPlacements?: Array<{
      body: string;
      sign: string;
      house: number;
      retrograde: boolean;
    }> | null;
    matchingHouses?: Array<{
      house: number;
      sign: string;
      ruler: string;
    }> | null;
    matchingAspects?: Array<{
      source: string;
      type: string;
      target: string;
      orb: number;
      exact: boolean;
    }> | null;
  } | null;
  predictiveAssistantContext?: PredictiveAssistantContextSlice | null;
  approvedRemedies?: {
    remedies: Array<{
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
      cautions: Array<{
        label: string;
        note: string;
      }>;
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
    }>;
    consultationPreparation: {
      summary: string;
      topRecommendations: Array<{
        slug: string;
        title: string;
        priorityTier: string;
        confidenceLabel: string;
        note: string;
      }>;
    };
  } | null;
  relatedProducts?: {
    products: Array<{
      id: string;
      slug: string;
      name: string;
      summary: string;
      priceLabel: string;
      categoryLabel: string;
    }>;
  } | null;
  consultationContext?: {
    confirmationCode: string;
    serviceLabel: string;
    topicFocus: string | null;
    intakeSummary: string | null;
    remedyPreparation?: {
      summary: string;
      topRecommendations: Array<{
        slug: string;
        title: string;
        priorityTier: string;
        confidenceLabel: string;
        note: string;
      }>;
    };
  } | null;
};

type DailyRashifalSnapshot = {
  signSlug: string;
  signName: string;
  shortPrediction: string;
  luckyColor: string;
  luckyNumber: string;
  luckyTime: string;
};

type CareerQuestionIntent =
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

type BusinessQuestionIntent =
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
  | "business_remedy"
  | "general_business";

type EducationQuestionIntent =
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

type FinanceQuestionIntent =
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
  | "general_finance";

type HealthQuestionIntent =
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

type RelationshipQuestionIntent =
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

type RemedyQuestionIntent =
  | "mantra_prayer"
  | "charity_daan"
  | "fasting_discipline"
  | "puja_guidance"
  | "daily_spiritual_practice"
  | "graha_related"
  | "gemstone_rudraksha_yantra"
  | "lifestyle_correction"
  | "consultation_shop";

function classifyRemedyQuestionIntent(question: string): RemedyQuestionIntent[] {
  const normalized = question.toLowerCase();
  const intents = new Set<RemedyQuestionIntent>();
  const push = (intent: RemedyQuestionIntent, pattern: RegExp) => {
    if (pattern.test(normalized)) {
      intents.add(intent);
    }
  };

  push("mantra_prayer", /\bmantra|prayer|japa|stotra|chant|chanting\b/i);
  push("charity_daan", /\bcharity|daan|donation|giving|service\b/i);
  push("fasting_discipline", /\bfasting|vrat|discipline|daily discipline\b/i);
  push("puja_guidance", /\bpuja|pooja|homa|havan|ritual\b/i);
  push("daily_spiritual_practice", /\bdaily practice|spiritual discipline|sadhana|routine\b/i);
  push("graha_related", /\bgraha|planet|sun|moon|mars|mercury|jupiter|venus|saturn|rahu|ketu\b/i);
  push(
    "gemstone_rudraksha_yantra",
    /\bgemstone|gem stones?|rudraksha|yantra|mala|beads?\b/i
  );
  push("lifestyle_correction", /\blifestyle|habit|routine|behavior|correction\b/i);
  push("consultation_shop", /\bconsultation|shop|buy|purchase|product\b/i);

  if (!intents.size) {
    intents.add("daily_spiritual_practice");
  }

  return Array.from(intents);
}

function normalizeConfidence(
  value: unknown,
  fallback: AstrologyAssistantConfidence
): AstrologyAssistantConfidence {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }

  return fallback;
}

function normalizeText(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().replace(/\n{3,}/g, "\n\n");

  return normalized || fallback;
}

function stripFence(value: string) {
  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

  return fenced?.[1]?.trim() ?? value.trim();
}

function parseStructuredResponse(
  value: string,
  fallback: AstrologyAssistantStructuredResponse
): AstrologyAssistantStructuredResponse {
  const normalized = stripFence(value);

  try {
    const parsed = JSON.parse(normalized) as Partial<AstrologyAssistantStructuredResponse>;

    return {
      answer: normalizeText(parsed.answer, fallback.answer),
      reasoning: normalizeText(parsed.reasoning, fallback.reasoning),
      confidence: normalizeConfidence(parsed.confidence, fallback.confidence),
    };
  } catch {
    const [first, second] = normalized
      .split(/\n{2,}/)
      .map((segment) => segment.trim())
      .filter(Boolean);

    return {
      answer: first ?? fallback.answer,
      reasoning: second ?? fallback.reasoning,
      confidence: fallback.confidence,
    };
  }
}

function buildStructuredPromptInstructions(baseSystemPrompt: string) {
  return [
    baseSystemPrompt,
    "Return only valid JSON. No markdown.",
    'JSON schema: {"answer":"string","reasoning":"string","confidence":"high|medium|low"}.',
    "Use confidence=high only when chart verification is VERIFIED and context is specific.",
    "Use confidence=medium when context is partial or generalized.",
    "Use confidence=low when context is weak or uncertain.",
    "Keep answer and reasoning grounded strictly to supplied chart context and tools.",
  ].join("\n");
}

function buildPlanScopedInstructions(planType: AstrologyAssistantEngineInput["planType"]) {
  if (planType === "PRO") {
    return [
      "Deliver deeper multi-house synthesis when context supports it.",
      "You may include forward-looking timing framing, but avoid certainty language.",
      "Include grounded remedy direction only when approved remedy context exists, and keep gemstone or product suggestions consultative and optional.",
    ].join("\n");
  }

  if (planType === "PREMIUM") {
    return [
      "Deliver deeper chart reasoning than free tier with practical context.",
      "Use multi-house analysis where relevant and available.",
      "Include grounded remedy direction only when approved remedy context exists, and keep gemstone or product suggestions consultative and optional.",
    ].join("\n");
  }

  return [
    "Free-tier response: keep concise and clear.",
    "Use short grounded answer with compact reasoning.",
    "Do not include long-range predictive detail in free-tier mode.",
  ].join("\n");
}

function getPlanTemperature(planType: AstrologyAssistantEngineInput["planType"]) {
  if (planType === "PRO") {
    return 0.1;
  }

  if (planType === "PREMIUM") {
    return 0.15;
  }

  return 0.1;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function classifyQuestionDomains(question: string) {
  const normalized = question.toLowerCase();
  const domains = new Set<string>();
  const push = (label: string, pattern: RegExp) => {
    if (pattern.test(normalized)) {
      domains.add(label);
    }
  };

  push("career", /\bcareer|job|profession|promotion|work\b/i);
  push(
    "marriage",
    /\bmarriage|partner|relationship|spouse|love|compatibility|matchmaking|guna milan|wedding|divorce|breakup|separation|remarriage|second marriage|love marriage|arranged marriage\b/i
  );
  push("finance", /\bfinance|money|wealth|income|business profit|investment\b/i);
  push(
    "health",
    /\bhealth|wellbeing|well-being|wellness|stress|sleep|energy|vitality|routine|rest|fatigue|burnout|anxiety|emotional balance|emotional distress|emotionally disturbed|mental health|mentally exhausted\b/i
  );
  push("education", /\beducation|study|exam|learning|academic\b/i);
  push("business", /\bbusiness|trade|entrepreneur|venture\b/i);
  push("family", /\bfamily|parents|children|home\b/i);
  push("daily_guidance", /\b(today|today's|daily|tomorrow|tonight|this week|how is my day|what should i focus on today|what should i avoid today|best time|auspicious time|lucky color|lucky number|lucky time|caution window)\b/i);
  push("spiritual_growth", /\bspiritual|sadhana|mantra|dharma|inner growth\b/i);
  push(
    "current_life_period",
    /\bcurrent|now|this period|dasha|transit|timing|phase\b/i
  );

  if (!domains.size) {
    domains.add("general_chart");
  }

  return Array.from(domains);
}

const rashifalSlugMap: Record<string, string> = {
  aries: "aries",
  taurus: "taurus",
  gemini: "gemini",
  cancer: "cancer",
  leo: "leo",
  virgo: "virgo",
  libra: "libra",
  scorpio: "scorpio",
  sagittarius: "sagittarius",
  capricorn: "capricorn",
  aquarius: "aquarius",
  pisces: "pisces",
};

function toRashifalSlug(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase().replace(/[\s_-]+/g, "");
  const directMatch = normalized in rashifalSlugMap ? normalized : null;

  return directMatch ?? null;
}

function buildDailyRashifalSnapshot(
  chartContext: ChartAiContext
): DailyRashifalSnapshot | null {
  const preferredSign = toRashifalSlug(chartContext.moonSign) ?? toRashifalSlug(chartContext.lagna.sign);

  if (!preferredSign) {
    return null;
  }

  const sign = getRashifalSignBySlug(preferredSign);

  if (!sign) {
    return null;
  }

  return {
    signSlug: sign.slug,
    signName: sign.name,
    shortPrediction: sign.shortPrediction,
    luckyColor: sign.luckyColor,
    luckyNumber: sign.luckyNumber,
    luckyTime: sign.luckyTime,
  };
}

function classifyCareerQuestionIntent(question: string): CareerQuestionIntent[] {
  const normalized = question.toLowerCase();
  const intents = new Set<CareerQuestionIntent>();
  const push = (intent: CareerQuestionIntent, pattern: RegExp) => {
    if (pattern.test(normalized)) {
      intents.add(intent);
    }
  };

  push("job_service", /\bjob|service|employment|office|salary|interview\b/i);
  push("business", /\bbusiness|startup|venture|entrepreneur|self[-\s]?employ\b/i);
  push("career_growth", /\bcareer growth|career path|long[-\s]?term career|progress\b/i);
  push("job_change", /\bjob change|switch|transition|change job|new role\b/i);
  push("promotion", /\bpromotion|appraisal|raise|recognition\b/i);
  push(
    "government_private_job",
    /\bgovernment job|govt|public sector|private job|corporate\b/i
  );
  push("study_to_career", /\bstudy|education|degree|course|learning|campus\b/i);
  push(
    "obstacles_work_pressure",
    /\bobstacle|delay|pressure|work stress|competition|block\b/i
  );
  push(
    "income_gains",
    /\bincome|earning|salary growth|gains|network|profit|resources\b/i
  );
  push(
    "professional_reputation",
    /\breputation|public image|authority|status|visibility\b/i
  );

  if (!intents.size) {
    intents.add("general_career");
  }

  return Array.from(intents);
}

function classifyEducationQuestionIntent(question: string): EducationQuestionIntent[] {
  const normalized = question.toLowerCase();
  const intents = new Set<EducationQuestionIntent>();
  const push = (intent: EducationQuestionIntent, pattern: RegExp) => {
    if (pattern.test(normalized)) {
      intents.add(intent);
    }
  };

  push("basic_education", /\b(school|college|university|education|study)\b/i);
  push(
    "subject_choice",
    /\b(subject choice|which subject|stream|major|course choice|what to study)\b/i
  );
  push("higher_studies", /\b(higher study|higher studies|postgraduate|masters|phd|research)\b/i);
  push(
    "competitive_exams",
    /\b(competitive exam|entrance exam|exam|exams|rank|ranking|pass|fail|score)\b/i
  );
  push(
    "concentration_memory",
    /\b(concentration|focus|memory|retention|attention|study focus)\b/i
  );
  push("study_routine", /\b(study routine|revision|timetable|schedule|daily study)\b/i);
  push("admission_timing", /\b(admission|entrance|enrol|enroll|application|deadline)\b/i);
  push(
    "academic_pressure",
    /\b(academic pressure|exam pressure|study stress|pressure|anxiety|failure anxiety)\b/i
  );
  push(
    "learning_obstacles",
    /\b(learning obstacle|learning difficulty|struggle with study|cannot study|distract)\b/i
  );
  push("study_to_career", /\bstudy to career|study[-\s]?career|career direction\b/i);
  push("education_remedy", /\b(education remedy|study remedy|remedy for study|remedy for exam)\b/i);

  if (!intents.size) {
    intents.add("general_education");
  }

  return Array.from(intents);
}

function classifyBusinessQuestionIntent(question: string): BusinessQuestionIntent[] {
  const normalized = question.toLowerCase();
  const intents = new Set<BusinessQuestionIntent>();
  const push = (intent: BusinessQuestionIntent, pattern: RegExp) => {
    if (pattern.test(normalized)) {
      intents.add(intent);
    }
  };

  push("business_suitability", /\bbusiness suitability|suitable for business|business or job|should i do business\b/i);
  push("job_vs_business", /\bjob vs business|business vs job|job or business|service or business\b/i);
  push("side_business", /\bside business|part-time business|small business|small venture\b/i);
  push("startup", /\bstartup|new venture|launch|found(?:ing|er)|begin a business\b/i);
  push("partnership", /\bpartnership|partner|cofounder|co-founder|joint venture\b/i);
  push("client_growth", /\bclient|customer|sales growth|customer growth|lead generation\b/i);
  push("trade_commerce", /\btrade|commerce|retail|wholesale|distribution|market\b/i);
  push("investment_risk", /\binvestment|invest|risk|capital|funding|venture capital\b/i);
  push("debt_loan_pressure", /\bdebt|loan|loan pressure|borrow|borrowing|repayment\b/i);
  push("profit_timing", /\bprofit timing|business profit|when.*profit|cash flow\b/i);
  push("expansion", /\bexpansion|scale|scaling|growth|grow the business\b/i);
  push("foreign_business", /\bforeign business|overseas|export|import|international\b/i);
  push("family_business", /\bfamily business|family venture|business with family\b/i);
  push("business_remedy", /\bbusiness remedy|remedy for business|business upay|upaya for business\b/i);

  if (!intents.size) {
    intents.add("general_business");
  }

  return Array.from(intents);
}

function classifyFinanceQuestionIntent(question: string): FinanceQuestionIntent[] {
  const normalized = question.toLowerCase();
  const intents = new Set<FinanceQuestionIntent>();
  const push = (intent: FinanceQuestionIntent, pattern: RegExp) => {
    if (pattern.test(normalized)) {
      intents.add(intent);
    }
  };

  push("income", /\b(income|salary|earnings|cash flow|cashflow|income growth)\b/i);
  push("savings", /\b(savings|save|saving|reserve|emergency fund)\b/i);
  push("expenses", /\b(expense|expenses|spending|spend|outflow|costs?)\b/i);
  push("debt", /\b(debt|loan|loans|borrowing|repayment|emi|interest burden)\b/i);
  push("wealth_growth", /\b(wealth|wealth growth|net worth|assets|accumulation)\b/i);
  push("business_profit", /\b(business profit|profit|margin|revenue|turnover|cash flow|cashflow)\b/i);
  push("investment_risk", /\b(invest|investment|portfolio|stocks?|crypto|trading|speculation|risk)\b/i);
    push("financial_timing", /\b(timing|period|phase|cycle|dasha|transit|now|current|financial)\b/i);
  push("sudden_gain_loss", /\b(sudden gain|sudden loss|unexpected gain|unexpected loss)\b/i);
  push("financial_discipline", /\b(discipline|budget|budgeting|planning|control|prudence)\b/i);

  if (!intents.size) {
    intents.add("general_finance");
  }

  return Array.from(intents);
}

function classifyHealthQuestionIntent(question: string): HealthQuestionIntent[] {
  const normalized = question.toLowerCase();
  const intents = new Set<HealthQuestionIntent>();
  const push = (intent: HealthQuestionIntent, pattern: RegExp) => {
    if (pattern.test(normalized)) {
      intents.add(intent);
    }
  };

  push("general_wellness", /\bwellness|well-being|wellbeing|health\b/i);
  push("stress", /\bstress|pressure|overwhelm|burnout|anxious|anxiety\b/i);
  push("sleep", /\bsleep|insomnia|rest|restless|fatigue\b/i);
  push("energy_vitality", /\benergy|vitality|strength|weakness|low energy\b/i);
  push("emotional_balance", /\bemotional|mood|balance|inner calm|peace\b/i);
  push("emotional_distress", /\bemotional distress|emotionally disturbed|distressed\b/i);
  push("routine_discipline", /\broutine|discipline|habit|lifestyle|daily\b/i);
  push("health_caution_period", /\bcaution|sensitive period|health period|health timing\b/i);
  push("spiritual_lifestyle_support", /\bprayer|mantra|meditation|charity|spiritual\b/i);
  push("medical_concern", /\bmedical|symptom|symptoms|illness|disease|doctor\b/i);
  push("mental_distress", /\bmental|distress|hopeless|depressed|depression|panic\b/i);
  push("emergency_self_harm_risk", /\bself[-\s]?harm|suicid|hurt myself|unsafe|emergency\b/i);

  if (!intents.size) {
    intents.add("general_health");
  }

  return Array.from(intents);
}

function buildCareerHouseContext(chartContext: ChartAiContext) {
  const careerHouses = [10, 6, 2, 11, 5, 9, 7] as const;
  const housePlacementsByHouse = new Map(
    chartContext.housePlacements.map((house) => [house.house, house])
  );
  const houseLordshipByHouse = new Map(
    chartContext.houseLordship.map((house) => [house.house, house])
  );

  return careerHouses.map((houseNumber) => {
    const placement = housePlacementsByHouse.get(houseNumber);
    const lordship = houseLordshipByHouse.get(houseNumber);

    return {
      house: houseNumber,
      sign: placement?.sign ?? lordship?.sign ?? null,
      ruler: lordship?.ruler ?? null,
      occupants: placement?.occupants ?? [],
    };
      });
  }

function buildFinanceHouseContext(chartContext: ChartAiContext) {
  const financeHouses = [2, 11, 5, 8, 6, 9, 10, 12] as const;
  const housePlacementsByHouse = new Map(
    chartContext.housePlacements.map((house) => [house.house, house])
  );
  const houseLordshipByHouse = new Map(
    chartContext.houseLordship.map((house) => [house.house, house])
  );
  const jupiterPlacement = getPlanetPlacement(chartContext, "JUPITER");
  const venusPlacement = getPlanetPlacement(chartContext, "VENUS");
  const saturnPlacement = getPlanetPlacement(chartContext, "SATURN");
  const mercuryPlacement = getPlanetPlacement(chartContext, "MERCURY");

  return {
    focus_houses: financeHouses.map((houseNumber) => {
      const placement = housePlacementsByHouse.get(houseNumber);
      const lordship = houseLordshipByHouse.get(houseNumber);

      return {
        house: houseNumber,
        sign: placement?.sign ?? lordship?.sign ?? null,
        ruler: lordship?.ruler ?? null,
        occupants: placement?.occupants ?? [],
      };
    }),
    wealth_planets: {
      jupiter: jupiterPlacement
        ? {
            sign: jupiterPlacement.sign,
            house: jupiterPlacement.house,
            nakshatra: jupiterPlacement.nakshatra,
            pada: jupiterPlacement.pada,
            is_retrograde: jupiterPlacement.isRetrograde,
            is_combust: jupiterPlacement.isCombust,
          }
        : null,
      venus: venusPlacement
        ? {
            sign: venusPlacement.sign,
            house: venusPlacement.house,
            nakshatra: venusPlacement.nakshatra,
            pada: venusPlacement.pada,
            is_retrograde: venusPlacement.isRetrograde,
            is_combust: venusPlacement.isCombust,
          }
        : null,
      saturn: saturnPlacement
        ? {
            sign: saturnPlacement.sign,
            house: saturnPlacement.house,
            nakshatra: saturnPlacement.nakshatra,
            pada: saturnPlacement.pada,
            is_retrograde: saturnPlacement.isRetrograde,
            is_combust: saturnPlacement.isCombust,
          }
        : null,
      mercury: mercuryPlacement
        ? {
            sign: mercuryPlacement.sign,
            house: mercuryPlacement.house,
            nakshatra: mercuryPlacement.nakshatra,
            pada: mercuryPlacement.pada,
            is_retrograde: mercuryPlacement.isRetrograde,
            is_combust: mercuryPlacement.isCombust,
          }
        : null,
    },
  };
}

function buildEducationHouseContext(chartContext: ChartAiContext) {
  const educationHouses = [4, 5, 9, 2, 3, 6, 10] as const;
  const housePlacementsByHouse = new Map(
    chartContext.housePlacements.map((house) => [house.house, house])
  );
  const houseLordshipByHouse = new Map(
    chartContext.houseLordship.map((house) => [house.house, house])
  );
  const mercuryPlacement = getPlanetPlacement(chartContext, "MERCURY");
  const jupiterPlacement = getPlanetPlacement(chartContext, "JUPITER");
  const moonPlacement = getPlanetPlacement(chartContext, "MOON");
  const saturnPlacement = getPlanetPlacement(chartContext, "SATURN");
  const marsPlacement = getPlanetPlacement(chartContext, "MARS");

  return {
    focus_houses: educationHouses.map((houseNumber) => {
      const placement = housePlacementsByHouse.get(houseNumber);
      const lordship = houseLordshipByHouse.get(houseNumber);

      return {
        house: houseNumber,
        sign: placement?.sign ?? lordship?.sign ?? null,
        ruler: lordship?.ruler ?? null,
        occupants: placement?.occupants ?? [],
      };
    }),
    learning_planets: {
      mercury: mercuryPlacement
        ? {
            sign: mercuryPlacement.sign,
            house: mercuryPlacement.house,
            nakshatra: mercuryPlacement.nakshatra,
            pada: mercuryPlacement.pada,
            is_retrograde: mercuryPlacement.isRetrograde,
            is_combust: mercuryPlacement.isCombust,
          }
        : null,
      jupiter: jupiterPlacement
        ? {
            sign: jupiterPlacement.sign,
            house: jupiterPlacement.house,
            nakshatra: jupiterPlacement.nakshatra,
            pada: jupiterPlacement.pada,
            is_retrograde: jupiterPlacement.isRetrograde,
            is_combust: jupiterPlacement.isCombust,
          }
        : null,
      moon: moonPlacement
        ? {
            sign: moonPlacement.sign,
            house: moonPlacement.house,
            nakshatra: moonPlacement.nakshatra,
            pada: moonPlacement.pada,
            is_retrograde: moonPlacement.isRetrograde,
            is_combust: moonPlacement.isCombust,
          }
        : null,
      saturn: saturnPlacement
        ? {
            sign: saturnPlacement.sign,
            house: saturnPlacement.house,
            nakshatra: saturnPlacement.nakshatra,
            pada: saturnPlacement.pada,
            is_retrograde: saturnPlacement.isRetrograde,
            is_combust: saturnPlacement.isCombust,
          }
        : null,
      mars: marsPlacement
        ? {
            sign: marsPlacement.sign,
            house: marsPlacement.house,
            nakshatra: marsPlacement.nakshatra,
            pada: marsPlacement.pada,
            is_retrograde: marsPlacement.isRetrograde,
            is_combust: marsPlacement.isCombust,
          }
        : null,
    },
  };
}

function buildBusinessHouseContext(chartContext: ChartAiContext) {
  const businessHouses = [7, 10, 11, 2, 3, 5, 6, 8, 9, 12] as const;
  const housePlacementsByHouse = new Map(
    chartContext.housePlacements.map((house) => [house.house, house])
  );
  const houseLordshipByHouse = new Map(
    chartContext.houseLordship.map((house) => [house.house, house])
  );
  const mercuryPlacement = getPlanetPlacement(chartContext, "MERCURY");
  const saturnPlacement = getPlanetPlacement(chartContext, "SATURN");
  const marsPlacement = getPlanetPlacement(chartContext, "MARS");
  const jupiterPlacement = getPlanetPlacement(chartContext, "JUPITER");
  const venusPlacement = getPlanetPlacement(chartContext, "VENUS");

  return {
    focus_houses: businessHouses.map((houseNumber) => {
      const placement = housePlacementsByHouse.get(houseNumber);
      const lordship = houseLordshipByHouse.get(houseNumber);

      return {
        house: houseNumber,
        sign: placement?.sign ?? lordship?.sign ?? null,
        ruler: lordship?.ruler ?? null,
        occupants: placement?.occupants ?? [],
      };
    }),
    commerce_planets: {
      mercury: mercuryPlacement
        ? {
            sign: mercuryPlacement.sign,
            house: mercuryPlacement.house,
            nakshatra: mercuryPlacement.nakshatra,
            pada: mercuryPlacement.pada,
            is_retrograde: mercuryPlacement.isRetrograde,
            is_combust: mercuryPlacement.isCombust,
          }
        : null,
      saturn: saturnPlacement
        ? {
            sign: saturnPlacement.sign,
            house: saturnPlacement.house,
            nakshatra: saturnPlacement.nakshatra,
            pada: saturnPlacement.pada,
            is_retrograde: saturnPlacement.isRetrograde,
            is_combust: saturnPlacement.isCombust,
          }
        : null,
      mars: marsPlacement
        ? {
            sign: marsPlacement.sign,
            house: marsPlacement.house,
            nakshatra: marsPlacement.nakshatra,
            pada: marsPlacement.pada,
            is_retrograde: marsPlacement.isRetrograde,
            is_combust: marsPlacement.isCombust,
          }
        : null,
      jupiter: jupiterPlacement
        ? {
            sign: jupiterPlacement.sign,
            house: jupiterPlacement.house,
            nakshatra: jupiterPlacement.nakshatra,
            pada: jupiterPlacement.pada,
            is_retrograde: jupiterPlacement.isRetrograde,
            is_combust: jupiterPlacement.isCombust,
          }
        : null,
      venus: venusPlacement
        ? {
            sign: venusPlacement.sign,
            house: venusPlacement.house,
            nakshatra: venusPlacement.nakshatra,
            pada: venusPlacement.pada,
            is_retrograde: venusPlacement.isRetrograde,
            is_combust: venusPlacement.isCombust,
          }
        : null,
    },
  };
}

function buildHealthHouseContext(chartContext: ChartAiContext) {
  const healthHouses = [1, 6, 8, 12] as const;
  const housePlacementsByHouse = new Map(
    chartContext.housePlacements.map((house) => [house.house, house])
  );
  const houseLordshipByHouse = new Map(
    chartContext.houseLordship.map((house) => [house.house, house])
  );
  const sunPlacement = getPlanetPlacement(chartContext, "SUN");
  const moonPlacement = getPlanetPlacement(chartContext, "MOON");
  const marsPlacement = getPlanetPlacement(chartContext, "MARS");
  const saturnPlacement = getPlanetPlacement(chartContext, "SATURN");
  const mercuryPlacement = getPlanetPlacement(chartContext, "MERCURY");
  const jupiterPlacement = getPlanetPlacement(chartContext, "JUPITER");
  const venusPlacement = getPlanetPlacement(chartContext, "VENUS");

  return {
    focus_houses: healthHouses.map((houseNumber) => {
      const placement = housePlacementsByHouse.get(houseNumber);
      const lordship = houseLordshipByHouse.get(houseNumber);

      return {
        house: houseNumber,
        sign: placement?.sign ?? lordship?.sign ?? null,
        ruler: lordship?.ruler ?? null,
        occupants: placement?.occupants ?? [],
      };
    }),
    wellness_planets: {
      sun: sunPlacement
        ? {
            sign: sunPlacement.sign,
            house: sunPlacement.house,
            nakshatra: sunPlacement.nakshatra,
            pada: sunPlacement.pada,
            is_retrograde: sunPlacement.isRetrograde,
            is_combust: sunPlacement.isCombust,
          }
        : null,
      moon: moonPlacement
        ? {
            sign: moonPlacement.sign,
            house: moonPlacement.house,
            nakshatra: moonPlacement.nakshatra,
            pada: moonPlacement.pada,
            is_retrograde: moonPlacement.isRetrograde,
            is_combust: moonPlacement.isCombust,
          }
        : null,
      mars: marsPlacement
        ? {
            sign: marsPlacement.sign,
            house: marsPlacement.house,
            nakshatra: marsPlacement.nakshatra,
            pada: marsPlacement.pada,
            is_retrograde: marsPlacement.isRetrograde,
            is_combust: marsPlacement.isCombust,
          }
        : null,
      saturn: saturnPlacement
        ? {
            sign: saturnPlacement.sign,
            house: saturnPlacement.house,
            nakshatra: saturnPlacement.nakshatra,
            pada: saturnPlacement.pada,
            is_retrograde: saturnPlacement.isRetrograde,
            is_combust: saturnPlacement.isCombust,
          }
        : null,
      mercury: mercuryPlacement
        ? {
            sign: mercuryPlacement.sign,
            house: mercuryPlacement.house,
            nakshatra: mercuryPlacement.nakshatra,
            pada: mercuryPlacement.pada,
            is_retrograde: mercuryPlacement.isRetrograde,
            is_combust: mercuryPlacement.isCombust,
          }
        : null,
      jupiter: jupiterPlacement
        ? {
            sign: jupiterPlacement.sign,
            house: jupiterPlacement.house,
            nakshatra: jupiterPlacement.nakshatra,
            pada: jupiterPlacement.pada,
            is_retrograde: jupiterPlacement.isRetrograde,
            is_combust: jupiterPlacement.isCombust,
          }
        : null,
      venus: venusPlacement
        ? {
            sign: venusPlacement.sign,
            house: venusPlacement.house,
            nakshatra: venusPlacement.nakshatra,
            pada: venusPlacement.pada,
            is_retrograde: venusPlacement.isRetrograde,
            is_combust: venusPlacement.isCombust,
          }
        : null,
    },
  };
}

function classifyRelationshipQuestionIntent(
  question: string
): RelationshipQuestionIntent[] {
  const normalized = question.toLowerCase();
  const intents = new Set<RelationshipQuestionIntent>();
  const push = (intent: RelationshipQuestionIntent, pattern: RegExp) => {
    if (pattern.test(normalized)) {
      intents.add(intent);
    }
  };

  push("marriage_timing", /\bmarriage timing|when (?:will|can|should).{0,20}marry|wedding timing|marriage date\b/i);
  push("relationship_stability", /\bstable|stability|long[-\s]?term relationship|will it last|relationship harmony\b/i);
  push("compatibility", /\bcompatibility|matchmaking|guna milan|kundli matching|match score\b/i);
  push("partner_nature", /\bpartner nature|future spouse|spouse nature|life partner|partner character\b/i);
  push("marriage_delay", /\bdelay in marriage|late marriage|marriage delay\b/i);
  push("family_involvement", /\bfamily|parents|in[-\s]?laws|approval|support\b/i);
  push("emotional_harmony", /\bemotional|harmony|understanding|communication|bond\b/i);
  push("conflict_caution", /\bconflict|fight|argument|distance|tension|caution\b/i);
  push("breakup_divorce_fear", /\bbreakup|divorce|separation|split|ending\b/i);
  push("love_vs_arranged", /\blove marriage|arranged marriage\b/i);
  push("second_marriage", /\bsecond marriage|remarriage\b/i);
  push(
    "consultation_report_guidance",
    /\breport|consultation|session|expert|advisor\b/i
  );

  if (!intents.size) {
    intents.add("general_relationship");
  }

  return Array.from(intents);
}

function getPlanetPlacement(
  chartContext: ChartAiContext,
  body: PlanetaryBody
) {
  return chartContext.rashiPlacements.find((placement) => placement.body === body) ?? null;
}

function buildRelationshipHouseContext(chartContext: ChartAiContext) {
  const relationshipHouses = [7, 2, 4, 5, 8, 11] as const;
  const housePlacementsByHouse = new Map(
    chartContext.housePlacements.map((house) => [house.house, house])
  );
  const houseLordshipByHouse = new Map(
    chartContext.houseLordship.map((house) => [house.house, house])
  );
  const venusPlacement = getPlanetPlacement(chartContext, "VENUS");
  const jupiterPlacement = getPlanetPlacement(chartContext, "JUPITER");

  return {
    focus_houses: relationshipHouses.map((houseNumber) => {
      const placement = housePlacementsByHouse.get(houseNumber);
      const lordship = houseLordshipByHouse.get(houseNumber);

      return {
        house: houseNumber,
        sign: placement?.sign ?? lordship?.sign ?? null,
        ruler: lordship?.ruler ?? null,
        occupants: placement?.occupants ?? [],
      };
    }),
    venus: venusPlacement
      ? {
          sign: venusPlacement.sign,
          house: venusPlacement.house,
          nakshatra: venusPlacement.nakshatra,
          pada: venusPlacement.pada,
          is_retrograde: venusPlacement.isRetrograde,
          is_combust: venusPlacement.isCombust,
        }
      : null,
    jupiter: jupiterPlacement
      ? {
          sign: jupiterPlacement.sign,
          house: jupiterPlacement.house,
          nakshatra: jupiterPlacement.nakshatra,
          pada: jupiterPlacement.pada,
          is_retrograde: jupiterPlacement.isRetrograde,
          is_combust: jupiterPlacement.isCombust,
        }
      : null,
  };
}

function toAskChartToolContextSlice(
  toolContext: unknown
): AskChartToolContextSlice | null {
  if (!isRecord(toolContext)) {
    return null;
  }

  return {
    transitSnapshot: isRecord(toolContext.transitSnapshot)
      ? (toolContext.transitSnapshot as AskChartToolContextSlice["transitSnapshot"])
      : null,
    dailyPanchangSnapshot: isRecord(toolContext.dailyPanchangSnapshot)
      ? (toolContext.dailyPanchangSnapshot as AskChartToolContextSlice["dailyPanchangSnapshot"])
      : null,
    chartSummaryFacts: isRecord(toolContext.chartSummaryFacts)
      ? (toolContext.chartSummaryFacts as AskChartToolContextSlice["chartSummaryFacts"])
      : null,
    predictiveAssistantContext: isRecord(toolContext.predictiveAssistantContext)
      ? (toolContext.predictiveAssistantContext as PredictiveAssistantContextSlice)
      : null,
    approvedRemedies: isRecord(toolContext.approvedRemedies)
      ? (toolContext.approvedRemedies as AskChartToolContextSlice["approvedRemedies"])
      : null,
    relatedProducts: isRecord(toolContext.relatedProducts)
      ? (toolContext.relatedProducts as AskChartToolContextSlice["relatedProducts"])
      : null,
    consultationContext: isRecord(toolContext.consultationContext)
      ? (toolContext.consultationContext as AskChartToolContextSlice["consultationContext"])
      : null,
  };
}

function mapJyotishContextForPrompt(input: AstrologyAssistantEngineInput) {
  const toolContext = toAskChartToolContextSlice(input.toolContext);
  const predictive = toolContext?.predictiveAssistantContext ?? null;
  const transitSnapshot = toolContext?.transitSnapshot ?? null;
  const dailyPanchangSnapshot = toolContext?.dailyPanchangSnapshot ?? null;
  const chartSummaryFacts = toolContext?.chartSummaryFacts ?? null;
  const detectedFocusAreas = classifyQuestionDomains(input.question);
  const hasCareerFocus =
    detectedFocusAreas.includes("career") ||
    detectedFocusAreas.includes("business");
  const hasBusinessFocus = detectedFocusAreas.includes("business");
  const hasFinanceFocus = detectedFocusAreas.includes("finance");
  const hasHealthFocus = detectedFocusAreas.includes("health");
  const hasEducationFocus = detectedFocusAreas.includes("education");
  const hasDailyGuidanceFocus = detectedFocusAreas.includes("daily_guidance");
  const hasRelationshipFocus = detectedFocusAreas.includes("marriage");
  const hasRemedyFocus =
    /\b(remedy|gemstone|gem stones?|rudraksha|yantra|puja|pooja|mala|daan|charity|mantra|prayer|japa|stotra|homa|havan|vrat|fasting|upay|upaya|spiritual discipline)\b/i.test(
      input.question
    );
  const dailyRashifalSnapshot = hasDailyGuidanceFocus
    ? buildDailyRashifalSnapshot(input.chartContext)
    : null;
  const careerQuestionIntent = hasCareerFocus
    ? classifyCareerQuestionIntent(input.question)
    : [];
  const businessQuestionIntent = hasBusinessFocus
    ? classifyBusinessQuestionIntent(input.question)
    : [];
  const educationQuestionIntent = hasEducationFocus
    ? classifyEducationQuestionIntent(input.question)
    : [];
  const financeQuestionIntent = hasFinanceFocus
    ? classifyFinanceQuestionIntent(input.question)
    : [];
  const healthQuestionIntent = hasHealthFocus
    ? classifyHealthQuestionIntent(input.question)
    : [];
  const relationshipQuestionIntent = hasRelationshipFocus
    ? classifyRelationshipQuestionIntent(input.question)
    : [];
  const remedyQuestionIntent = hasRemedyFocus
    ? classifyRemedyQuestionIntent(input.question)
    : [];

  return {
    user_profile: {
      name: input.userName,
      plan_type: input.planType,
      preferred_language: input.preferredLanguageLabel,
    },
    user_question: {
      text: input.question,
      detected_focus_areas: detectedFocusAreas,
      career_question_intent: careerQuestionIntent,
      business_question_intent: businessQuestionIntent,
      education_question_intent: educationQuestionIntent,
      finance_question_intent: financeQuestionIntent,
      health_question_intent: healthQuestionIntent,
      relationship_question_intent: relationshipQuestionIntent,
      remedy_question_intent: remedyQuestionIntent,
      grounded_scope: input.groundedScope,
    },
    jyotish_core_context: {
      lagna: input.chartContext.lagna,
      moon_sign: input.chartContext.moonSign,
      sun_sign: input.chartContext.sunSign ?? null,
      planetary_positions: input.chartContext.rashiPlacements.slice(0, 9),
      house_placements: input.chartContext.housePlacements.slice(0, 12),
      house_lordship: input.chartContext.houseLordship.slice(0, 12),
      sign_lordship: input.chartContext.signLordship.slice(0, 12),
    },
      timing_context: {
        dasha_chain: predictive?.active_period_context?.active_chain ?? [],
        mahadasha: predictive?.active_period_context?.mahadasha ?? null,
        antardasha: predictive?.active_period_context?.antardasha ?? null,
        pratyantar: predictive?.active_period_context?.pratyantar ?? null,
      day_dasha: predictive?.active_period_context?.day_dasha ?? null,
      next_transition_at: predictive?.active_period_context?.next_transition_at ?? null,
      next_transition_level:
        predictive?.active_period_context?.next_transition_level ?? null,
    },
    transit_context: {
      active_transits: transitSnapshot?.transits?.slice(0, 5) ?? [],
      key_aspects: transitSnapshot?.aspects?.slice(0, 4) ?? [],
    },
    yoga_rule_context: {
      dominant_planets: predictive?.dominant_planets ?? [],
      dominant_houses: predictive?.dominant_houses ?? [],
      supportive_factors: predictive?.supportive_factors?.slice(0, 6) ?? [],
      pressure_factors: predictive?.pressure_factors?.slice(0, 6) ?? [],
      timing_focus: predictive?.timing_focus ?? [],
        predictive_confidence: predictive?.confidence ?? null,
      },
      daily_prediction_context: {
        requested_focus: hasDailyGuidanceFocus,
        chart_identity: {
          lagna_sign: input.chartContext.lagna.sign,
          moon_sign: input.chartContext.moonSign,
          sun_sign: input.chartContext.sunSign ?? null,
        },
        timing_context: {
          dasha_chain: predictive?.active_period_context?.active_chain ?? [],
          day_dasha: predictive?.active_period_context?.day_dasha ?? null,
          next_transition_at: predictive?.active_period_context?.next_transition_at ?? null,
          next_transition_level:
            predictive?.active_period_context?.next_transition_level ?? null,
        },
        transit_context: {
          active_transits: transitSnapshot?.transits?.slice(0, 5) ?? [],
          key_aspects: transitSnapshot?.aspects?.slice(0, 4) ?? [],
        },
        panchang_context: dailyPanchangSnapshot,
        daily_rashifal_context: dailyRashifalSnapshot,
      },
      career_context: {
          focus_houses: buildCareerHouseContext(input.chartContext),
          question_intent: careerQuestionIntent,
        dominant_houses: predictive?.dominant_houses ?? [],  
        timing_focus: predictive?.timing_focus ?? [],
        supportive_factors: predictive?.supportive_factors?.slice(0, 4) ?? [],
        pressure_factors: predictive?.pressure_factors?.slice(0, 4) ?? [],
        dasha_chain: predictive?.active_period_context?.active_chain ?? [],
      },
    business_context: {
      focus_houses: buildBusinessHouseContext(input.chartContext),
      question_intent: businessQuestionIntent,
      dominant_houses: predictive?.dominant_houses ?? [],
      timing_focus: predictive?.timing_focus ?? [],
      supportive_factors: predictive?.supportive_factors?.slice(0, 4) ?? [],
      pressure_factors: predictive?.pressure_factors?.slice(0, 4) ?? [],
      dasha_chain: predictive?.active_period_context?.active_chain ?? [],
    },
    education_context: {
      focus_houses: buildEducationHouseContext(input.chartContext),
      question_intent: educationQuestionIntent,
      dominant_houses: predictive?.dominant_houses ?? [],
      timing_focus: predictive?.timing_focus ?? [],
      supportive_factors: predictive?.supportive_factors?.slice(0, 4) ?? [],
      pressure_factors: predictive?.pressure_factors?.slice(0, 4) ?? [],
      dasha_chain: predictive?.active_period_context?.active_chain ?? [],
    },
    finance_context: {
      focus_houses: buildFinanceHouseContext(input.chartContext),
      question_intent: financeQuestionIntent,
      dominant_houses: predictive?.dominant_houses ?? [],
      timing_focus: predictive?.timing_focus ?? [],
      supportive_factors: predictive?.supportive_factors?.slice(0, 4) ?? [],
      pressure_factors: predictive?.pressure_factors?.slice(0, 4) ?? [],
      dasha_chain: predictive?.active_period_context?.active_chain ?? [],
    },
    health_context: {
      focus_houses: buildHealthHouseContext(input.chartContext),
      question_intent: healthQuestionIntent,
      dominant_houses: predictive?.dominant_houses ?? [],
      timing_focus: predictive?.timing_focus ?? [],
      supportive_factors: predictive?.supportive_factors?.slice(0, 4) ?? [],
      pressure_factors: predictive?.pressure_factors?.slice(0, 4) ?? [],
      dasha_chain: predictive?.active_period_context?.active_chain ?? [],
    },
      relationship_context: {
        moon_sign: input.chartContext.moonSign,
        focus_houses: buildRelationshipHouseContext(input.chartContext),
        question_intent: relationshipQuestionIntent,
      dominant_houses: predictive?.dominant_houses ?? [],
      timing_focus: predictive?.timing_focus ?? [],
      supportive_factors: predictive?.supportive_factors?.slice(0, 4) ?? [],
      pressure_factors: predictive?.pressure_factors?.slice(0, 4) ?? [],
      dasha_chain: predictive?.active_period_context?.active_chain ?? [],
    },
    remedy_context: {
      requested_focus: hasRemedyFocus,
      question_intent: remedyQuestionIntent,
      approved_remedies: toolContext?.approvedRemedies ?? null,
      consultation_context: toolContext?.consultationContext ?? null,
      related_products: toolContext?.relatedProducts ?? null,
    },
    query_match_context: {
      matching_placements: chartSummaryFacts?.matchingPlacements?.slice(0, 4) ?? [],
      matching_houses: chartSummaryFacts?.matchingHouses?.slice(0, 4) ?? [],
      matching_aspects: chartSummaryFacts?.matchingAspects?.slice(0, 4) ?? [],
    },
    verification: input.chartContext.verification,
    warnings: input.chartContext.warnings.slice(0, 6),
  };
}

function buildCoreJyotishDirectives(input: {
  wantsDailyPrediction: boolean;
  hasRemedyFocus: boolean;
}) {
  const directives = [
    "Interpret using core Jyotish layers in sequence: natal context, dasha timing, transit influence, yoga/rule signals, then practical guidance.",
    "Map the user question into relevant life areas such as career, marriage, finance, health, education, business, family, spiritual growth, or current life period.",
    "Use Lagna, Moon sign, Sun sign (if available), planetary placements, house placements, and lordship context before general statements.",
    "If dasha or transit data is present, include a timing insight. If missing, state that timing context is limited.",
    "Keep guidance public-friendly and astrology-aware, not overly technical.",
    "Output style: answer should start with a short direct summary; reasoning should include chart basis, timing insight, practical guidance, and a safe caution when needed.",
    "For health and wellness topics, stay in wellness mode only: discuss routine, sleep, stress, energy, vitality, emotional balance, caution periods, and supportive lifestyle habits.",
    "For health and wellness topics, do not diagnose disease, prescribe or stop medicine, predict hospitalization or death, or present astrology as treatment.",
    "If symptoms, urgent warning signs, self-harm, abuse, or immediate danger are mentioned, advise qualified healthcare or emergency support promptly and stay supportive.",
    "For education and learning topics, distinguish basic education, subject choice, higher studies, competitive exams, concentration, memory, study routine, admission timing, and learning obstacles using 4th, 5th, 9th, 2nd, 3rd, 6th, and 10th house context with Mercury, Jupiter, Moon, Saturn, and Mars when available.",
    "For education and learning topics, avoid guaranteed rank, pass/fail, admission, scholarship, or exact result claims, and keep exam stress supportive and student-safe.",
    "For business and entrepreneurship topics, distinguish business suitability, job versus business, side business, startup timing, partnership, client growth, trade, expansion, foreign business, family business, and risk-aware pacing using 7th, 10th, 11th, 2nd, 3rd, 5th, 6th, 8th, 9th, and 12th house context with Mercury, Saturn, Mars, Jupiter, and Venus when available.",
    "For business and entrepreneurship topics, avoid guaranteed profit, clients, funding, expansion, or exact-date claims, and advise qualified professional help for legal, tax, or investment decisions when needed.",
      "For relationship questions, distinguish marriage timing, relationship stability, compatibility, partner nature, emotional harmony, family involvement, and caution before conclusions.",
      "For relationship questions, use 7th, 2nd, 4th, 5th, 8th, and 11th house context with Venus and Jupiter, plus current timing layers, before making any recommendation.",
      "For finance questions, distinguish income, savings, expenses, debt, wealth growth, business profit, investment risk, and financial discipline before making conclusions.",
    "For finance questions, use 2nd, 11th, 5th, 8th, 6th, 9th, 10th, and 12th house context with Jupiter, Venus, Saturn, and Mercury, plus current timing layers, before giving any recommendation.",
    "If safety, coercion, abuse, or emotional risk is mentioned, stay supportive, avoid judgment, and recommend trusted human or local professional help.",
    "For relationship and finance topics, avoid deterministic or guarantee language.",
    "For career-focused questions, prioritize 10th, 6th, 2nd, 11th, 5th, 9th, and 7th house context with relevant lords before giving conclusions.",
    "For career-focused questions, distinguish job/service tendency vs business/partnership tendency when context supports it, and state uncertainty when it does not.",
    "For career timing, use dasha and transit context to frame growth, discipline, waiting, change, stability, or effort windows without exact-date guarantees.",
    "For career guidance, include practical actions such as skill-building, communication quality, networking, preparation, and risk-aware business pacing.",
    "Mention deeper report/premium path softly only when context genuinely requires deeper continuity.",
  ];

  if (input.wantsDailyPrediction) {
    directives.push(
      "For daily personalized prediction questions, combine natal chart identity, current dasha, transit influence, Panchang timing, and approved daily sign indicators before answering.",
      "For daily prediction, clearly distinguish personalized chart-aware guidance from public Rashifal; keep the answer centered on today's focus, caution windows, and practical actions.",
      "If a lucky color, lucky number, or lucky time is available from approved daily context, present it as optional support rather than certainty.",
      "For daily prediction, avoid fear-based warnings, exact event claims, and single-factor certainty; describe the day as a guided trend, not a fixed outcome."
    );
  }

  if (input.hasRemedyFocus) {
    directives.push(
      "For remedy questions, ground the answer in approved remedy records and the supplied chart/timing context only.",
      "For remedy questions, distinguish mantra, prayer, charity, puja, fasting, disciplined routine, and graha-specific observance from gemstone, rudraksha, or yantra guidance.",
      "For remedy questions, keep gemstones, rudraksha, and yantra consultative and optional, and avoid pressure to purchase or follow any one path as mandatory.",
      "For remedy questions, avoid guaranteed outcomes, fear-based wording, and medical, financial, legal, or business cure claims.",
      "For remedy questions, suggest consultation softly only when the case is personal, serious, or product-specific."
    );
  }

  return directives;
}

function createPromptBundle(input: AstrologyAssistantEngineInput, stricter: boolean) {
  const locale = resolvePredictionLocale(
    input.preferredLocaleCode ?? input.preferredLanguageLabel
  );
  const jyotishContext = mapJyotishContextForPrompt(input);
  const wantsDailyPrediction =
    /\b(today|today's|daily|tomorrow|tonight|this week|how is my day|what should i focus on today|what should i avoid today|best time|auspicious time|lucky color|lucky number|lucky time|caution window)\b/i.test(
      input.question
    ) ||
    input.taskKind === "TRANSIT_EXPLANATION";
  const hasRemedyFocus =
    /\b(remedy|gemstone|gem stones?|rudraksha|yantra|puja|pooja|mala|daan|charity|mantra|prayer|japa|stotra|homa|havan|vrat|fasting|upay|upaya|spiritual discipline)\b/i.test(
      input.question
    );
  const baseDirectives = buildCoreJyotishDirectives({
    wantsDailyPrediction,
    hasRemedyFocus,
  });

  return buildPredictionPrompt({
    toolType: "NAVAGRAHA_CHAT",
    locale,
    baseSystemPrompt: "",
    planInstruction: buildPlanScopedInstructions(input.planType),
    preferredLanguageLabel: input.preferredLanguageLabel,
    astrologyDataSummary: {
      ...jyotishContext,
    },
    missingDataWarnings: input.chartContext.warnings,
    outputFormatRequirements: [
      "Return only valid JSON. No markdown.",
      'JSON schema: {"answer":"string","reasoning":"string","confidence":"high|medium|low"}.',
      "Use confidence=high only when chart verification is VERIFIED and context is specific.",
      "Use confidence=medium when context is partial or generalized.",
      "Use confidence=low when context is weak or uncertain.",
      "Keep answer and reasoning grounded strictly to supplied chart context and tools.",
    ],
    extraDirectives: stricter
      ? [
          ...baseDirectives,
          "Strict retry mode: remove any certainty language and keep caution-forward phrasing.",
          "Strict retry mode: avoid product or purchase pressure in any remedy mention.",
        ]
      : baseDirectives,
  });
}

export async function generateAstrologyResponse(
  input: AstrologyAssistantEngineInput
): Promise<AstrologyAssistantEngineResult> {
  const promptVersion = await resolvePromptVersionByTemplateKey(
    "ask-my-chart-copilot"
  );
  const groundedTextService = getAiGroundedTextService();
  const fallbackText = JSON.stringify(input.fallback);
  const locale = resolvePredictionLocale(
    input.preferredLocaleCode ?? input.preferredLanguageLabel
  );

  const runGeneration = async (stricter: boolean) => {
    const promptBundle = createPromptBundle(input, stricter);

    return groundedTextService.generateReply({
      taskKind: input.taskKind,
      promptTemplateKey: promptVersion.templateKey,
      promptVersionLabel: promptVersion.label,
      instructions: [
        buildStructuredPromptInstructions(promptVersion.systemPrompt),
        promptBundle.instructions,
      ].join("\n"),
      input: promptBundle.input,
      fallbackText,
      temperature: getPlanTemperature(input.planType),
    });
  };

  let response = await runGeneration(false);
  let structured = parseStructuredResponse(response.text, input.fallback);
  let validation = validateAssistantStructuredOutput({
    output: structured,
    locale,
  });

  if (!validation.valid) {
    response = await runGeneration(true);
    structured = parseStructuredResponse(response.text, input.fallback);
    validation = validateAssistantStructuredOutput({
      output: structured,
      locale,
    });

    if (!validation.valid) {
      structured = input.fallback;
    }
  }

  return {
    structured,
    providerKey: response.providerKey,
    model: response.model,
    promptTemplateKey: response.promptTemplateKey,
    promptVersionLabel: response.promptVersionLabel,
    rawText: response.text,
  };
}
