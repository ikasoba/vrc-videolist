import { useCallback, useState } from "preact/hooks";
import type { Queue } from "server/src/domains/queue.ts";
import { useLocation } from "preact-iso";
import { getOwnedQueueByID } from "../hooks/client.ts";

export function QueuePage({ params }: { params: { id: string; } }) {
  const { id } = params;

  
  return (
    <>
      {id} <br/>
      {JSON.stringify(getOwnedQueueByID(id))}
    </>
  )
}
