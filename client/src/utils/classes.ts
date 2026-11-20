export const withClasses = (classes: (string | null | undefined)[]) => classes.filter(x => x != null).join(" ");
