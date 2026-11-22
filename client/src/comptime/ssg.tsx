import { createContext, type ComponentChildren, type VNode } from "preact";
import { useContext, useLayoutEffect } from "preact/hooks";

export interface SSGContext {
  title: string;
  elements: Set<VNode>;
}

export const SSGContext = createContext<SSGContext | null>(null);

export function Head({ children }: { children: VNode[] | VNode; }) {
  const ctx = useContext(SSGContext);
  if (typeof window === "undefined" && ctx) {
    children = Array.isArray(children) ? children : [children];
    for (const node of children) {
      ctx.elements.add(node);
    }
  }

  return <></>;
}
