// Shared renderer for the approved policy copy (Support, Contact, Privacy, Terms, Method).
//
// Server component by design: policy pages carry no interactivity, so they add no client
// JavaScript and no hydration cost. The copy is supplied as plain paragraphs; the public
// contact address and the Consultation reference are turned into real links here, so every
// policy page links them identically and no page hard-codes an address.
import Link from "next/link";
import { publicContactEmail, publicContactMailto } from "@/config/public-contact";

const CONSULTATION_TOKEN = "Consultation section";

type PolicyProseProps = {
  /** Approved paragraphs, in order. Rendered verbatim apart from link substitution. */
  paragraphs: readonly string[];
  /** Localised /consultation href supplied by the page. */
  consultationHref: string;
};

/** Split a paragraph on the email + "Consultation section" tokens and link them. */
function renderParagraph(text: string, consultationHref: string) {
  const parts = text.split(new RegExp(`(${publicContactEmail}|${CONSULTATION_TOKEN})`, "g"));

  return parts.map((part, index) => {
    if (part === publicContactEmail) {
      return (
        <a
          className="break-all font-semibold text-[color:var(--ui-color-text-primary)] underline decoration-[color:var(--ui-color-border-gold)] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-color-focus)]"
          href={publicContactMailto}
          key={`mail-${index}`}
        >
          {part}
        </a>
      );
    }

    if (part === CONSULTATION_TOKEN) {
      return (
        <Link
          className="font-semibold text-[color:var(--ui-color-text-primary)] underline decoration-[color:var(--ui-color-border-gold)] underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-color-focus)]"
          href={consultationHref}
          key={`consult-${index}`}
        >
          {part}
        </Link>
      );
    }

    return part;
  });
}

export function PolicyProse({ paragraphs, consultationHref }: Readonly<PolicyProseProps>) {
  return (
    <div className="max-w-3xl space-y-4">
      {paragraphs.map((paragraph) => (
        <p
          className="text-sm font-medium leading-7 text-[color:var(--ui-color-text-secondary)]"
          key={paragraph}
        >
          {renderParagraph(paragraph, consultationHref)}
        </p>
      ))}
    </div>
  );
}
