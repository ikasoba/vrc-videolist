import { serve } from "@hono/node-server";
import app from "./app.ts";

serve({
  fetch: app.fetch,
  port: +(process.env.PORT ?? "3000")
}, console.log);
