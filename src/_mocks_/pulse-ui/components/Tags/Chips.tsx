import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  label?: string;
  size?: "s" | "m";
  type?: "default" | "alert" | "warnings";
  [key: string]: unknown;
};

export function Chips({
  children,
  label,
  size = "s",
  type = "default",
  ...props
}: Props) {
  return (
    <span {...props} data-size={size} data-type={type}>
      {children ?? label}
    </span>
  );
}
