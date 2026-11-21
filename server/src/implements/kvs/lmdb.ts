import { open } from "lmdb";
import * as z from "zod";

const KVSEntry =
  z.object({
    data: z.unknown(),
    ttl: z.nullable(z.number())
  });

export interface KVS {
  get(key: string): Promise<unknown>;
  set(key: string, data: unknown, options?: { ttl: number }): Promise<void>;
  delete(key: string): Promise<boolean>;
}

export function createKVS(base: string, abortSignal: AbortSignal): KVS {
  const dstack = new AsyncDisposableStack();
  abortSignal.addEventListener("abort", async () => {
    if (!dstack.disposed) {
      await dstack.disposeAsync();
    }
  });

  const db = open(base, { encoding: "msgpack" });
  dstack.defer(() => db.close());

  const ttlKeyMin = "0".repeat(16);
  const ttlKeyMax = "f".repeat(16);
  const encodeTTLKey = (date: Date) => ((date.getTime() / 1000) >>> 0).toString(16).slice(-16).padStart(16, "0").toLowerCase();

  const routine = async () => {
    await db.transaction(async () => {
      const now = encodeTTLKey(new Date());

      const it = db.getRange({
        end: `.meta:ttl:${now}:`,
        start: `.meta:ttl:${ttlKeyMin}:`,
        inclusiveEnd: true,
        exclusiveStart: true,
        limit: 4096
      });

      for (const item of it) {
        await db.remove(item.value);
      }
    });

    if (abortSignal.aborted) return;
    setTimeout(routine, 1000 * 60 * 30);
  };

  queueMicrotask(routine);

  return {
    async delete(k) {
      return await db.transaction(async () => {
        const it = db.getRange({
          end: `.meta:ttl:${ttlKeyMax}:${k}`,
          start: `.meta:ttl:${ttlKeyMin}:${k}`,
          inclusiveEnd: true,
          exclusiveStart: true
        });

        for (const item of it) {
          await db.remove(item.value);
        }

        return await db.remove(`.data:${k}`);
      });
    },
    async get(k) {
      const result = KVSEntry.safeParse(await db.get(`.data:${k}`));
      if (!result.success) {
        return undefined;
      }

      const entry = result.data;

      if (entry.ttl != null && entry.ttl >= Date.now()) {
        await this.delete(k);

        return undefined;
      }

      return entry.data;
    },
    async set(k, data, options) {
      await db.batch(async () => {
        let ttl: Date | undefined;
        if (options?.ttl != null) {
          ttl = new Date(Date.now() + options.ttl * 1000);
          const ttlKey = encodeTTLKey(ttl);
          await db.put(`.meta:ttl:${ttlKey}:${k}`, `.data:${k}`);
        }

        await db.put(`.data:${k}`, KVSEntry.encode({
          ttl: ttl?.getTime() ?? null,
          data: data
        }));

        return data;
      });
    },
  }
}
