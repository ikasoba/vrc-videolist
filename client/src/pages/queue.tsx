import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { getOwnedQueueByID } from "../hooks/client.ts";
import * as client from "../hooks/client.ts";
import { Grid, GridArea, GridLayout } from "../components/Grid.tsx";
import { FullSelectableText } from "../components/FullSelectableText.tsx";
import { Horizontal } from "../components/Horizontal.tsx";
import { Box } from "../components/Box.tsx";
import { List } from "../components/List.tsx";
import { Button } from "../components/Button.tsx";
import { Textarea } from "../components/Textarea.tsx";
import type { OwnedQueue, Queue, QueueItem } from "server/src/domains/queue.js";
import { useComputed, useSignal } from "@preact/signals";
import type { Signalish } from "preact";

interface QueueDetailProps {
  id: string;
  credential?: string | null;
}

function QueueDetail({ id, credential }: QueueDetailProps) {
  const queueCurrentURL = useMemo(() => {
    return client.toQueueCurrentURL(id);
  }, [id]);

  const queueNextURL = useMemo(() => {
    if (credential == null) return null;

    return client.toQueueNextURL(id, credential);
  }, [id, credential]);

  return (
    <Grid
      areas={[["label", "content"]]}
      columns={["auto", "1fr"]}
    >
      <span> キュー ID </span>
      <FullSelectableText text={id} />
      <span> 動画スロットの URL </span>
      <FullSelectableText text={queueCurrentURL.toString()} />
      {
        queueNextURL != null
          ?
          <>
            <span> 次へスイッチの URL </span>
            <FullSelectableText text={queueNextURL.toString()} />
          </>
          : null
      }
    </Grid>
  );
}

function QueueStatus({ offset, isOwned }: { offset: number; isOwned: boolean; }) {
  return (
    <Horizontal>
      <Box>
        <span> 管理権限 </span>
        <span> {isOwned ? "あり" : "なし"} </span>
      </Box>
      <Box>
        <span> キューのオフセット </span>
        <span> {offset} </span>
      </Box>
    </Horizontal>
  );
}

function QueueList({ urls }: { urls: QueueItem[]; }) {
  return (
    <List label="動画キュー内容">
      {urls.map(x =>
        <Box>
          <FullSelectableText text={x.url} />
        </Box>
      )}
    </List>
  );
}

interface AddQueueItemFormProps {
  onSubmit?: (data: string[]) => void;
  disabled?: Signalish<boolean>;
}

function AddQueueItemForm({ onSubmit, disabled: rawDisabled }: AddQueueItemFormProps) {
  const urls = useSignal("");
  const disabled = useComputed((): boolean => typeof rawDisabled == "boolean" ? rawDisabled : !!rawDisabled?.value);

  const onChange = useCallback((newValue: string) => {
    urls.value = newValue;
  }, []);

  const onSubmitHandler = useCallback((e: Event) => {
    e.preventDefault();
    if (disabled.value) return;

    const parsedUrls = urls.value.split(/\n+/).map(x => new URL(x).toString());

    urls.value = "";

    onSubmit?.(parsedUrls);
  }, [onSubmit]);

  return (
    <form onSubmit={onSubmitHandler} style={{ display: "grid" }}>
      <GridLayout
        areas={[["button", "."], ["field", "field"]]}
        columns={["auto", "1fr"]}
        rows={["auto", "1fr"]}
        gap="0.5rem"
      >
        <GridArea area="button">
          <Button
            disabled={disabled}
          >
            ADD
          </Button>
        </GridArea>
        <GridArea area="field">
          <Textarea
            value={urls}
            onChange={onChange}
            pattern="^(https?|rtmps?):.*$"
            minLength={1}
            placeholder="https?:// OR rtmps?:// ..."
            required
            disabled={disabled}
          />
        </GridArea>
      </GridLayout>
    </form>
  );
}

export function QueuePage({ params }: { params: { id: string; } }) {
  const { id } = params;
  const isFormDisabled = useSignal(false);
  const [queue, setQueue] = useState<Queue & { credential?: undefined; } | OwnedQueue | null>();

  useEffect(() => {
    (async () => {
      const queue = await client.getQueueByID(id);
      if (queue == null) {
        setQueue(null);
      } else {
        setQueue(x => ({ ...queue, credential: getOwnedQueueByID(id)?.credential }));
      }
    })();
  }, [id]);

  const onAddItems = useCallback(async (items: string[]) => {
    isFormDisabled.value = true;

    const data = await client.appendToQueue(id, items);
    setQueue(x => ({ ...data, credential: x?.credential }));

    isFormDisabled.value = false;
  }, [id]);

  return (
    <>
      {
        queue ?
          <GridLayout
            rows={["auto", "auto", "2fr", "1fr"]}
            flow="column"
            gap="0.5rem"
          >
            <QueueDetail id={queue.id} credential={queue.credential ?? null} />
            <QueueStatus offset={queue.offset} isOwned={queue.credential != null} />
            <QueueList urls={queue.urls} />
            <AddQueueItemForm onSubmit={onAddItems} disabled={isFormDisabled} />
          </GridLayout>
          : "not found"
      }
    </>
  )
}
