import classes from "./Separator.module.css";

export interface SeparatorProps {
  label: string;
}

export function Separator({ label }: SeparatorProps) {
  return (
    <div className={classes.Separator}>
      {label}
    </div>
  )
}
