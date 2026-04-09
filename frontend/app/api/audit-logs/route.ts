import { createCollectionHandlers } from "@/lib/server-api";

export const { GET } = createCollectionHandlers("/audit-logs");
