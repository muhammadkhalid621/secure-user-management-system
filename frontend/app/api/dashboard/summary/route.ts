import { proxyBackendRequest } from "@/lib/server-api";

export async function GET() {
  return proxyBackendRequest({
    path: "/dashboard/summary",
    method: "GET"
  });
}
