import type { SessionEnv } from "@hono/session";
import type { MiddlewareHandler } from "hono";
import * as z from "zod";
import type { Realm, SessionData, SessionDataLoggedIn } from "./domains/session.ts";

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

export function withZodQueryParams<T extends {}>(schema: z.ZodType<T>): MiddlewareHandler<{ Variables: { queries: T; } }, string> {
  return async (ctx, next) => {
    const result = schema.safeParse(ctx.req.query());
    if (!result.success) {
      ctx.status(400);
      return ctx.text("invalid query params");
    }

    ctx.set("queries", result.data);

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

export function withLoggedInSession(): MiddlewareHandler<{ Variables: { realm: Realm } } & SessionEnv<SessionData>, string> {
  return async (ctx, next) => {
    const realm = ctx.get("realm");
    
    const session = await ctx.var.session.get();
    if (session?.kind !== "session.logged-in") {
      ctx.status(400);
      return ctx.text("invalid session");
    }

    const date = new Date(session.exp);
    if (date.getTime() <= Date.now()) {
      await realm.delete(session.id);
      ctx.var.session.delete();
      
      ctx.status(400);
      return ctx.text("invalid session");      
    }

    return next();
  }
}
