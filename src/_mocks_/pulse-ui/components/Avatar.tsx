import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  hasBadge?: boolean;
  label?: string;
  size?: "s" | "m" | "l" | "xs" | "xl" | "xxl";
  text?: string;
  url?: string;
  [key: string]: unknown;
};

export function Avatar({
  hasBadge = false,
  label,
  size = "l",
  text = "Avatar",
  url,
  ...props
}: Props) {
  return (
    <div {...props} data-has-badge={hasBadge} data-size={size}>
      {url ? <img src={url} alt={label ?? text} /> : text}
      {label ? <small>{label}</small> : null}
    </div>
  );
}
