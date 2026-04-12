export type RemedyCommerceSafetyPayload = {
  optionalPurchase: true;
  optionalPurchaseLabel: string;
  nonGuaranteeNote: string;
  noPressureNote: string;
  standaloneRemedyNote: string;
};

export const remedyCommerceSafetyPolicy = {
  optionalPurchaseLabel: "Optional Support",
  relationshipFallback: "Optional contextual link only.",
  recommendationSafetyNote:
    "Suggestions are advisory and optional, with no guarantee of outcomes.",
  nonGuaranteeNote:
    "No product purchase guarantees spiritual, personal, or material outcomes.",
  noPressureNote:
    "There is no urgency or pressure to purchase any linked product.",
  standaloneRemedyNote:
    "The remedy practice can stand fully on its own without any purchase.",
  withProductsNote:
    "Related products are shown only as optional context around the remedy.",
  withoutProductsNote:
    "No product linkage is needed here. The remedy remains complete as guided practice and reflection.",
} as const;

const disallowedCommerceClaims = [
  /\bmust buy\b/i,
  /\bmust purchase\b/i,
  /\byou need to buy\b/i,
  /\bguaranteed?\b/i,
  /\bassured\b/i,
  /\bonly way\b/i,
  /\bbefore it(?:'| i)?s too late\b/i,
  /\burgent(?:ly)?\b/i,
  /\bact now\b/i,
];

export function sanitizeRemedyCommerceText(
  value: string | null | undefined,
  fallback: string
) {
  const normalized = (value ?? "").trim().replace(/\s+/g, " ");

  if (!normalized) {
    return fallback;
  }

  if (disallowedCommerceClaims.some((pattern) => pattern.test(normalized))) {
    return fallback;
  }

  return normalized;
}

export function normalizeRemedyRelationshipNote(value: string) {
  return sanitizeRemedyCommerceText(
    value,
    remedyCommerceSafetyPolicy.relationshipFallback
  );
}

export function buildRemedyProductSafety() {
  return {
    optionalPurchase: true,
    optionalPurchaseLabel: remedyCommerceSafetyPolicy.optionalPurchaseLabel,
    nonGuaranteeNote: remedyCommerceSafetyPolicy.nonGuaranteeNote,
    noPressureNote: remedyCommerceSafetyPolicy.noPressureNote,
    standaloneRemedyNote: remedyCommerceSafetyPolicy.standaloneRemedyNote,
  } satisfies RemedyCommerceSafetyPayload;
}

export function getRemedyProductMappingNote(hasLinkedProducts: boolean) {
  return hasLinkedProducts
    ? remedyCommerceSafetyPolicy.withProductsNote
    : remedyCommerceSafetyPolicy.withoutProductsNote;
}
