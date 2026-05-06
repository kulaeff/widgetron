import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  [key: string]: unknown;
};

export function Chips({ children, ...props }: Props) {
  return <span {...props}>{children}</span>;
}
