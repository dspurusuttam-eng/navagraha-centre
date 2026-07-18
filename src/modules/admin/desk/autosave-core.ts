// Claude Admin Console C4B1 — deterministic autosave controller (pure).
// Debounces changes, allows only ONE in-flight save (no duplicates), ignores stale
// save results, and re-saves the latest edit (latest-wins). Time is injected → testable.
export type AutosaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";
export type SaveCommand = { save: false } | { save: true; seq: number };

export type AutosaveController = {
  status(): AutosaveStatus;
  seq(): number;
  notifyChange(now: number): void;
  poll(now: number): SaveCommand;
  flush(): SaveCommand;
  onResult(seq: number, ok: boolean): void;
  retry(now: number): void;
  isClean(): boolean;
};

export function createAutosaveController(debounceMs: number): AutosaveController {
  let status: AutosaveStatus = "idle";
  let seqCounter = 0;
  let inFlightSeq: number | null = null;
  let dirtySince: number | null = null;
  let savedSeq = 0;

  return {
    status: () => status,
    seq: () => seqCounter,

    notifyChange(now) {
      seqCounter += 1;
      dirtySince = now;
      if (status !== "saving") status = "dirty";
      // If a save is in flight, the newer seqCounter is captured and re-saved on completion.
    },

    poll(now): SaveCommand {
      if (inFlightSeq !== null) return { save: false }; // one save at a time
      if (status === "dirty" && dirtySince !== null && now - dirtySince >= debounceMs) {
        inFlightSeq = seqCounter;
        status = "saving";
        return { save: true, seq: inFlightSeq };
      }
      return { save: false };
    },

    // Force an immediate save of any unsaved edit, ignoring the debounce. Used before a
    // lifecycle transition so it never acts on stale content. Still single-in-flight.
    flush(): SaveCommand {
      if (inFlightSeq !== null) return { save: false };
      if (savedSeq !== seqCounter) {
        inFlightSeq = seqCounter;
        status = "saving";
        return { save: true, seq: inFlightSeq };
      }
      return { save: false };
    },

    onResult(seq, ok) {
      if (seq !== inFlightSeq) return; // stale / out-of-order result → ignore
      inFlightSeq = null;
      if (ok) {
        savedSeq = seq;
        status = seqCounter > seq ? "dirty" : "saved"; // changes during save → re-save
      } else {
        status = "error";
      }
    },

    retry(now) {
      if (status === "error") {
        status = "dirty";
        dirtySince = now - debounceMs; // eligible on the next poll
      }
    },

    isClean: () => savedSeq === seqCounter && inFlightSeq === null,
  };
}
