import { getSession } from "@/modules/auth/server";
import {
  createAskMyChartSession,
  listAskMyChartSessions,
} from "@/modules/ask-chart/service";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const sessions = await listAskMyChartSessions(session.user.id);

  return Response.json({
    sessions,
  });
}

export async function POST() {
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const createdSession = await createAskMyChartSession(session.user.id);

  return Response.json(
    {
      session: createdSession,
    },
    { status: 201 }
  );
}
