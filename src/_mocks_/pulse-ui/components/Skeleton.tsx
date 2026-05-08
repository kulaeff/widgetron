import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  height?: string | number;
  width?: string | number;
};

export function SkeletonRect({ children, height, style, width, ...props }: Props) {
  return (
    <div {...props} style={{ ...style, height, width }}>
      {children}
    </div>
  );
}
