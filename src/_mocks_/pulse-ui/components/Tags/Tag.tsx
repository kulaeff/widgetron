import type { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode;
  $color?: string;
  $size?: string;
};

export function Tag({ children, $color: _color, $size: _size, ...props }: Props) {
  return <span {...props}>{children}</span>;
}
