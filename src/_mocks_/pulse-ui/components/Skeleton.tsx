import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement>;

export function SkeletonRect({ children, ...props }: Props) {
  return <div {...props}>{children}</div>;
}
