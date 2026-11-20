import { OwnedQueue, Queue } from "server/src/domains/queue.ts";

export async function getQueueByID(id: string): Promise<Queue | null> {
  return await (
    fetch(`/q/${encodeURIComponent(id)}`)
      .then(async x => Queue.parse(await x.json()))
      .catch(err => {
        localStorage.removeItem(`vrc-queue:queue:${id}`);

        return null;
      })
  );
}

export function getOwnedQueueByID(id: string): OwnedQueue | null {
  const raw = localStorage.getItem(`vrc-queue:queue:${id}`);
  if (raw == null) return null;

  return OwnedQueue.parse(JSON.parse(raw));
}

export function toQueueCurrentURL(id: string) {
  return new URL(`/q/${encodeURIComponent(id)}/curr`, location.origin);
}

export function toQueueNextURL(id: string, token: string) {
  const nextURL = new URL(`/q/${encodeURIComponent(id)}/next`, location.origin);

  nextURL.searchParams.set("access_token", token);

  return nextURL;
}

export async function createQueue(): Promise<OwnedQueue> {
  return await (
    fetch(`/q`, {
      method: "POST"
    })
      .then(async x => OwnedQueue.parse(await x.json()))
      .then(x => {
        localStorage.setItem(`vrc-queue:queue:${x.id}`, JSON.stringify(x));

        return x;
      })
  );
}

export async function deleteQueue(token: string): Promise<boolean> {
  return await (
    fetch(`/q`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(x => {
        return x.ok;
      })
  );
}

export async function appendToQueue(id: string, values: string[]): Promise<Queue> {
  return await (
    fetch(`/q/${encodeURIComponent(id)}/items`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    })
      .then(async x => {
        return Queue.parse(await x.json());
      })
  );
}

export async function removeQueueItems(id: string, indices: number[]): Promise<Queue> {
  return await (
    fetch(`/q/${encodeURIComponent(id)}/items`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(indices)
    })
      .then(async x => {
        return Queue.parse(await x.json());
      })
  );
}
