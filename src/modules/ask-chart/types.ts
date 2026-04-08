export type AskMyChartMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAtUtc: string;
};

export type AskMyChartSessionSummary = {
  id: string;
  title: string;
  updatedAtUtc: string;
  preview: string;
};

export type AskMyChartConversation = {
  session: AskMyChartSessionSummary;
  messages: AskMyChartMessage[];
};

export type AskMyChartPageData =
  | {
      status: "needs-chart";
      starterPrompts: readonly string[];
    }
  | {
      status: "ready";
      starterPrompts: readonly string[];
      sessions: AskMyChartSessionSummary[];
      activeConversation: AskMyChartConversation | null;
    };
