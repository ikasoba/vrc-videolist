import type { ComponentChildren } from "preact";
import classes from "./List.module.css";

export interface ListProps {
  children?: ComponentChildren[];
  label?: string | null;
}

export function List({ children, label }: ListProps) {
  return (
    <div className={classes.List}>
      {label ?
        <div className={classes.label}>
          {label}
        </div>
        : null}
      <ul>
        {children?.map(x =>
          <li>
            {x}
          </li>
        )}
      </ul>
    </div>
  )
}
