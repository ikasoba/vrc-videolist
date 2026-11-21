import * as z from "zod";

export type GetIssuerResponse = z.infer<typeof GetIssuerResponse>;
export const GetIssuerResponse =
  z.object({
    issuers: z.array(z.url())
  });

export type BeginAuthorizationRequest = z.infer<typeof BeginAuthorizationRequest>;
export const BeginAuthorizationRequest =
  z.object({
    iss: z.url()
  })
