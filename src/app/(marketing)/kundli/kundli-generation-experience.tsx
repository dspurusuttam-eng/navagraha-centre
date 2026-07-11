"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildKundliSignInHref,
  claimPendingKundliRequest,
  clearPendingKundliDraft,
  createPendingKundliDraft,
  readPendingKundliDraft,
  releasePendingKundliRequest,
  resolveKundliGenerateAction,
  storePendingKundliDraft,
  validateKundliRequestPayload,
  type PendingKundliDraft,
  type StorageLike,
} from "@/lib/kundli/pending-kundli-draft";
import { prepareKundliProfile } from "./kundli-generation-actions";
import {
  GenerateKundliControl,
  isSupportedKundliChartPayload,
  type KundliGenerateState,
} from "./generate-kundli-control";
import {
  KundliBirthDetailsForm,
  type KundliBirthDetailsFormValue,
} from "./kundli-birth-details-form";

type KundliGenerationExperienceProps = {
  isAuthenticated: boolean;
  resumeRequested: boolean;
  signInPath: string;
  callbackPath: string;
};

function getSessionStorage(): StorageLike | null {
  try {
    const storage = window.sessionStorage;
    const key = "navagraha:kundli:storage-check";
    storage.setItem(key, "1");
    storage.removeItem(key);
    return storage;
  } catch {
    return null;
  }
}

function getApiMessage(payload: unknown, status: number) {
  const candidate = payload as
    | { message?: unknown; error?: { message?: unknown; code?: unknown } }
    | null;
  const code =
    typeof candidate?.error?.code === "string" ? candidate.error.code : "";

  if (status === 401 || code === "UNAUTHORIZED") {
    return "Your session needs to be refreshed before Kundli generation.";
  }
  if (status === 429 || code === "RATE_LIMITED") {
    return "Too many generation attempts. Please wait and retry.";
  }
  if (status === 400 || status === 422) {
    return "The saved birth details were rejected. Review the visible form and retry.";
  }

  return typeof candidate?.error?.message === "string"
    ? candidate.error.message
    : typeof candidate?.message === "string"
      ? candidate.message
      : "Kundli generation could not complete. Please try again.";
}

export function KundliGenerationExperience({
  isAuthenticated,
  resumeRequested,
  signInPath,
  callbackPath,
}: Readonly<KundliGenerationExperienceProps>) {
  const signInHref = buildKundliSignInHref({ signInPath, callbackPath });
  const [formKey, setFormKey] = useState("new");
  const [initialValue, setInitialValue] =
    useState<KundliBirthDetailsFormValue | null>(null);
  const [formValue, setFormValue] = useState<KundliBirthDetailsFormValue | null>(
    null
  );
  const [hasPendingDraft, setHasPendingDraft] = useState(false);
  const [state, setState] = useState<KundliGenerateState>({
    status: "idle",
    message: isAuthenticated
      ? "Complete the confirmed birth details, then generate your Kundli."
      : "Your completed details will be preserved securely through sign-in.",
  });
  const inFlightRequestId = useRef<string | null>(null);
  const draftHydrationStarted = useRef(false);

  const runAuthenticatedGeneration = useCallback(
    async (draft: PendingKundliDraft) => {
      if (inFlightRequestId.current) {
        return;
      }

      const storage = getSessionStorage();
      if (
        storage &&
        !claimPendingKundliRequest(storage, draft.requestId)
      ) {
        setState({
          status: "idle",
          message:
            "This Kundli request is already continuing in this browser tab.",
        });
        return;
      }

      inFlightRequestId.current = draft.requestId;
      setState({
        status: "saving",
        message: "Saving confirmed birth details to your protected profile.",
      });

      try {
        const prepared = await prepareKundliProfile(draft.payload);
        if (prepared.status === "unauthorized") {
          if (storage) {
            releasePendingKundliRequest(storage);
          }
          setState({ status: "error", message: prepared.message });
          window.location.assign(signInHref);
          return;
        }
        if (prepared.status === "error") {
          if (storage) {
            releasePendingKundliRequest(storage);
          }
          setState({ status: "error", message: prepared.message });
          return;
        }

        setState({
          status: "generating",
          message: "Generating your authenticated Kundli result.",
        });

        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 20_000);
        const response = await fetch("/api/astrology/chart", {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ source: "PROFILE" }),
          signal: controller.signal,
        }).finally(() => window.clearTimeout(timeoutId));
        const payload = (await response.json().catch(() => null)) as unknown;

        if (!response.ok) {
          const message = getApiMessage(payload, response.status);
          if (storage) {
            if (response.status === 400 || response.status === 422) {
              clearPendingKundliDraft(storage);
              setHasPendingDraft(false);
            } else {
              releasePendingKundliRequest(storage);
            }
          }
          setState({ status: "error", message });
          if (response.status === 401) {
            window.location.assign(signInHref);
          }
          return;
        }

        if (!isSupportedKundliChartPayload(payload)) {
          if (storage) {
            clearPendingKundliDraft(storage);
          }
          setHasPendingDraft(false);
          setState({
            status: "error",
            message:
              "The chart response arrived without the fields required for safe rendering. Retry from the visible form.",
          });
          return;
        }

        if (storage) {
          clearPendingKundliDraft(storage);
        }
        setHasPendingDraft(false);
        setState({
          status: "success",
          message: "Kundli generated successfully from your confirmed birth details.",
          payload,
        });
      } catch (error) {
        if (storage) {
          releasePendingKundliRequest(storage);
        }
        setState({
          status: "error",
          message:
            error instanceof DOMException && error.name === "AbortError"
              ? "The chart request timed out. Your visible details are preserved for retry."
              : "The chart request could not reach the server. Your visible details are preserved for retry.",
        });
      } finally {
        inFlightRequestId.current = null;
      }
    },
    [signInHref]
  );

  useEffect(() => {
    if (draftHydrationStarted.current) {
      return;
    }

    draftHydrationStarted.current = true;
    const storage = getSessionStorage();
    if (!storage) {
      if (resumeRequested) {
        setState({
          status: "error",
          message:
            "This browser could not restore the private session draft. Re-enter the visible details and retry.",
        });
      }
      return;
    }

    const result = readPendingKundliDraft(storage);
    if (result.status !== "ready") {
      if (result.status === "expired" || result.status === "invalid") {
        clearPendingKundliDraft(storage);
      }
      if (result.status !== "missing" || resumeRequested) {
        setState({
          status: "error",
          message:
            result.status === "expired"
              ? "The private Kundli draft expired after 30 minutes. Please confirm the details again."
              : "No valid Kundli draft was available to resume. Please complete the form and retry.",
        });
      }
      return;
    }

    setInitialValue(result.draft.payload);
    setFormValue(result.draft.payload);
    setFormKey(result.draft.requestId);
    setHasPendingDraft(true);
    setState({
      status: "idle",
      message:
        resumeRequested && isAuthenticated
          ? "Your confirmed details were restored. Generation is continuing now."
          : isAuthenticated
            ? "Your private draft was restored. Generate Kundli when ready."
            : "Your private draft was restored. Generate Kundli to continue through sign-in.",
    });

    if (resumeRequested && isAuthenticated) {
      void runAuthenticatedGeneration(result.draft);
    }
  }, [isAuthenticated, resumeRequested, runAuthenticatedGeneration]);

  const handleValueChange = useCallback(
    (value: KundliBirthDetailsFormValue | null) => {
      setFormValue(value);
      if (state.status === "error" && value) {
        setState({
          status: "idle",
          message: "Details updated. Generate Kundli when ready.",
        });
      }
    },
    [state.status]
  );

  function handleGenerate() {
    setState({
      status: "validating",
      message: "Validating confirmed birth details.",
    });

    const storage = getSessionStorage();
    const action = resolveKundliGenerateAction({
      isAuthenticated,
      hasValidPayload: Boolean(
        formValue && validateKundliRequestPayload(formValue)
      ),
      hasSessionStorage: Boolean(storage),
    });

    if (action === "validation-error" || !formValue) {
      setState({
        status: "error",
        message:
          "Enter a full name, birth date, birth time, and confirm a place with coordinates and IANA timezone.",
      });
      return;
    }

    let draft: PendingKundliDraft;
    try {
      draft = createPendingKundliDraft(formValue);
    } catch {
      setState({
        status: "error",
        message: "The confirmed birth details could not be prepared safely.",
      });
      return;
    }

    if (storage) {
      try {
        clearPendingKundliDraft(storage);
        storePendingKundliDraft(storage, draft);
        setHasPendingDraft(true);
      } catch {
        if (!isAuthenticated) {
          setState({
            status: "error",
            message:
              "Private session storage is unavailable. Enable it before signing in so your details are not lost.",
          });
          return;
        }
      }
    } else if (action === "storage-error") {
      setState({
        status: "error",
        message:
          "Private session storage is unavailable. Enable it before signing in so your details are not lost.",
      });
      return;
    }

    if (action === "sign-in") {
      setState({
        status: "idle",
        message: "Details saved for this tab. Continue through secure sign-in.",
      });
      window.location.assign(signInHref);
      return;
    }

    void runAuthenticatedGeneration(draft);
  }

  function handleCancelPending() {
    const storage = getSessionStorage();
    if (storage) {
      clearPendingKundliDraft(storage);
    }
    inFlightRequestId.current = null;
    setHasPendingDraft(false);
    setInitialValue(null);
    setFormValue(null);
    setFormKey(`cleared-${Date.now()}`);
    setState({
      status: "idle",
      message: "Saved Kundli details were cleared from this browser tab.",
    });
  }

  return (
    <div className="space-y-3">
      <KundliBirthDetailsForm
        key={formKey}
        initialValue={initialValue}
        onValueChange={handleValueChange}
      />
      <GenerateKundliControl
        state={state}
        onGenerate={handleGenerate}
        onCancelPending={handleCancelPending}
        hasPendingDraft={hasPendingDraft}
      />
    </div>
  );
}
