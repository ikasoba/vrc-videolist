import type { InputEventHandler, InputHTMLAttributes, Signalish } from "preact";
import { useCallback } from "preact/hooks";
import classes from "./Textarea.module.css";

export type TextareaProps = Omit<InputHTMLAttributes<HTMLTextAreaElement>, `on${string}` | "value"> & {
  value: Signalish<string>;
  onChange?: (url: string) => void;
  name?: string;
}

export function Textarea({ value, name, onChange, ...attrs }: TextareaProps) {
  const onChangeHandler: InputEventHandler<HTMLTextAreaElement> =
    useCallback((ev) => {
      onChange?.(ev.currentTarget.value);
    }, [onChange]);

  return (
    <div className={classes.Textarea}>
      <label className={classes.contents}>
        <span className={classes.label}>
          URL
        </span>
        <textarea
          {...attrs as {}}
          value={value}
          className={classes.input}
          name={name}
          autocomplete="off"
          onChange={onChangeHandler}
        >{value}</textarea>
      </label>
    </div>
  );
}
