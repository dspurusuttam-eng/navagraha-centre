// Claude C8B1/C8B2 — the Desk structured sidecar codec (pure, neutral, shared).
//
// The sidecar is the CONTRACT between the Admin editor (which must never show or damage it)
// and the public Desk adapter (which must recover it verbatim). It therefore lives in its
// own neutral module: the Admin console does not import the public content module, and the
// content module does not import Admin — both depend only on this codec.
//
// Representation: a single HTML comment appended to `Article.body`, carrying key-sorted
// JSON. It is inert if ever emitted raw, trivially distinguishable from prose, byte-stable
// for identical input, and stripped before the body is parsed into sections or shown to an
// editor. It exists because the Admin model has no column for a Daily Rashifal payload, FAQ
// items or the original display category — and adding one is out of scope.
import type { ContentFaqItem, DailyRashifalData } from "@/modules/content/types";

const DESK_META_OPEN = "<!--navagraha:desk-meta:v1";
const DESK_META_CLOSE = "-->";
/** Matches a trailing sidecar block; capture 1 is the raw JSON payload. */
const DESK_META_PATTERN = /\n*<!--navagraha:desk-meta:v1\s*([\s\S]*?)-->\s*$/;

export type DeskMeta = {
  v: 1;
  displayCategory?: string;
  faqItems?: ContentFaqItem[];
  dailyRashifal?: DailyRashifalData;
};

/** Key-sorted JSON so the encoded block is byte-identical for identical input. */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
}

/** True when the sidecar carries nothing worth writing. */
export function isEmptyDeskMeta(meta: DeskMeta): boolean {
  return (
    meta.displayCategory === undefined &&
    (meta.faqItems === undefined || meta.faqItems.length === 0) &&
    meta.dailyRashifal === undefined
  );
}

/** Encode the sidecar block (deterministic). Returns "" when there is nothing to carry. */
export function encodeDeskMeta(meta: DeskMeta): string {
  if (isEmptyDeskMeta(meta)) return "";
  return `${DESK_META_OPEN}\n${stableStringify(meta)}\n${DESK_META_CLOSE}`;
}

function parseMeta(raw: string): DeskMeta | null {
  try {
    const parsed = JSON.parse(raw.trim()) as DeskMeta;
    if (!parsed || parsed.v !== 1) return null;
    const displayCategory =
      typeof parsed.displayCategory === "string" && parsed.displayCategory.trim() && parsed.displayCategory.length <= 60
        ? parsed.displayCategory
        : undefined;
    return {
      v: 1,
      ...(displayCategory ? { displayCategory } : {}),
      ...(Array.isArray(parsed.faqItems) && parsed.faqItems.length ? { faqItems: parsed.faqItems } : {}),
      ...(parsed.dailyRashifal ? { dailyRashifal: parsed.dailyRashifal } : {}),
    };
  } catch {
    return null;
  }
}

/** Whether a stored body carries no sidecar, a readable one, or a damaged one. */
export type DeskSidecarState = "none" | "valid" | "malformed";

export type DeskBodyParts = {
  /** The human-readable body — the ONLY part an editor ever sees or submits. */
  visibleBody: string;
  /** The sidecar block VERBATIM, for byte-identical reattachment (null when absent). */
  sidecar: string | null;
  /** Parsed sidecar (null unless `state === "valid"`). */
  meta: DeskMeta | null;
  state: DeskSidecarState;
};

/**
 * Split a stored body into the editable prose and the protected sidecar.
 *
 * `sidecar` is the RAW block, so callers reattach exactly what was stored rather than
 * re-encoding it — an unreadable sidecar can therefore still be preserved untouched.
 * A malformed sidecar is still removed from `visibleBody`, so damaged JSON can never be
 * shown to an editor or rendered on a page.
 */
export function inspectDeskBody(body: string | null | undefined): DeskBodyParts {
  const text = (body ?? "").trimEnd();
  const match = DESK_META_PATTERN.exec(text);
  if (!match) return { visibleBody: text, sidecar: null, meta: null, state: "none" };

  const visibleBody = text.slice(0, match.index).trimEnd();
  const sidecar = text.slice(match.index).replace(/^\n+/, "");
  const meta = parseMeta(match[1]!);
  return { visibleBody, sidecar, meta, state: meta ? "valid" : "malformed" };
}

/** Back-compat split used by the public adapter (prose + parsed meta only). */
export function extractDeskMeta(body: string | null | undefined): { body: string; meta: DeskMeta | null } {
  const parts = inspectDeskBody(body);
  return { body: parts.visibleBody, meta: parts.meta };
}

/** Append an encoded sidecar to a prose body (no-op when there is nothing to carry). */
export function appendDeskMeta(body: string, meta: DeskMeta): string {
  return joinBodyAndSidecar(body, encodeDeskMeta(meta));
}

/**
 * Deterministically recombine an editor-supplied body with a stored sidecar block.
 * Used on every Admin write so the sidecar survives an edit — including one that clears the
 * visible body entirely, where the sidecar alone remains.
 */
export function joinBodyAndSidecar(visibleBody: string, sidecar: string | null): string {
  const prose = (visibleBody ?? "").trimEnd();
  if (!sidecar) return prose;
  return prose ? `${prose}\n\n${sidecar}` : sidecar;
}

// --- Body-to-sections parsing (C9C2) ----------------------------------------
// Shared with the public Desk core AND the Admin private preview via this neutral module,
// so neither side depends on the other's identity module — same reasoning as the codec above.

export type DeskContentSection = { title: string; paragraphs: string[] };

/** Title given to body content that appears before the first heading. */
export const DESK_LEAD_SECTION_TITLE = "Overview";

/**
 * Split a prose body into the rendered section shape.
 * Blank lines separate blocks; a markdown-style `#`..`######` block starts a new section;
 * everything before the first heading becomes the lead section. Deterministic and total.
 * Callers pass the sidecar-free body, so structured metadata can never render as prose.
 */
export function parseBodyToSections(body: string | null | undefined): DeskContentSection[] {
  const text = (body ?? "").trim();
  if (!text) return [];

  const blocks = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

  const sections: DeskContentSection[] = [];
  let current: DeskContentSection | null = null;

  for (const block of blocks) {
    const heading = /^#{1,6}\s+(.+)$/.exec(block);
    if (heading) {
      current = { title: heading[1]!.trim(), paragraphs: [] };
      sections.push(current);
      continue;
    }
    if (!current) {
      current = { title: DESK_LEAD_SECTION_TITLE, paragraphs: [] };
      sections.push(current);
    }
    // Collapse soft wraps inside a paragraph block.
    current.paragraphs.push(block.replace(/\s*\n\s*/g, " "));
  }

  return sections;
}
