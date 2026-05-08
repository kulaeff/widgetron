import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
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

export function Tag({ children, color = "yellow", label, size = "m", ...props }: Props) {
  return (
    <span {...props} data-color={color} data-size={size}>
      {children ?? label}
    </span>
  );
}
