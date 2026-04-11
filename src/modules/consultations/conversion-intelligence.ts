export type ConsultationVisitorIntent =
  | "general-inquiry"
  | "consultation-ready"
  | "compatibility-focused"
  | "remedy-focused"
  | "returning-member-follow-up";

export type ConversionSurface =
  | "home"
  | "services"
  | "consultation"
  | "astrologer-profile";

export type ConversionAction = {
  href: string;
  label: string;
  description: string;
};

export type ConsultationIntentClassification = {
  intent: ConsultationVisitorIntent;
  confidence: "high" | "moderate";
  signals: string[];
};

export type ConsultationConversionRecommendation = {
  classification: ConsultationIntentClassification;
  intentLabel: string;
  bestNextAction: ConversionAction;
  alternateAction: ConversionAction;
  guidanceLine: string;
};

export type ConsultationConversionInput = {
  surface: ConversionSurface;
  explicitIntent?: string | null;
  contextHint?: string | null;
};

const intentLabels: Record<ConsultationVisitorIntent, string> = {
  "general-inquiry": "General Inquiry",
  "consultation-ready": "Consultation Ready",
  "compatibility-focused": "Compatibility Focused",
  "remedy-focused": "Remedy Focused",
  "returning-member-follow-up": "Returning Member / Follow-Up",
};

const defaultIntentBySurface: Record<ConversionSurface, ConsultationVisitorIntent> =
  {
    home: "general-inquiry",
    services: "consultation-ready",
    consultation: "consultation-ready",
    "astrologer-profile": "consultation-ready",
  };

function normalizeText(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function addIntentQuery(href: string, intent: ConsultationVisitorIntent) {
  if (href.includes("?")) {
    return `${href}&intent=${encodeURIComponent(intent)}`;
  }

  return `${href}?intent=${encodeURIComponent(intent)}`;
}

function containsAny(text: string, keywords: readonly string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function normalizeExplicitIntent(
  value: string | null | undefined
): ConsultationVisitorIntent | null {
  const normalized = normalizeText(value);

  switch (normalized) {
    case "general":
    case "general-inquiry":
    case "inquiry":
      return "general-inquiry";
    case "consultation":
    case "consultation-ready":
    case "ready":
    case "booking":
      return "consultation-ready";
    case "compatibility":
    case "compatibility-focused":
    case "relationship":
      return "compatibility-focused";
    case "remedy":
    case "remedy-focused":
      return "remedy-focused";
    case "returning":
    case "follow-up":
    case "followup":
    case "returning-member-follow-up":
      return "returning-member-follow-up";
    default:
      return null;
  }
}

function classifyByKeywords(
  combinedContext: string
): ConsultationVisitorIntent | null {
  if (
    containsAny(combinedContext, [
      "follow up",
      "follow-up",
      "returning",
      "existing member",
      "second session",
      "continue",
    ])
  ) {
    return "returning-member-follow-up";
  }

  if (
    containsAny(combinedContext, [
      "compatibility",
      "relationship",
      "marriage",
      "partner",
      "couple",
    ])
  ) {
    return "compatibility-focused";
  }

  if (
    containsAny(combinedContext, [
      "remedy",
      "mantra",
      "rudraksha",
      "mala",
      "gemstone",
      "yantra",
      "puja",
      "donation",
      "fasting",
    ])
  ) {
    return "remedy-focused";
  }

  if (
    containsAny(combinedContext, [
      "book",
      "reserve",
      "consultation",
      "session",
      "slot",
      "private reading",
    ])
  ) {
    return "consultation-ready";
  }

  if (containsAny(combinedContext, ["inquiry", "question", "contact"])) {
    return "general-inquiry";
  }

  return null;
}

export function classifyConsultationVisitorIntent(
  input: ConsultationConversionInput
): ConsultationIntentClassification {
  const signals: string[] = [];
  const explicitIntent = normalizeExplicitIntent(input.explicitIntent);

  if (explicitIntent) {
    signals.push(`explicit-intent:${explicitIntent}`);

    return {
      intent: explicitIntent,
      confidence: "high",
      signals,
    };
  }

  const combinedContext = `${normalizeText(input.explicitIntent)} ${normalizeText(input.contextHint)}`;
  const keywordIntent = classifyByKeywords(combinedContext);

  if (keywordIntent) {
    signals.push(`keyword-intent:${keywordIntent}`);

    return {
      intent: keywordIntent,
      confidence: "high",
      signals,
    };
  }

  const defaultIntent = defaultIntentBySurface[input.surface];
  signals.push(`surface-default:${input.surface}`);

  return {
    intent: defaultIntent,
    confidence: "moderate",
    signals,
  };
}

function buildConsultationSurfaceActions(
  intent: ConsultationVisitorIntent
): {
  bestNextAction: ConversionAction;
  alternateAction: ConversionAction;
  guidanceLine: string;
} {
  if (intent === "general-inquiry") {
    return {
      bestNextAction: {
        href: addIntentQuery("/contact", intent),
        label: "Start With A Private Inquiry",
        description:
          "Begin with a calm inquiry so the right consultation format can be selected with care.",
      },
      alternateAction: {
        href: "/joy-prakash-sarmah",
        label: "Review Astrologer Profile",
        description:
          "Review Joy Prakash Sarmah's approach before moving into booking.",
      },
      guidanceLine:
        "A short inquiry is usually the clearest first step when the scope is still open.",
    };
  }

  if (intent === "compatibility-focused") {
    return {
      bestNextAction: {
        href: "/dashboard/consultations/book?package=compatibility-session",
        label: "Reserve Compatibility Session",
        description:
          "Move directly into the compatibility format designed for relationship dynamics and timing.",
      },
      alternateAction: {
        href: addIntentQuery("/services", intent),
        label: "Review Service Structure",
        description:
          "Compare consultation formats first if you want to confirm the right level of depth.",
      },
      guidanceLine:
        "Compatibility questions are best handled through a dedicated session structure.",
    };
  }

  if (intent === "remedy-focused") {
    return {
      bestNextAction: {
        href: "/dashboard/consultations/book?package=remedy-guidance-session",
        label: "Reserve Remedy Guidance Session",
        description:
          "Choose the remedy-focused session for careful, non-fear-based spiritual guidance.",
      },
      alternateAction: {
        href: addIntentQuery("/services", intent),
        label: "Review Remedy Service Context",
        description:
          "Read the service scope first if you prefer a calmer pre-booking review.",
      },
      guidanceLine:
        "Remedy decisions are strongest when discussed with proportion and clear context.",
    };
  }

  if (intent === "returning-member-follow-up") {
    return {
      bestNextAction: {
        href: "/dashboard/consultations/book?package=follow-up-clarity-session",
        label: "Reserve Follow-Up Session",
        description:
          "Use the follow-up format when prior context already exists and a focused second pass is needed.",
      },
      alternateAction: {
        href: "/dashboard/consultations",
        label: "Review Consultation History",
        description:
          "Review prior consultation records before scheduling your next session.",
      },
      guidanceLine:
        "Follow-up sessions should refine previous context rather than restart the full process.",
    };
  }

  return {
    bestNextAction: {
      href: "/dashboard/consultations/book?package=private-reading",
      label: "Reserve Private Reading",
      description:
        "Move into a dedicated one-to-one session with clear booking and intake flow.",
    },
    alternateAction: {
      href: "/joy-prakash-sarmah",
      label: "Confirm Fit With Astrologer Profile",
      description:
        "Review approach and consultation tone before selecting a session slot.",
    },
    guidanceLine:
      "When intent is clear, moving directly to booking keeps the process calm and efficient.",
  };
}

function buildDiscoverySurfaceActions(
  intent: ConsultationVisitorIntent,
  surface: ConversionSurface
): {
  bestNextAction: ConversionAction;
  alternateAction: ConversionAction;
  guidanceLine: string;
} {
  if (intent === "compatibility-focused") {
    return {
      bestNextAction: {
        href: addIntentQuery("/consultation", intent),
        label: "View Compatibility Path",
        description:
          "Go to consultation packages with compatibility context preselected.",
      },
      alternateAction: {
        href:
          surface === "services"
            ? addIntentQuery("/joy-prakash-sarmah", intent)
            : addIntentQuery("/services", intent),
        label:
          surface === "services"
            ? "Review Astrologer Fit"
            : "Compare Service Formats",
        description:
          surface === "services"
            ? "Review profile approach before choosing a compatibility session."
            : "Review all consultation structures before choosing a package.",
      },
      guidanceLine:
        "Compatibility intent is best served by a structured path rather than generic navigation.",
    };
  }

  if (intent === "remedy-focused") {
    return {
      bestNextAction: {
        href: addIntentQuery("/consultation", intent),
        label: "View Remedy Guidance Path",
        description:
          "Go directly to remedy-oriented consultation options with careful framing.",
      },
      alternateAction: {
        href:
          surface === "services"
            ? addIntentQuery("/contact", intent)
            : addIntentQuery("/services", intent),
        label:
          surface === "services"
            ? "Send Remedy Inquiry"
            : "Review Remedy Service Scope",
        description:
          surface === "services"
            ? "Use a calm inquiry if you want manual guidance before choosing a remedy session."
            : "Confirm how remedy guidance is handled before moving into booking.",
      },
      guidanceLine:
        "Remedy conversations work best when they are context-led and intentionally paced.",
    };
  }

  if (intent === "returning-member-follow-up") {
    return {
      bestNextAction: {
        href: addIntentQuery("/consultation", intent),
        label: "Continue With Follow-Up Route",
        description:
          "Move to the consultation page with follow-up context already selected.",
      },
      alternateAction: {
        href: addIntentQuery("/contact", intent),
        label: "Send A Follow-Up Inquiry",
        description:
          "Use a short inquiry when you want support choosing the next follow-up format.",
      },
      guidanceLine:
        "Returning members benefit from continuity and focused follow-up scope.",
    };
  }

  if (intent === "consultation-ready") {
    return {
      bestNextAction: {
        href: addIntentQuery("/consultation", intent),
        label: "Move To Consultation Booking",
        description:
          "Proceed to the consultation page where package selection and booking next steps are clearly structured.",
      },
      alternateAction: {
        href:
          surface === "astrologer-profile"
            ? addIntentQuery("/consultation", "returning-member-follow-up")
            : "/joy-prakash-sarmah",
        label:
          surface === "astrologer-profile"
            ? "Returning Member Follow-Up"
            : "Review Astrologer Profile",
        description:
          surface === "astrologer-profile"
            ? "If context already exists, continue through the follow-up consultation route."
            : "Confirm fit and approach before selecting your session type.",
      },
      guidanceLine:
        "When consultation intent is clear, direct routing removes unnecessary steps.",
    };
  }

  return {
    bestNextAction: {
      href: addIntentQuery("/contact", intent),
      label: "Start A Calm Inquiry",
      description:
        "Begin with a short inquiry and route to the most suitable consultation path.",
    },
    alternateAction: {
      href: "/services",
      label: "Review Services First",
      description:
        "Explore service boundaries before choosing a consultation flow.",
    },
    guidanceLine:
      "General inquiry intent is best served with a gentle, high-clarity first step.",
  };
}

export function recommendConsultationNextAction(
  input: ConsultationConversionInput
): ConsultationConversionRecommendation {
  const classification = classifyConsultationVisitorIntent(input);
  const actions =
    input.surface === "consultation"
      ? buildConsultationSurfaceActions(classification.intent)
      : buildDiscoverySurfaceActions(classification.intent, input.surface);

  return {
    classification,
    intentLabel: intentLabels[classification.intent],
    bestNextAction: actions.bestNextAction,
    alternateAction: actions.alternateAction,
    guidanceLine: actions.guidanceLine,
  };
}
