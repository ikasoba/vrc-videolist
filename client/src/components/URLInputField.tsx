import type { GenericEventHandler, InputEventHandler, InputHTMLAttributes, PartialInputHTMLAttributes } from "preact";
import { useCallback } from "preact/hooks";
import classes from "./URLInputField.module.css";

export type URLInputFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, `on${string}` | "value"> & {
  url: string;
  onChange?: (url: string) => void;
  name?: string;
}

export function URLInputField({ url, name, onChange, ...attrs }: URLInputFieldProps) {
  const onChangeHandler: InputEventHandler<HTMLInputElement> =
    useCallback((ev) => {
      onChange?.(ev.currentTarget.value);
    }, [onChange]);

  return (
    <div className={classes.URLInputField}>
      <label className={classes.contents}>
        <span className={classes.label}>
          URL
        </span>
        <input
          {...attrs as {}}
          className={classes.input}
          name={name}
          type="url"
          autocomplete="off"
          value={url}
          onChange={onChangeHandler}
        />
      </label>
    </div>
  );
}
