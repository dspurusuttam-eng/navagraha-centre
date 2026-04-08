"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
  conversation: AskMyChartConversation;
  sessions: AskMyChartSessionSummary[];
};

async function readJsonResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "The assistant request could not be completed.");
  }

  return payload;
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
      const payload = await readJsonResponse<MessageResponse>(response);

      setActiveConversation(payload.conversation);
      setSessions(payload.sessions);
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
        </Card>

        {error ? (
          <Card className="border-[rgba(214,116,90,0.32)] bg-[rgba(214,116,90,0.08)]">
            <p className="text-[length:var(--font-size-body-sm)] leading-[var(--line-height-copy)] text-[color:var(--color-foreground)]">
              {error}
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
        </Card>

        <Card className="space-y-4">
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
