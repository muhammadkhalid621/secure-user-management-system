import { getServerSessionResponse } from "@/lib/server-api";

export async function GET() {
  return getServerSessionResponse();
}
