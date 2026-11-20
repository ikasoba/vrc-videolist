import type { ComponentChildren } from "preact";
import classes from "./Horizontal.module.css";

export interface HorizontalProps {
  children?: ComponentChildren;
}

export function Horizontal({ children }: HorizontalProps) {
  return (
    <div className={classes.Horizontal}>
      {children}
    </div>
  )
}
