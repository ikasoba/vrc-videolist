import { encodeBase64Url } from "@std/encoding";
import * as z from "zod";

export type OAuthAuthoriationServerMetadata = z.infer<typeof OAuthAuthoriationServerMetadata>;

export const OAuthAuthoriationServerMetadata =
  z.object({
    issuer: z.url(),
    authorization_endpoint: z.string(),
    token_endpoint: z.string(),
    scopes_supported: z.array(z.string()),
    response_types_supported: z.array(z.string()),
    grant_types_supported: z.array(z.string()),
    code_challenge_methods_supported: z.array(z.string())
  });

export const getAuthorizationServerMetadata = async (origin: string) => {
  return (
    await fetch(new URL("./.well-known/oauth-authorization-server", origin))
      .then(async x => {
        return OAuthAuthoriationServerMetadata.safeParse(await x.json())
      })
      .then(x => {
        return x.success ? x.data : null;
      })
  )
}

export type OAuthTokenResponse = z.infer<typeof OAuthTokenResponse>;

export const OAuthTokenResponse =
  z.object({
    access_token: z.string(),
    scope: z.string(),
    refresh_token: z.optional(z.string())
  });

export interface GetAuthorizationTokenOptions {
  clientId: string;
  redirectUri: string;
  code: string;
  codeVerifier: string;
}

export async function getAuthorizationToken(endpoint: URL | string, { code, clientId, redirectUri, codeVerifier }: GetAuthorizationTokenOptions) {
  const params = new URLSearchParams();

  params.set("grant_type", "authorization_code");
  params.set("code", code);
  params.set("client_id", clientId);
  params.set("redirect_uri", redirectUri);
  params.set("code_verifier", codeVerifier);

  return (
    await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString()
    })
      .then(async x => {
        const data = await x.json();
        return OAuthTokenResponse.safeParse(data)
      })
      .then(x => {
        return x.success ? x.data : null;
      })
  )
}

export interface GetAuthorizationCodeOptions {
  clientId: string;
  redirectUri: string;
  state: string;
  codeVerifier: string;
  scope: string;
}

export async function createAuthorizationCodeRequestURL(endpoint: URL | string, { clientId, redirectUri, state, codeVerifier, scope }: GetAuthorizationCodeOptions) {
  const codeChallengeDigest = await crypto.subtle.digest("sha-256", new TextEncoder().encode(codeVerifier));
  const codeChallenge = encodeBase64Url(codeChallengeDigest);

  const url = new URL(endpoint);
  const params = url.searchParams;

  params.set("response_type", "code");
  params.set("client_id", clientId);
  params.set("redirect_uri", redirectUri);
  params.set("state", state);
  params.set("code_challenge", codeChallenge);
  params.set("code_challenge_method", "S256");
  params.set("scope", scope);

  return url;
}
