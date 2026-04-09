import { createEntityHandlers } from "@/lib/server-api";

export const { GET, PUT, DELETE } = createEntityHandlers((id) => `/users/${id}`);
