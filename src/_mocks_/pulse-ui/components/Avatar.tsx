import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  $text?: string;
  [key: string]: unknown;
};

export function Avatar({ $text = "Avatar", ...props }: Props) {
  return <div {...props}>{$text}</div>;
}
