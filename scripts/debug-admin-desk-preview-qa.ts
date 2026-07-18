/**
 * Claude C9C2 — Admin desk preview renderer QA.
 * Covers the C9C2 defect fix: the private draft preview must parse Markdown-style headings
 * into real sections (not dump raw "## Heading" text), while never exposing the raw sidecar
 * and falling back gracefully on malformed/heading-less bodies. No database, no live server.
 */
import { readFileSync } from "node:fs";
import { appendDeskMeta, inspectDeskBody, parseBodyToSections, type DeskMeta } from "@/modules/desk-sidecar/sidecar";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const read = (path: string): string => readFileSync(path, "utf8");
const PAGE = () => read("src/app/(admin)/admin/desk/[id]/preview/page.tsx");

type Group = { name: string; run: () => void | Promise<void> };
const groups: Group[] = [
  {
    name: "H1 headings: Markdown-style headings parse into distinct section titles, not literal text",
    run: () => {
      const body = "## The wider tone of April\n\nApril leans reflective this year.\n\n## What to watch\n\nSlow down before big decisions.";
      const sections = parseBodyToSections(body);
      assert(sections.length === 2, `expected 2 sections, got ${sections.length}`);
      assert(sections[0]!.title === "The wider tone of April", "first heading text extracted, not '## The wider tone of April'");
      assert(sections[1]!.title === "What to watch", "second heading text extracted");
      assert(!sections.some((s) => s.title.startsWith("#")), "no section title retains a literal '#' marker");
    },
  },
  {
    name: "P1 paragraphs: body text under a heading renders as its own paragraph, soft wraps collapsed",
    run: () => {
      const body = "## Overview\n\nLine one\nstill line one.\n\nA second paragraph.";
      const sections = parseBodyToSections(body);
      assert(sections.length === 1, "single section");
      assert(sections[0]!.paragraphs.length === 2, `expected 2 paragraphs, got ${sections[0]!.paragraphs.length}`);
      assert(sections[0]!.paragraphs[0] === "Line one still line one.", "soft-wrapped line collapsed into one paragraph");
      assert(sections[0]!.paragraphs[1] === "A second paragraph.", "second paragraph preserved separately");
    },
  },
  {
    name: "F1 malformed fallback: heading-less or empty bodies degrade without crashing",
    run: () => {
      const noHeading = parseBodyToSections("Just plain prose with no heading at all.");
      assert(noHeading.length === 1, "heading-less prose becomes one lead section");
      assert(noHeading[0]!.title === "Overview", "falls back to the lead section title, not an empty/undefined title");

      const empty = parseBodyToSections("");
      assert(empty.length === 0, "empty body parses to zero sections");
      const nullish = parseBodyToSections(null);
      assert(nullish.length === 0, "null body parses to zero sections (no throw)");

      const garbled = parseBodyToSections("### \n\n#####noSpaceAfterHash\n\nTrailing text.");
      assert(Array.isArray(garbled), "garbled markdown-ish input never throws");
    },
  },
  {
    name: "S1 no raw sidecar exposure: the preview parses only the visible body, sidecar JSON never reaches a section",
    run: () => {
      const meta: DeskMeta = { v: 1, displayCategory: "Daily Rashifal", faqItems: [{ question: "Q?", answer: "A." }] };
      const withSidecar = appendDeskMeta("## Daily Rashifal\n\nToday's outlook.", meta);
      const { visibleBody } = inspectDeskBody(withSidecar);
      const sections = parseBodyToSections(visibleBody);
      const serialized = JSON.stringify(sections);
      assert(!serialized.includes("navagraha:desk-meta"), "sidecar marker never reaches parsed sections");
      assert(!serialized.includes("faqItems"), "sidecar JSON keys never reach parsed sections");
      assert(sections[0]!.title === "Daily Rashifal", "visible heading still parses correctly alongside a sidecar");
    },
  },
  {
    name: "W1 wiring: the preview page imports the shared parser and no longer dumps raw body text",
    run: () => {
      const src = PAGE();
      assert(src.includes('from "@/modules/desk-sidecar/sidecar"'), "imports the shared pure parser via the neutral module");
      assert(!/@\/modules\/content\b/.test(src), "never imports the public content module (E9 isolation)");
      assert(src.includes("parseBodyToSections(visibleBody)"), "parses the sidecar-stripped visible body, not the raw article.body");
      assert(!src.includes("whitespace-pre-wrap"), "no longer renders the body as a single raw pre-wrapped block");
      assert(src.includes("sections.map"), "renders parsed sections, not raw text");
      assert(src.includes("No body content yet."), "empty-body fallback preserved");
    },
  },
  {
    name: "M1 metadata preserved: status/language banner and editor link untouched by the fix",
    run: () => {
      const src = PAGE();
      assert(src.includes("article.status"), "status still rendered");
      assert(src.includes("article.language"), "language still rendered");
      assert(src.includes("Back to editor"), "editor link preserved");
      assert(src.includes("inspectDeskBody(article.body)"), "sidecar stripping still runs before parsing");
    },
  },
];

async function main() {
  console.log("Admin Console C9C2 — desk preview renderer QA:");
  let passed = 0;
  let failed = 0;
  for (const group of groups) {
    try {
      await group.run();
      console.log(`  ✓ ${group.name}`);
      passed += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`  ✗ ${group.name} -- ${message}`);
      failed += 1;
    }
  }
  console.log(`\nadmin desk preview QA summary: ${passed} passed, ${failed} failed (of ${groups.length}).`);
  if (failed > 0) process.exit(1);
}

void main();
