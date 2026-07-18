import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  CONSULTATION_CATALOGUE_BLUEPRINT,
  PRIORITY_UTILITY_SLUGS,
} from "@/modules/admin/consultation-catalogue/catalogue-blueprint";
import {
  buildGeneralEnquiryMessage,
  buildSelectedConsultationMessage,
  buildWhatsappHandoffUrl,
} from "@/modules/consultations/whatsapp-handoff";

const root = process.cwd();
const concern = "Please review one career decision this month.";
const whatsappBaseUrl = `https://wa.me/${"9"}${"1".repeat(9)}`;
const lockedNumberPattern = new RegExp(`\\+?${"91"}${"9085"}${"946882"}`);

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function findUtility(slug: string) {
  for (const tier of CONSULTATION_CATALOGUE_BLUEPRINT) {
    const utility = tier.utilities.find((item) => item.slug === slug);
    if (utility) return { tier, utility };
  }
  throw new Error(`Missing utility fixture: ${slug}`);
}

function encodedText(url: string) {
  return new URL(url).searchParams.get("text");
}

const career = findUtility("career-guidance");
const commercialVastu = findUtility("commercial-vastu-business-premises");
const residentialVastu = findUtility("residential-vastu");
const onSiteMode = residentialVastu.utility.modes?.find((mode) => mode.slug === "on-site");
assert(onSiteMode, "Residential Vastu On-site mode exists");

const expectedSelectedMessage = `Namaste. I would like to begin a consultation with NAVAGRAHA CENTRE.

Selected Consultation: Career Guidance
Tier: Focused Guidance
Launch Price: ₹499

Preferred Language: ENGLISH

My Main Concern:
${concern}

I understand that this is a one-time case fee for one selected concern and is not billed per minute.

Please confirm the required details, payment process and next step.`;

const expectedGeneralMessage = `Namaste. I would like help selecting the right consultation with NAVAGRAHA CENTRE.

Preferred Language: ENGLISH

My Main Concern:
${concern}

I understand that consultation uses a one-time case fee and is not billed per minute.

Please guide me to the appropriate consultation and next step.`;

const groups: Array<{ name: string; run: () => void }> = [
  {
    name: "selected-consultation message is byte-for-byte exact",
    run() {
      const message = buildSelectedConsultationMessage({
        concern,
        priceLabel: "₹499",
        tierName: career.tier.name,
        utilityName: career.utility.name,
      });
      assert.equal(message, expectedSelectedMessage);
    },
  },
  {
    name: "general-enquiry message is byte-for-byte exact",
    run() {
      assert.equal(buildGeneralEnquiryMessage({ concern }), expectedGeneralMessage);
    },
  },
  {
    name: "Residential Vastu mode and backend price label substitution are preserved",
    run() {
      const message = buildSelectedConsultationMessage({
        concern,
        modeName: onSiteMode.name,
        priceLabel: `₹${onSiteMode.launchPrice.toLocaleString("en-IN")}`,
        tierName: residentialVastu.tier.name,
        utilityName: residentialVastu.utility.name,
      });
      assert(message.includes("Selected Consultation: Residential Vastu — On-site"));
      assert(message.includes("Tier: Premium Cases"));
      assert(message.includes("Launch Price: ₹2,499"));
    },
  },
  {
    name: "Commercial Vastu FROM price and scope-review semantics are preserved",
    run() {
      assert.equal(commercialVastu.utility.priceType, "FROM");
      assert.equal(commercialVastu.utility.priceLabel, "From ₹4,999");
      assert.equal(commercialVastu.utility.requiresScopeReview, true);
      assert.equal(PRIORITY_UTILITY_SLUGS.length, 6);
    },
  },
  {
    name: "WhatsApp URL is encoded exactly once and never double encoded",
    run() {
      const url = buildWhatsappHandoffUrl(whatsappBaseUrl, expectedSelectedMessage);
      assert(url);
      assert.equal(encodedText(url), expectedSelectedMessage);
      assert.equal(url.includes("%25"), false);
      assert.equal(buildWhatsappHandoffUrl("https://example.com/919111111111", expectedSelectedMessage), null);
      assert.equal(buildWhatsappHandoffUrl(`${whatsappBaseUrl}?text=already`, expectedSelectedMessage)?.includes("already"), false);
    },
  },
  {
    name: "component gates selected and general handoff behind explicit user actions",
    run() {
      const source = read("src/modules/consultations/components/consultation-selection-journey.tsx");
      assert(source.includes("Continue on WhatsApp"));
      assert(source.includes("Ask Before Booking"));
      assert(source.includes("disabled={!canContinueSelected}"));
      assert(source.includes("disabled={!canContinueGeneral}"));
      assert(source.includes("onClick={continueOnWhatsapp}"));
      assert(source.includes("onClick={startGeneralEnquiry}"));
      assert.equal(source.includes("useEffect"), false);
      assert(source.indexOf("resetJourney();") < source.indexOf("window.location.assign(handoffUrl);"));
    },
  },
  {
    name: "privacy boundaries avoid storage, cookies, APIs, logging and app URL state",
    run() {
      const componentSource = read("src/modules/consultations/components/consultation-selection-journey.tsx");
      for (const forbidden of [
        "localStorage",
        "sessionStorage",
        "document.cookie",
        "fetch(",
        "navigator.sendBeacon",
        "console.",
        "router.",
        "pushState",
        "replaceState",
      ]) {
        assert.equal(componentSource.includes(forbidden), false, `component includes ${forbidden}`);
      }
    },
  },
  {
    name: "safe WhatsApp source is derived through authenticated Admin settings path",
    run() {
      const pageSource = read("src/app/(admin)/admin/consultation-preview/page.tsx");
      assert(pageSource.includes("requireAdminPageSession"));
      assert(pageSource.includes("getConsultationSettings(getConsultationDeps())"));
      assert(pageSource.includes("buildWhatsappUrl(settingsResult.data.whatsappNumber)"));
      assert(pageSource.includes("whatsappBaseUrl={whatsappBaseUrl}"));
      assert.equal(lockedNumberPattern.test(pageSource), false);
    },
  },
  {
    name: "public Consultation remains unavailable and has no raw standalone WhatsApp number",
    run() {
      const publicSource = read("src/app/(marketing)/consultation/page.tsx");
      assert(publicSource.includes("getPublicConsultationSettings"));
      assert(publicSource.includes("showsWhatsappCta"));
      assert.equal(lockedNumberPattern.test(publicSource), false);
      assert.equal(publicSource.includes("Book Astrologer"), false);
      assert.equal(publicSource.includes("Buy Now"), false);
    },
  },
  {
    name: "accessible errors, reset and reduced-motion support are present",
    run() {
      const source = read("src/modules/consultations/components/consultation-selection-journey.tsx");
      assert(source.includes("role=\"alert\""));
      assert(source.includes("aria-live=\"polite\""));
      assert(source.includes("aria-invalid"));
      assert(source.includes("Reset"));
      assert(source.includes("motion-reduce:transition-none"));
    },
  },
];

let passed = 0;

for (const group of groups) {
  group.run();
  passed += 1;
  console.log(`PASS ${group.name}`);
}

console.log(`\nconsultation WhatsApp handoff QA summary: ${passed} passed, 0 failed (of ${groups.length}).`);
