import { useCallback, useRef } from "preact/hooks";

export interface FullSelectableTextProps {
  text: string;
}

export function FullSelectableText({ text }: FullSelectableTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const onClick = useCallback(() => {
    const span = ref.current;
    if (span == null) return;

    const sel = document.getSelection();
    if (sel == null) return;

    // 選択後に click イベントが発火されるので、
    // 意図的に選択されてる場合は全選択しないようにして操作感をいい感じにする

    const nonEmptySelections =
      sel.getComposedRanges()
        .filter(x => x.startContainer !== x.endContainer || x.startOffset !== x.endOffset);

    const isSpanContain =
      nonEmptySelections.some(x => {
        return (
          x.startContainer.contains(span)
          || x.endContainer.contains(span)
          || span.contains(x.startContainer)
          || span.contains(x.endContainer)
        );
      });

    if (nonEmptySelections.length && isSpanContain) return;

    const range = document.createRange();

    range.selectNodeContents(span);

    sel.addRange(range);
  }, []);

  return (
    <span ref={ref} onClick={onClick} onSelect={console.log}>
      {text}
    </span>
  )
}
