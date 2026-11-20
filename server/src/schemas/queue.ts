import * as z from "zod";

export type AppendURLRequest = z.infer<typeof AppendURLRequest>;
export const AppendURLRequest =
  z.array(z.url())
  ;

export type DeleteURLRequest = z.infer<typeof DeleteURLRequest>;
export const DeleteURLRequest =
  z.array(z.string())
  ;
