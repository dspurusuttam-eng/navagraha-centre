// Claude C8B2 — controlled Admin notice for damaged structured content (pure).
//
// Lives outside the "use server" action module because a server-action file may only export
// async functions. Deliberately a fixed, human-readable string: it never interpolates or
// echoes the stored sidecar, so no raw JSON can reach the UI through an error path.
export const SIDECAR_MALFORMED_MESSAGE =
  "This article carries structured content (Daily Rashifal / FAQ / display category) that is stored in a damaged state. Editing is blocked so it is not overwritten. Please contact an administrator.";
