import * as z from "zod";

export interface CreateUserSessionParams {
  origin: string;
  userId: string;
  iconUrl: string | null;
  username: string;
}

export interface Realm {
  createUserSession(params: CreateUserSessionParams): Promise<{ id: string; expiresAt: string; }>;
  delete(id: string): Promise<void>;
}

export type SessionDataMiAuthReq = z.infer<typeof SessionDataMiAuthReq>;
export const SessionDataMiAuthReq =
  z.object({
    kind: z.literal("miauth.req"),
    verifier: z.string(),
    state: z.string()
  });

export type SessionDataLoggedIn = z.infer<typeof SessionDataLoggedIn>;
export const SessionDataLoggedIn =
  z.object({
    kind: z.literal("session.logged-in"),
    id: z.string(),
    exp: z.string()
  });

export type SessionData = z.infer<typeof SessionData>;
export const SessionData =
  z.union([
    SessionDataMiAuthReq,
    SessionDataLoggedIn
  ]);
