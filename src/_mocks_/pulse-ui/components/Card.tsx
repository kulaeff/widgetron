import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  [key: string]: unknown;
};

export function Card({ children, ...props }: Props) {
  return <div {...props}>{children}</div>;
}
