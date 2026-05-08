import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  size?: "m" | "l";
  style?: "red" | "blue";
  [key: string]: unknown;
};

export function Badge({ children, size = "m", style = "red", ...props }: Props) {
  return (
    <span {...props} data-size={size} data-style={style}>
      {children ?? "Badge"}
    </span>
  );
}
