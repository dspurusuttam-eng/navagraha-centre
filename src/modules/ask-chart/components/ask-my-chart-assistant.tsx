"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trackEvent } from "@/lib/analytics/track-event";
import { getApiErrorMessage } from "@/lib/api/http";
import { getMonetizationUpgradeCopy } from "@/modules/subscriptions/monetization-content";
import type {
  AskMyChartConversation,
  AskMyChartPageData,
  AskMyChartSessionSummary,
} from "@/modules/ask-chart/types";

type AskMyChartAssistantProps = {
  initialData: Extract<AskMyChartPageData, { status: "ready" }>;
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

type MessageResponse = {
  status: "READY";
  conversation: AskMyChartConversation;
  sessions: AskMyChartSessionSummary[];
  planType: "FREE" | "PREMIUM" | "PRO";
  aiQuestionsUsedToday: number;
  aiQuestionsLimitPerDay: number | null;
  aiQuestionsRemainingToday: number | null;
  premiumNudge: {
    title: string;
    message: string;
    ctaLabel: string;
    href: string;
    reason: "DEEPER_QUESTION" | "USAGE_MILESTONE" | "FREE_PLAN_SUMMARY";
  } | null;
};

type LimitReachedResponse = {
  status: "LIMIT_REACHED";
  message: string;
  upgradeHref: string;
  planType: "FREE" | "PREMIUM" | "PRO";
  aiQuestionsUsedToday: number;
  aiQuestionsLimitPerDay: number;
  aiQuestionsRemainingToday: number;
};

async function readJsonResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        payload,
        "The assistant request could not be completed."
      )
    );
  }

  return payload as T;
}

export function AskMyChartAssistant({
  initialData,
}: Readonly<AskMyChartAssistantProps>) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initialData.sessions);
  const [activeConversation, setActiveConversation] = useState(
    initialData.activeConversation
  );
  const [draft, setDraft] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null);
  const [paywall, setPaywall] = useState<LimitReachedResponse | null>(null);
  const [usageState, setUsageState] = useState<{
    planType: "FREE" | "PREMIUM" | "PRO";
    aiQuestionsUsedToday: number;
    aiQuestionsLimitPerDay: number | null;
    aiQuestionsRemainingToday: number | null;
  } | null>(null);
  const [premiumNudge, setPremiumNudge] = useState<MessageResponse["premiumNudge"]>(
    null
  );
  const assistantNudgeCopy = getMonetizationUpgradeCopy({
    prompt: "assistant-nudge",
    surface: "protected",
    planType: usageState?.planType,
    aiQuestionsUsedToday: usageState?.aiQuestionsUsedToday,
    aiQuestionsLimitPerDay: usageState?.aiQuestionsLimitPerDay ?? null,
  });
  const assistantLimitCopy = getMonetizationUpgradeCopy({
    prompt: "assistant-limit",
    surface: "protected",
    planType: usageState?.planType,
  });
  const assistantNearLimitCopy = getMonetizationUpgradeCopy({
    prompt: "assistant-near-limit",
    surface: "protected",
    planType: usageState?.planType,
    aiQuestionsUsedToday: usageState?.aiQuestionsUsedToday,
    aiQuestionsLimitPerDay: usageState?.aiQuestionsLimitPerDay ?? null,
  });
  const showNearLimitPrompt = Boolean(
    usageState &&
      !paywall &&
      usageState.planType === "FREE" &&
      typeof usageState.aiQuestionsRemainingToday === "number" &&
      usageState.aiQuestionsRemainingToday <= 1 &&
      usageState.aiQuestionsRemainingToday >= 0
  );
  const showProContinuityPrompt = Boolean(
    usageState &&
      !paywall &&
      usageState.planType === "PREMIUM" &&
      usageState.aiQuestionsUsedToday >= 30
  );

  useEffect(() => {
    if (!paywall) {
      return;
    }

    trackEvent("upgrade_prompt_view", {
      page: "/dashboard/ask-my-chart",
      feature: "assistant-limit-upgrade",
      plan: paywall.planType,
    });
  }, [paywall]);

  useEffect(() => {
    if (!premiumNudge || !usageState) {
      return;
    }

    trackEvent("upgrade_prompt_view", {
      page: "/dashboard/ask-my-chart",
      feature: `assistant-nudge-${premiumNudge.reason.toLowerCase()}`,
      plan: usageState.planType,
    });
  }, [premiumNudge, usageState]);

  useEffect(() => {
    if (!showNearLimitPrompt || !usageState) {
      return;
    }

    trackEvent("upgrade_prompt_view", {
      page: "/dashboard/ask-my-chart",
      feature: "assistant-near-limit",
      plan: usageState.planType,
    });
  }, [showNearLimitPrompt, usageState]);

  useEffect(() => {
    if (!showProContinuityPrompt || !usageState) {
      return;
    }

    trackEvent("upgrade_prompt_view", {
      page: "/dashboard/ask-my-chart",
      feature: "assistant-pro-continuity",
      plan: usageState.planType,
    });
  }, [showProContinuityPrompt, usageState]);

  async function createSession() {
    const response = await fetch("/api/ai/ask-chart/sessions", {
      method: "POST",
    });
    const payload = await readJsonResponse<{ session: AskMyChartSessionSummary }>(
      response
    );

    setSessions((current) => [payload.session, ...current].slice(0, 8));
    router.replace(`/dashboard/ask-my-chart?session=${payload.session.id}`, {
      scroll: false,
    });

    return payload.session;
  }

  async function loadConversation(sessionId: string) {
    setLoadingSessionId(sessionId);
    setError(null);
    setPaywall(null);
    setPremiumNudge(null);

    try {
      const response = await fetch(`/api/ai/ask-chart/sessions/${sessionId}`);
      const payload = await readJsonResponse<{
        conversation: AskMyChartConversation;
      }>(response);

      setActiveConversation(payload.conversation);
      router.replace(`/dashboard/ask-my-chart?session=${sessionId}`, {
        scroll: false,
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "The conversation could not be loaded."
      );
    } finally {
      setLoadingSessionId(null);
    }
  }

  async function submitMessage(message: string) {
    const normalized = message.trim();

    if (!normalized || isPending) {
      return;
    }

    setIsPending(true);
    setError(null);
    setPaywall(null);
    setPremiumNudge(null);

    try {
      const session = activeConversation?.session ?? (await createSession());
      const response = await fetch(
        `/api/ai/ask-chart/sessions/${session.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: normalized,
          }),
        }
      );
      const payload = await readJsonResponse<MessageResponse | LimitReachedResponse>(
        response
      );

      if (payload.status === "LIMIT_REACHED") {
        trackEvent("assistant_query", {
          page: "/dashboard/ask-my-chart",
          feature: "ask-my-chart",
          plan: payload.planType,
          result: "limit-reached",
        });

        setUsageState({
          planType: payload.planType,
          aiQuestionsUsedToday: payload.aiQuestionsUsedToday,
          aiQuestionsLimitPerDay: payload.aiQuestionsLimitPerDay,
          aiQuestionsRemainingToday: payload.aiQuestionsRemainingToday,
        });
        setPaywall(payload);
        return;
      }

      trackEvent("assistant_query", {
        page: "/dashboard/ask-my-chart",
        feature: "ask-my-chart",
        plan: payload.planType,
        result: "ready",
      });
      if (payload.planType !== "FREE") {
        trackEvent("premium_feature_unlock", {
          page: "/dashboard/ask-my-chart",
          feature: "assistant-response-depth",
          plan: payload.planType,
        });
      }

      setActiveConversation(payload.conversation);
      setSessions(payload.sessions);
      setUsageState({
        planType: payload.planType,
        aiQuestionsUsedToday: payload.aiQuestionsUsedToday,
        aiQuestionsLimitPerDay: payload.aiQuestionsLimitPerDay,
        aiQuestionsRemainingToday: payload.aiQuestionsRemainingToday,
      });
      setPremiumNudge(payload.premiumNudge);
      setDraft("");
      router.replace(
        `/dashboard/ask-my-chart?session=${payload.conversation.session.id}`,
        {
          scroll: false,
        }
      );
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "The assistant could not complete this response."
      );
    } finally {
      setIsPending(false);
    }
  }

  const hasMessages = Boolean(activeConversation?.messages.length);

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <Card className="space-y-5 xl:sticky xl:top-6 xl:h-fit">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Session History
            </p>
            <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
              Reopen recent grounded chart conversations.
            </p>
          </div>
          <Button
            size="sm"
            tone="secondary"
            onClick={() =>
              startTransition(async () => {
                setActiveConversation(null);
                setError(null);
                setDraft("");
                await createSession();
              })
            }
          >
            New
          </Button>
        </div>

        <div className="space-y-3">
          {sessions.length ? (
            sessions.map((session) => {
              const isActive = activeConversation?.session.id === session.id;

              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => {
                    void loadConversation(session.id);
                  }}
                  className={`w-full rounded-[var(--radius-xl)] border px-4 py-4 text-left transition [transition-duration:var(--motion-duration-base)] ${
                    isActive
                      ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)]"
                      : "border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] hover:border-[color:var(--color-border-strong)]"
                  }`}
                >
                  <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-foreground)]">
                    {session.title}
                  </p>
                  <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                    {session.preview}
                  </p>
                  <p className="mt-3 text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                    {loadingSessionId === session.id
                      ? "Loading..."
                      : formatDateTime(session.updatedAtUtc)}
                  </p>
                </button>
              );
            })
          ) : (
            <div className="rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-4 py-4">
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                Your first Ask My Chart session will appear here after the first message.
              </p>
            </div>
          )}
        </div>
      </Card>

      <div className="space-y-6">
        <Card tone="accent" className="space-y-4">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Ask My Chart
            </p>
            <h2
              className="font-[family-name:var(--font-display)] text-[length:var(--font-size-title-md)] text-[color:var(--color-foreground)]"
              style={{ letterSpacing: "var(--tracking-display)" }}
            >
              A calm chart-aware copilot, grounded in your stored data only.
            </h2>
          </div>
          <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
            This assistant explains chart themes, placements, aspects, approved
            remedies, and current cycle context only when those facts are available
            through NAVAGRAHA CENTRE&apos;s grounded tool layer.
          </p>
          <div className="rounded-[var(--radius-xl)] border border-[rgba(215,187,131,0.18)] bg-[rgba(215,187,131,0.06)] px-4 py-4">
            <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Plan Access
            </p>
            <p className="mt-2 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              🔥 Currently Free (Limited Time). Ask chart-aware questions and continue into report guidance without paid prompts during launch access.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#ask-my-chart-question"
                className={buttonStyles({
                  size: "sm",
                  className: "w-full justify-center sm:w-auto",
                })}
              >
                Ask Your Question
              </Link>
              <Link
                href="/dashboard/ask-my-chart"
                className={buttonStyles({
                  size: "sm",
                  tone: "secondary",
                  className: "w-full justify-center sm:w-auto",
                })}
                onClick={() => {
                  trackEvent("premium_click", {
                    page: "/dashboard/ask-my-chart",
                    feature: "assistant-plan-access",
                  });
                  trackEvent("upgrade_started", {
                    page: "/dashboard/ask-my-chart",
                    surface: "protected",
                    feature: "assistant-plan-access",
                  });
                }}
                >
                Try NAVAGRAHA AI
              </Link>
            </div>
          </div>
        </Card>

        {error ? (
          <Card className="border-[rgba(214,116,90,0.32)] bg-[rgba(214,116,90,0.08)]">
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-foreground)]">
              {error}
            </p>
          </Card>
        ) : null}

        {paywall ? (
          <Card className="border-[rgba(215,187,131,0.28)] bg-[rgba(215,187,131,0.08)]">
            <div className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                {assistantLimitCopy.title}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-foreground)]">
                {paywall.message}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                Used today: {paywall.aiQuestionsUsedToday}/{paywall.aiQuestionsLimitPerDay}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={paywall.upgradeHref}
                  className="inline-flex rounded-full border border-[color:var(--color-border)] px-4 py-2 text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-foreground)] transition [transition-duration:var(--motion-duration-base)] hover:border-[color:var(--color-border-strong)]"
                  onClick={() => {
                    trackEvent("premium_click", {
                      page: "/dashboard/ask-my-chart",
                      feature: "assistant-limit-upgrade",
                    });
                    trackEvent("upgrade_started", {
                      page: "/dashboard/ask-my-chart",
                      feature: "assistant-limit-upgrade",
                      plan: paywall.planType,
                    });
                  }}
                >
                  {assistantLimitCopy.ctaLabel}
                </Link>
              </div>
            </div>
          </Card>
        ) : null}

        {showNearLimitPrompt ? (
          <Card className="border-[rgba(215,187,131,0.28)] bg-[rgba(215,187,131,0.08)]">
            <div className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                {assistantNearLimitCopy.title}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {assistantNearLimitCopy.message}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={assistantNearLimitCopy.upgradeHref}
                  className="inline-flex rounded-full border border-[color:var(--color-border)] px-4 py-2 text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-foreground)] transition [transition-duration:var(--motion-duration-base)] hover:border-[color:var(--color-border-strong)]"
                  onClick={() => {
                    trackEvent("premium_click", {
                      page: "/dashboard/ask-my-chart",
                      feature: "assistant-near-limit",
                    });
                    trackEvent("upgrade_started", {
                      page: "/dashboard/ask-my-chart",
                      feature: "assistant-near-limit",
                      plan: usageState?.planType,
                    });
                  }}
                >
                  {assistantNearLimitCopy.ctaLabel}
                </Link>
              </div>
            </div>
          </Card>
        ) : null}

        {showProContinuityPrompt ? (
          <Card className="border-[rgba(215,187,131,0.28)] bg-[rgba(215,187,131,0.08)]">
            <div className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                {assistantNudgeCopy.title}
              </p>
              <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {assistantNudgeCopy.message}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={assistantNudgeCopy.upgradeHref}
                  className="inline-flex rounded-full border border-[color:var(--color-border)] px-4 py-2 text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-foreground)] transition [transition-duration:var(--motion-duration-base)] hover:border-[color:var(--color-border-strong)]"
                  onClick={() => {
                    trackEvent("premium_click", {
                      page: "/dashboard/ask-my-chart",
                      feature: "assistant-pro-continuity",
                    });
                    trackEvent("upgrade_started", {
                      page: "/dashboard/ask-my-chart",
                      feature: "assistant-pro-continuity",
                      plan: usageState?.planType,
                    });
                  }}
                >
                  {assistantNudgeCopy.ctaLabel}
                </Link>
              </div>
            </div>
          </Card>
        ) : null}

        {usageState ? (
          <Card className="space-y-3">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Usage Snapshot
            </p>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Plan: {usageState.planType}. AI questions today:{" "}
              {usageState.aiQuestionsUsedToday}/
              {usageState.aiQuestionsLimitPerDay ?? "Unlimited"}.
            </p>
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
              Remaining today: {usageState.aiQuestionsRemainingToday ?? "Unlimited"}.
            </p>
          </Card>
        ) : null}

        <Card className="space-y-6">
          <div className="space-y-2">
            <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Conversation
            </p>
            <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
              {activeConversation
                ? activeConversation.session.title
                : "Start a new grounded chart conversation."}
            </p>
          </div>

          {hasMessages ? (
            <div className="space-y-4">
              {activeConversation?.messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-[var(--radius-2xl)] border px-5 py-5 ${
                    message.role === "assistant"
                      ? "border-[rgba(215,187,131,0.24)] bg-[rgba(215,187,131,0.07)]"
                      : "border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                      {message.role === "assistant" ? "Assistant" : "You"}
                    </p>
                    <p className="text-[0.68rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-muted)]">
                      {formatDateTime(message.createdAtUtc)}
                    </p>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-foreground)]">
                    {message.content}
                  </p>
                </div>
              ))}

              {isPending ? (
                <div className="rounded-[var(--radius-2xl)] border border-[rgba(215,187,131,0.24)] bg-[rgba(215,187,131,0.07)] px-5 py-5">
                  <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                    Assistant
                  </p>
                  <p className="mt-3 text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
                    Consulting your chart context...
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-5 rounded-[var(--radius-2xl)] border border-[color:var(--color-border)] bg-[rgba(255,255,255,0.02)] px-6 py-6">
              <div className="space-y-2">
                <p className="text-[length:var(--font-size-body-md)] text-[color:var(--color-foreground)]">
                  Ask a chart-grounded question to begin.
                </p>
                <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                  Suggested starting points stay within your stored chart,
                  approved remedies, and current cycle context.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {initialData.starterPrompts.map((prompt) => (
                  <Button
                    key={prompt}
                    tone="secondary"
                    size="sm"
                    onClick={() => {
                      void submitMessage(prompt);
                    }}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {premiumNudge ? (
            <div className="rounded-[var(--radius-2xl)] border border-[rgba(215,187,131,0.24)] bg-[rgba(215,187,131,0.08)] px-5 py-5">
              <p className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
                {assistantNudgeCopy.title}
              </p>
              <p className="mt-3 text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-muted)]">
                {assistantNudgeCopy.message}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={premiumNudge.href}
                  className="inline-flex rounded-full border border-[color:var(--color-border)] px-4 py-2 text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-foreground)] transition [transition-duration:var(--motion-duration-base)] hover:border-[color:var(--color-border-strong)]"
                  onClick={() => {
                    trackEvent("premium_click", {
                      page: "/dashboard/ask-my-chart",
                      feature: `assistant-nudge-${premiumNudge.reason.toLowerCase()}`,
                    });
                    trackEvent("upgrade_started", {
                      page: "/dashboard/ask-my-chart",
                      feature: `assistant-nudge-${premiumNudge.reason.toLowerCase()}`,
                      plan: usageState?.planType,
                    });
                  }}
                >
                  {premiumNudge.ctaLabel}
                </Link>
              </div>
            </div>
          ) : null}
        </Card>

        <Card id="ask-my-chart-question" className="space-y-4 scroll-mt-24">
          <label className="block space-y-3">
            <span className="text-[0.72rem] uppercase tracking-[var(--tracking-label)] text-[color:var(--color-accent)]">
              Your question
            </span>
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={5}
              maxLength={700}
              placeholder="Ask about your ascendant, a placement, a house, an aspect, a remedy, or your current cycle."
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[length:var(--font-size-body-sm)] text-[color:var(--color-muted)]">
              Keep questions chart-specific so the assistant can stay grounded.
            </p>
            <Button
              size="lg"
              onClick={() => {
                void submitMessage(draft);
              }}
              disabled={isPending || !draft.trim()}
            >
              {isPending ? "Sending..." : "Send Question"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
