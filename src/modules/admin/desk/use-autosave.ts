"use client";

// Claude Admin Console C4B1 — React glue for the pure autosave controller.
import { useCallback, useEffect, useRef, useState } from "react";
import { createAutosaveController, type AutosaveStatus } from "@/modules/admin/desk/autosave-core";

export function useAutosave(
  save: () => Promise<boolean>,
  options: { debounceMs?: number; pollMs?: number } = {},
) {
  const debounceMs = options.debounceMs ?? 1500;
  const pollMs = options.pollMs ?? 500;
  const controllerRef = useRef(createAutosaveController(debounceMs));
  const savingRef = useRef(false);
  const saveRef = useRef(save);
  const [status, setStatus] = useState<AutosaveStatus>("idle");

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useEffect(() => {
    const tick = async () => {
      const command = controllerRef.current.poll(Date.now());
      if (command.save && !savingRef.current) {
        savingRef.current = true;
        setStatus(controllerRef.current.status());
        let ok = false;
        try {
          ok = await saveRef.current();
        } catch {
          ok = false;
        }
        controllerRef.current.onResult(command.seq, ok);
        savingRef.current = false;
      }
      setStatus(controllerRef.current.status());
    };
    const interval = setInterval(() => {
      void tick();
    }, pollMs);
    return () => clearInterval(interval);
  }, [pollMs]);

  const notifyChange = useCallback(() => {
    controllerRef.current.notifyChange(Date.now());
    setStatus(controllerRef.current.status());
  }, []);

  // Persist any pending edit and wait for it to settle. Called before a lifecycle
  // transition so the server never acts on unsaved content. Resolves to true when the
  // draft is clean afterwards (nothing pending / last save succeeded).
  const flush = useCallback(async (): Promise<boolean> => {
    // Wait for any in-flight autosave to finish first.
    while (savingRef.current) {
      await new Promise((resolve) => setTimeout(resolve, pollMs));
    }
    const command = controllerRef.current.flush();
    if (command.save) {
      savingRef.current = true;
      setStatus("saving");
      let ok = false;
      try {
        ok = await saveRef.current();
      } catch {
        ok = false;
      }
      controllerRef.current.onResult(command.seq, ok);
      savingRef.current = false;
      setStatus(controllerRef.current.status());
    }
    return controllerRef.current.isClean();
  }, [pollMs]);

  const retry = useCallback(() => {
    controllerRef.current.retry(Date.now());
    setStatus(controllerRef.current.status());
  }, []);

  const isClean = useCallback(() => controllerRef.current.isClean(), []);

  return { status, notifyChange, retry, isClean, flush };
}
