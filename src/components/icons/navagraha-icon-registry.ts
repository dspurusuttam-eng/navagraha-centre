export type NavagrahaIconAvailability = "available" | "missing";

export type NavagrahaIconRegistryEntry = {
  featureName: string;
  sourceFilename: string | null;
  repositoryPath: string | null;
  intendedRoute: string;
  availabilityStatus: NavagrahaIconAvailability;
};

export const navagrahaIconRegistry = [
  {
    featureName: "Main brand logo",
    sourceFilename: "navagraha-centre.png",
    repositoryPath: "/brand/navagraha-centre.png",
    intendedRoute: "/",
    availabilityStatus: "available",
  },
  {
    featureName: "Home",
    sourceFilename: "HOME.png",
    repositoryPath: "/icons/navagraha/HOME.png",
    intendedRoute: "/",
    availabilityStatus: "available",
  },
  {
    featureName: "Account",
    sourceFilename: "Account.png",
    repositoryPath: "/icons/navagraha/Account.png",
    intendedRoute: "/dashboard",
    availabilityStatus: "available",
  },
  {
    featureName: "Ask NI",
    sourceFilename: "Ask-NI.png",
    repositoryPath: "/icons/navagraha/Ask-NI.png",
    intendedRoute: "/ai",
    availabilityStatus: "available",
  },
  {
    featureName: "Astro Yogas",
    sourceFilename: "Astro-Yogas.png",
    repositoryPath: "/icons/navagraha/Astro-Yogas.png",
    intendedRoute: "/dosha-yoga",
    availabilityStatus: "available",
  },
  {
    featureName: "Baby Name",
    sourceFilename: "Baby-Name.png",
    repositoryPath: "/icons/navagraha/Baby-Name.png",
    intendedRoute: "/numerology",
    availabilityStatus: "available",
  },
  {
    featureName: "Business",
    sourceFilename: "Business.png",
    repositoryPath: "/icons/navagraha/Business.png",
    intendedRoute: "/business-report",
    availabilityStatus: "available",
  },
  {
    featureName: "Career",
    sourceFilename: "carrer.png",
    repositoryPath: "/icons/navagraha/carrer.png",
    intendedRoute: "/career-report",
    availabilityStatus: "available",
  },
  {
    featureName: "Consult",
    sourceFilename: "Consult.png",
    repositoryPath: "/icons/navagraha/Consult.png",
    intendedRoute: "/consultation",
    availabilityStatus: "available",
  },
  {
    featureName: "Dasha",
    sourceFilename: "Dasha.png",
    repositoryPath: "/icons/navagraha/Dasha.png",
    intendedRoute: "/dasha",
    availabilityStatus: "available",
  },
  {
    featureName: "Gochar",
    sourceFilename: "Gochar.png",
    repositoryPath: "/icons/navagraha/Gochar.png",
    intendedRoute: "/transit",
    availabilityStatus: "available",
  },
  {
    featureName: "Health",
    sourceFilename: "health.png",
    repositoryPath: "/icons/navagraha/health.png",
    intendedRoute: "/health-report",
    availabilityStatus: "available",
  },
  {
    featureName: "Kundli",
    sourceFilename: "kundli.png",
    repositoryPath: "/icons/navagraha/kundli.png",
    intendedRoute: "/kundli",
    availabilityStatus: "available",
  },
  {
    featureName: "Mantra",
    sourceFilename: "mantra.png",
    repositoryPath: "/icons/navagraha/mantra.png",
    intendedRoute: "/remedies",
    availabilityStatus: "available",
  },
  {
    featureName: "Marriage Matching",
    sourceFilename: "Marriage-matching.png",
    repositoryPath: "/icons/navagraha/Marriage-matching.png",
    intendedRoute: "/matchmaking",
    availabilityStatus: "available",
  },
  {
    featureName: "Match",
    sourceFilename: "Match.png",
    repositoryPath: "/icons/navagraha/Match.png",
    intendedRoute: "/compatibility",
    availabilityStatus: "available",
  },
  {
    featureName: "Muhurat",
    sourceFilename: "muhurat.png",
    repositoryPath: "/icons/navagraha/muhurat.png",
    intendedRoute: "/muhurat",
    availabilityStatus: "available",
  },
  {
    featureName: "Name Number",
    sourceFilename: "Name-No.png",
    repositoryPath: "/icons/navagraha/Name-No.png",
    intendedRoute: "/numerology",
    availabilityStatus: "available",
  },
  {
    featureName: "Panchang",
    sourceFilename: "panchang.png",
    repositoryPath: "/icons/navagraha/panchang.png",
    intendedRoute: "/panchang",
    availabilityStatus: "available",
  },
  {
    featureName: "Remedy",
    sourceFilename: "Remedy.png",
    repositoryPath: "/icons/navagraha/Remedy.png",
    intendedRoute: "/remedies",
    availabilityStatus: "available",
  },
  {
    featureName: "Report",
    sourceFilename: "report.png",
    repositoryPath: "/icons/navagraha/report.png",
    intendedRoute: "/reports",
    availabilityStatus: "available",
  },
  {
    featureName: "Vehicle Number",
    sourceFilename: "Vehicle-no.png",
    repositoryPath: "/icons/navagraha/Vehicle-no.png",
    intendedRoute: "/numerology",
    availabilityStatus: "available",
  },
  {
    featureName: "Well Being",
    sourceFilename: "Well-Being.png",
    repositoryPath: "/icons/navagraha/Well-Being.png",
    intendedRoute: "/health-report",
    availabilityStatus: "available",
  },
  {
    featureName: "Rashifal",
    sourceFilename: null,
    repositoryPath: null,
    intendedRoute: "/rashifal",
    availabilityStatus: "missing",
  },
  {
    featureName: "Learn",
    sourceFilename: null,
    repositoryPath: null,
    intendedRoute: "/learn",
    availabilityStatus: "missing",
  },
  {
    featureName: "Shop",
    sourceFilename: null,
    repositoryPath: null,
    intendedRoute: "/shop",
    availabilityStatus: "missing",
  },
] as const satisfies readonly NavagrahaIconRegistryEntry[];

export type NavagrahaIconRegistryKey =
  (typeof navagrahaIconRegistry)[number]["featureName"];

export const availableNavagrahaIcons = navagrahaIconRegistry.filter(
  (entry) => entry.availabilityStatus === "available"
);

export const missingNavagrahaIcons = navagrahaIconRegistry.filter(
  (entry) => entry.availabilityStatus === "missing"
);
