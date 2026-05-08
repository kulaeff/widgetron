import type { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode;
  $color?: string;
  $size?: string;
  color?:
    | "blue"
    | "cyan"
    | "green"
    | "grey"
    | "lime"
    | "magenta"
    | "orange"
    | "purple"
    | "red"
    | "teal"
    | "white"
    | "yellow";
  label?: string;
  size?: "s" | "m";
  [key: string]: unknown;
};

export function Tag({
  children,
  $color,
  $size,
  color,
  label,
  size,
  ...props
}: Props) {
  return (
    <span
      {...props}
      data-color={color ?? $color ?? "yellow"}
      data-size={size ?? $size ?? "m"}
    >
      {children ?? label}
    </span>
  );
}
