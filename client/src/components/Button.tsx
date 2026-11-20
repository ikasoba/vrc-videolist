import type { ComponentChildren, Signalish } from "preact";
import classes from "./Button.module.css";
import { withClasses } from "../utils/classes.ts";

export interface ButtonProps {
  children?: ComponentChildren;
  rounded?: boolean;
  disabled?: Signalish<boolean>;
  bold?: boolean;
  onClick?: () => void;
}

export function Button({ children,rounded, onClick, disabled, bold = true }: ButtonProps) {
  return (
    <button className={withClasses([
        classes.Button,
        rounded ? classes.rounded : null,
        bold ? classes.bold : null,
      ])} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
