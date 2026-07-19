/**
 * The single public contact address for NAVAGRAHA CENTRE.
 *
 * This is the ONLY email that may appear in public HTML. The Founder's private address, the
 * Admin/authentication address and any internal operational mailbox are never rendered — the
 * Acharya page reads an Admin-managed field, and this constant is what every policy, Support
 * and Contact surface links to.
 */
export const publicContactEmail = "navagrahacentre.contact@gmail.com";

/** `mailto:` href for the public contact address. */
export const publicContactMailto = `mailto:${publicContactEmail}`;
