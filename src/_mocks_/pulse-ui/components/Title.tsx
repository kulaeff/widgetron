import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  [key: string]: unknown;
};

export function Title({ children, ...props }: Props) {
  return <h3 {...props}>{children}</h3>;
}
