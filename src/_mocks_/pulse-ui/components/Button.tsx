import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  isLoading?: boolean;
  label?: string;
  size?: "s" | "m" | "l";
  type?: "primary" | "secondary" | "tertiary";
  [key: string]: unknown;
};

export function Button({
  children,
  fullWidth = false,
  isLoading = false,
  label,
  size = "m",
  type = "primary",
  style,
  ...props
}: Props) {
  return (
    <button
      {...props}
      data-size={size}
      data-ui-type={type}
      style={{ ...style, width: fullWidth ? "100%" : style?.width }}
    >
      {isLoading ? "Loading..." : children ?? label}
    </button>
  );
}

export function IconButton({ children, ...props }: Props) {
  return <button {...props}>{children}</button>;
}
