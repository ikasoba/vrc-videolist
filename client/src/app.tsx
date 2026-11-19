import { useCallback, useState } from "preact/hooks";
import * as client from "./hooks/client.ts";
import type { Queue } from "server/src/domains/queue.ts";
import { useLocation } from "preact-iso";

function OpenQueueButton() {
  const { route } = useLocation();
  const [isDisabled, setDisabled] = useState(false);
  const onClick = useCallback(async () => {
    setDisabled(true);
    
    const queue = await client.createQueue();

    route(`/queue/${queue.id}`);

    setDisabled(false);
  }, [ ]);
  
  return (
    <button disabled={isDisabled} onClick={onClick}>
      新しいキューをひらく
    </button>    
  );
}

export function App() {
  return (
    <>
      <OpenQueueButton />
    </>
  )
}
