import { getSession } from "@/modules/auth/server";
import {
  listAskMyChartSessions,
  sendAskMyChartMessage,
} from "@/modules/ask-chart/service";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: {
    params: Promise<{
      sessionId: string;
    }>;
  }
) {
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as
    | {
        message?: string;
      }
    | null;
  const message = payload?.message ?? "";
  const { sessionId } = await context.params;

  try {
    const result = await sendAskMyChartMessage({
      userId: session.user.id,
      userName: session.user.name,
      sessionId,
      message,
    });

    if (result.status === "LIMIT_REACHED") {
      return Response.json(result, { status: 200 });
    }

    const conversation = result.conversation;

    if (!conversation) {
      return Response.json(
        { error: "Conversation could not be loaded after sending." },
        { status: 500 }
      );
    }

    const sessions = await listAskMyChartSessions(session.user.id);

    return Response.json({
      status: "READY",
      conversation,
      sessions,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The assistant could not complete this response.",
      },
      { status: 400 }
    );
  }
}
