import type { ComponentChildren } from "preact";
import classes from "./Grid.module.css";
import { withClasses } from "../utils/classes.ts";

export interface GridLayoutProps {
  className?: string;
  children?: ComponentChildren;
  areas?: string[][];
  columns?: string[];
  rows?: string[];
  gap?: string;
  flow?: `${"row" | "column"}${" dense" | ""}`;
}

export function Grid({ className, children, ...attrs }: GridLayoutProps) {
  return (
    <div className={withClasses([className, classes.Grid])}>
      <GridLayout {...attrs}>
        {children}
      </GridLayout>
    </div>
  );
}

export function GridLayout({ className, children, areas, columns, rows, flow, gap }: GridLayoutProps) {
  return (
    <div className={withClasses([className, classes.GridLayout])} style={{
      gridTemplateAreas: areas?.map(x => '"' + x.join(" ") + '"').join("\n"),
      gridTemplateColumns: columns?.join(" "),
      gridTemplateRows: rows?.join(" "),
      gridAutoFlow: flow,
      gap
    }}>
      {children}
    </div>
  );
}

export interface GridAreaProps {
  area: string;
  children?: ComponentChildren;
}

export function GridArea({ area, children }: GridAreaProps) {
  return (
    <div className={classes.GridArea} style={{ gridArea: area }}>
      {children}
    </div>
  );
}
