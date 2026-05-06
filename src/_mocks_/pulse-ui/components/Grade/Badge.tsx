import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  [key: string]: unknown;
};

export function Badge({ children, ...props }: Props) {
  return <span {...props}>{children ?? "Badge"}</span>;
}
