import { createCollectionHandlers } from "@/lib/server-api";

export const { GET, POST } = createCollectionHandlers("/users");
