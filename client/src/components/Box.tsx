import type { ComponentChildren } from "preact";
import classes from "./Box.module.css";
import { withClasses } from "../utils/classes.ts";

export interface BoxProps {
  children?: ComponentChildren;
  rounded?: boolean;
}

export function Box({ children,rounded }: BoxProps) {
  return (
    <div className={withClasses([ classes.Box, rounded ? classes.rouned : null ])}>
      {children}
    </div>
  );
}
