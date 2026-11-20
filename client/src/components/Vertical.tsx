import type { ComponentChildren, CSSProperties } from "preact";
import classes from "./Vertical.module.css";

export interface VerticalProps {
  children?: ComponentChildren;
  style?: CSSProperties;
}

export function Vertical({ children, style }: VerticalProps) {
  return (
    <div className={classes.Vertical} style={style}>
      {children}
    </div>
  )
}
