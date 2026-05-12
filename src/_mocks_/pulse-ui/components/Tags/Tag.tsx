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
  label,
  size,
  ...props
}: Props) {
  return (
    <span
      {...props}
      style={{
        backgroundColor: $color,
        borderRadius: "4px",
        fontSize: "12px",
        padding: "2px 4px",
      }}
    >
      {children ?? label}
    </span>
  );
}
