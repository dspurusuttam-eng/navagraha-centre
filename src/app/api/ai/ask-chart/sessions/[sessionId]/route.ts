import { getSession } from "@/modules/auth/server";
import { getAskMyChartConversation } from "@/modules/ask-chart/service";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
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

  const { sessionId } = await context.params;
  const conversation = await getAskMyChartConversation(
    session.user.id,
    sessionId
  );

  if (!conversation) {
    return Response.json(
      { error: "Conversation could not be found." },
      { status: 404 }
    );
  }

  return Response.json({
    conversation,
  });
}
