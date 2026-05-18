import type { ReactNode } from "react";

export type AvatarSize = "s" | "m" | "l" | "xs" | "xl" | "xxl";

export type AvatarProps = {
  children?: ReactNode;
  $hasBadge?: boolean;
  $icon?: string;
  $label?: string;
  $size?: AvatarSize;
  $text?: string;
  [key: string]: unknown;
};
