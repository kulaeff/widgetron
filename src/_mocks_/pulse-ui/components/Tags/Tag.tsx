import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  [key: string]: unknown;
};

export function Tag({ children, ...props }: Props) {
  return <span {...props}>{children}</span>;
}
