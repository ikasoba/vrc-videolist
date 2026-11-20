import { open } from "lmdb";

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

  const routine = async () => {
    await db.transaction(async () => {
      const now = (Date.now() / 1000) >>> 0;

      const it = db.getRange({
        end: `.meta:ttl:${now}`,
        start: `.meta:ttl:`,
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
      return await db.remove(`.data:${k}`);
    },
    async get(k) {
      return await db.get(`.data:${k}`);
    },
    async set(k, data, options) {
      await db.batch(async () => {
        if (options?.ttl != null) {
          const now = Date.now() / 1000;
          const ttl = now + options.ttl;
          await db.put(`.meta:ttl:${ttl>>>0}:${k}`, `.data:${k}`);
        }

        await db.put(`.data:${k}`, data);

        return data;
      });
    },
  }
}
