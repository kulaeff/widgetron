import type { ReactNode } from "react";

type Props = {
  border?: boolean;
  children?: ReactNode;
  shadow?: boolean;
  type?: "default" | "contrast";
  variant?: "primary" | "secondary";
  [key: string]: unknown;
};

export function Card({
  border = false,
  children,
  shadow = true,
  type = "default",
  variant = "primary",
  ...props
}: Props) {
  return (
    <div {...props} data-border={border} data-shadow={shadow} data-type={type} data-variant={variant}>
      {children}
    </div>
  );
}
