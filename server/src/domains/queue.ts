import * as z from "zod";

export type Queue = z.infer<typeof Queue>;

export type QueueItem = z.infer<typeof QueueItem>;
export const QueueItem =
  z.object({
    id: z.string(),
    url: z.url()
  });


export const Queue =
  z.object({
    id: z.string(),
    offset: z.number(),
    urls: z.array(QueueItem)
  });

export type OwnedQueue = z.infer<typeof OwnedQueue>;

export const OwnedQueue =
  z.intersection(
    Queue,
    z.object({
      credential: z.string()
    })
  )

export interface QueueService {
  create(): Promise<OwnedQueue>;
  delete(id: string, credential: string): Promise<boolean>;
  get(id: string): Promise<Queue | null>;
  getCurrentURL(id: string): Promise<string | null>;
  incrementURLOffset(id: string, credential: string): Promise<number | false>;
  appendURL(id: string, data: string[]): Promise<Queue>;
  removeURL(id: string, indices: string[]): Promise<Queue>;
}
