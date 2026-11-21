import { Hono } from "hono";
import { useSession, type SessionEnv } from "@hono/session";
import { withZodBody, withZodQueryParams } from "../middlewares.ts";
import * as z from "zod";
import { APIClient } from "misskey-js/api.js";
import { createAuthorizationCodeRequestURL, getAuthorizationServerMetadata, getAuthorizationToken } from "../domains/miauth.ts";
import { encodeBase64Url } from "@std/encoding";
import { timingSafeEqual } from "hono/utils/buffer";
import { BeginAuthorizationRequest, GetIssuerResponse } from "../schemas/miauth.ts";
import type { Realm, SessionData } from "../domains/session.ts";

export type ClientDetail = z.infer<typeof ClientDetail>;

const url = z.codec(z.string(), z.string(), {
  encode: x => new URL(x).toString(),
  decode: x => new URL(x).toString()
});

export const ClientDetail =
  z.object({
    client_id: url,
    redirect_uri: url
  });

export type Issuer = z.infer<typeof Issuer>;

export const Issuer =
  z.object({
    pattern: z.codec(
      z.string(),
      z.instanceof(RegExp),
      {
        decode: x => new RegExp(x),
        encode: x => x.source
      }
    ),
    origin: z.url()
  });

export type MiAuthOptions = z.infer<typeof MiAuthOptions>;

export const MiAuthOptions =
  z.object({
    clientDetail: ClientDetail,
    issuers: z.array(Issuer)
  });

export type MiAuthContext = SessionEnv<SessionData> & {
  Variables: {
    realm: Realm,
    miauth: MiAuthOptions
  }
};

const app = new Hono<MiAuthContext>();

app.get(
  "/issuers",
  ctx => {
    const { issuers } = ctx.get("miauth");

    return ctx.json(GetIssuerResponse.encode({
      issuers: issuers.map(x => x.origin)
    }));
  }
);

app.post(
  "/auth",
  withZodBody(BeginAuthorizationRequest),
  async ctx => {
    const { iss } = ctx.req.valid("json");

    const { clientDetail, issuers } = ctx.get("miauth");
    const issuer = issuers.find(x => new RegExp(x.pattern, "y").test(iss));
    if (issuer == null) {
      ctx.status(400);
      return ctx.text("invald issuer");
    }

    const metadata = await getAuthorizationServerMetadata(issuer.origin);
    if (metadata == null) {
      ctx.status(400);
      return ctx.text("this misskey instance is not supported.");
    }

    const codeVerifier = encodeBase64Url(crypto.getRandomValues(new Uint8Array(24)));
    const state = encodeBase64Url(crypto.getRandomValues(new Uint8Array(12)));

    const url = await createAuthorizationCodeRequestURL(metadata.authorization_endpoint, {
      clientId: clientDetail.client_id,
      redirectUri: clientDetail.redirect_uri,
      state,
      codeVerifier,
      scope: "read:account"
    });

    await ctx.var.session.update({
      kind: "miauth.req",
      verifier: codeVerifier,
      state
    });

    return ctx.text(url.toString());
  }
);

app.get(
  "/redirect",
  withZodQueryParams(z.object({
    code: z.string(),
    iss: z.url(),
    state: z.string()
  })),
  async ctx => {
    const { code, iss, state } = ctx.get("queries");
    const session = await ctx.var.session.get();
    if (session?.kind !== "miauth.req") {
      ctx.status(400);
      return ctx.text("invalid session");
    }

    if (await timingSafeEqual(state, session.state) === false) {
      ctx.status(400);
      return ctx.text("invalid state");
    }

    const { clientDetail, issuers } = ctx.get("miauth");
    const issuer = issuers.find(x => new RegExp(x.pattern, "y").test(iss));
    if (issuer == null) {
      ctx.status(400);
      return ctx.text("invald issuer");
    }

    const metadata = await getAuthorizationServerMetadata(issuer.origin);
    if (metadata == null) {
      ctx.status(400);
      return ctx.text("this misskey instance is not supported.");
    }

    const result = await getAuthorizationToken(metadata.token_endpoint, {
      code,
      clientId: clientDetail.client_id,
      redirectUri: clientDetail.redirect_uri,
      codeVerifier: session.verifier,
    });
    if (result == null) {
      ctx.status(500);
      return ctx.text("failed to get authorization token.");
    }

    const realm = ctx.get("realm");

    const client = new APIClient({
      origin: issuer.origin,
      credential: result.access_token
    });

    const user = await client.request("i", {});

    const userSession = await realm.createUserSession({
      origin: issuer.origin,
      iconUrl: user.avatarUrl,
      userId: user.id,
      username: user.username
    });

    await ctx.var.session.update({
      kind: "session.logged-in",
      id: userSession.id,
      exp: userSession.expiresAt
    });

    return ctx.redirect("/");
  }
);

export default app;
