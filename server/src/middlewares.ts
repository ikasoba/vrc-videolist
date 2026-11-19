import type { MiddlewareHandler } from "hono";
import * as z from "zod";

export function withZodBody<T extends {}>(schema: z.ZodType<T>): MiddlewareHandler<{}, string, { out: { json: T } }> {
  return async (ctx, next) => {
    const result = schema.safeParse(await ctx.req.json());
    if (!result.success) {
      ctx.status(400);
      return ctx.text("invalid body");
    }

    ctx.req.addValidatedData("json", result.data);

    return next();
  };
}

export function withBearerToken(): MiddlewareHandler<{ Variables: { bearer: string; } }, string> {
  return async (ctx, next) => {
    const token = ctx.req.header("Authorization")?.match(/^[Bb][Ee][Aa][Rr][Ee][Rr]\s+(.+)$/)?.[1] ?? ctx.req.query("access_token");
    if (token == null) {
      ctx.status(401);
      ctx.header("WWW-Authenticate", "Bearer");

      return ctx.text("invalid credential");
    }

    ctx.set("bearer", token);
    
    return next();
  };  
}
