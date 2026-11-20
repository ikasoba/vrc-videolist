import { encodeBase64Url } from "@std/encoding";
import { OwnedQueue, Queue, type QueueService } from "../../domains/queue.ts";
import * as argon2 from "@node-rs/argon2";

export interface KVS {
  get(key: string): Promise<unknown>;
  set(key: string, data: unknown, options?: { ttl: number }): Promise<void>;
  delete(key: string): Promise<boolean>;
}

export class KVSQueueService implements QueueService {
  private kvs: KVS;
  private idFactory: () => string;

  constructor(kvs: KVS, idFactory: () => string) {
    this.kvs = kvs;
    this.idFactory = idFactory;
  }

  async #save(owned: OwnedQueue): Promise<void> {
    await this.kvs.set(owned.id, OwnedQueue.encode(owned), { ttl: 60 * 60 * 3 });
  }

  async create(): Promise<OwnedQueue> {
    const credential = encodeBase64Url(crypto.getRandomValues(new Uint8Array(24)));

    const hash = await argon2.hash(credential);
    const owned: OwnedQueue = {
      id: this.idFactory(),
      credential: hash,
      offset: 0,
      urls: []
    };

    await this.#save(owned);

    return { ...owned, credential };
  }

  async delete(id: string, credential: string): Promise<boolean> {
    const data = await this.#getOwned(id);
    if (data == null) return true;

    const isOK = await argon2.verify(data.credential, credential);
    if (isOK == false) return false;

    await this.kvs.delete(id);

    return true;
  }

  async get(id: string): Promise<Queue | null> {
    return await this.kvs.get(id)
      .then(x => {
        if (x == null) return null;

        return Queue.parse(x);
      });
  }

  async #getOwned(id: string): Promise<OwnedQueue | null> {
    const raw = await this.kvs.get(id)
    if (raw == null) return null;

    return OwnedQueue.parse(raw);
  }

  async getCurrentURL(id: string): Promise<string | null> {
    const data = await this.get(id);
    if (data == null) return null;

    return data.urls[data.offset]?.url ?? null;
  }

  async incrementURLOffset(id: string, credential: string): Promise<number | false> {
    const data = await this.#getOwned(id);
    if (data == null) return false;

    const isOK = await argon2.verify(data.credential, credential);
    if (isOK == false) return false;

    data.offset = (data.offset + 1) % data.urls.length;

    this.#save(data);

    return data.offset;
  }

  async appendURL(id: string, urls: string[]): Promise<Queue> {
    const data = await this.#getOwned(id);
    if (data == null) throw "not found";

    data.urls.push(...urls.map(x => ({ id: this.idFactory(), url: x })));
    data.urls = data.urls.slice(-2048);
    data.offset = Math.min(data.offset, data.urls.length);

    this.#save(data);

    return Queue.encode(data);
  }

  async removeURL(id: string, indices: string[]): Promise<Queue> {
    const data = await this.#getOwned(id);
    if (data == null) throw "not found";

    const keys = new Set(indices);
    data.urls = data.urls.filter(({ id }) => keys.has(id) == false);
    data.offset = Math.min(data.offset, data.urls.length);

    this.#save(data);

    return Queue.encode(data);
  }
}
