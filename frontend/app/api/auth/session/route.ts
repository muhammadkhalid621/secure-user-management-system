import { getServerSession, successJson, unauthorizedJson } from "@/lib/server-api";

export async function GET() {
  const session = await getServerSession();

  if (!session) {
    return unauthorizedJson();
  }

  return successJson(session);
}
