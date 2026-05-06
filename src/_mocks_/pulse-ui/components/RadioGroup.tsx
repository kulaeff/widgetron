import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement>;

export function RadioGroup({ children, ...props }: Props) {
  return <div {...props}>{children}</div>;
}
