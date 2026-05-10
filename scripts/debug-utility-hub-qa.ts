import assert from "node:assert/strict";

import {
  buildCrossToolRecommendations,
  getAstrologyUtilityHubSections,
  getAstrologyUtilityRelatedBlocks,
  getAstrologyUtilityShortcutCards,
} from "@/modules/astrology/utilities";

const sections = getAstrologyUtilityHubSections();
const shortcuts = getAstrologyUtilityShortcutCards();
const relatedBlocks = getAstrologyUtilityRelatedBlocks();

assert.ok(sections.length >= 5);
assert.ok(shortcuts.length >= 10);
assert.equal(relatedBlocks.length, 5);
assert.ok(
  sections.flatMap((section) => section.cards).some((card) => card.title === "Kundli / Birth Chart")
);
assert.ok(
  sections.flatMap((section) => section.cards).some((card) => card.title === "Ask NAVAGRAHA AI")
);

const noKundli = buildCrossToolRecommendations({
  hasActiveKundli: false,
  viewedMatchmaking: false,
  hasDoshaOrYogaFindings: false,
  viewedPanchang: false,
  viewedNumerology: false,
});

const activeKundli = buildCrossToolRecommendations({
  hasActiveKundli: true,
  viewedMatchmaking: true,
  hasDoshaOrYogaFindings: true,
  viewedPanchang: true,
  viewedNumerology: false,
});

assert.equal(noKundli[0]?.title, "Generate Kundli first");
assert.equal(activeKundli[0]?.title, "Open Marriage Report");
assert.equal(activeKundli[1]?.title, "Book Consultation");
assert.equal(activeKundli[2]?.title, "Open Remedies");
assert.ok(activeKundli.some((item) => item.title === "View Dasha"));
assert.ok(activeKundli.some((item) => item.title === "Check Transit"));
assert.ok(activeKundli.some((item) => item.title === "Open Rashifal"));
assert.ok(activeKundli.some((item) => item.title === "Open Muhurat"));
assert.ok(activeKundli.some((item) => item.title === "Book Consultation"));

process.stdout.write(
  JSON.stringify(
    {
      status: "ok",
      sections: sections.map((section) => ({
        eyebrow: section.eyebrow,
        tools: section.cards.length,
      })),
      shortcuts: shortcuts.length,
      relatedBlocks: relatedBlocks.map((block) => block.title),
      noKundli: noKundli.map((item) => item.title),
      activeKundli: activeKundli.map((item) => item.title),
    },
    null,
    2
  ) + "\n"
);
