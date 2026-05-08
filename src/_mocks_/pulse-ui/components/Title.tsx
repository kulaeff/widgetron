import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  size?: "H1" | "H2" | "H3" | "H4" | "subheadline" | "footnote";
  text?: string;
  [key: string]: unknown;
};

export function Title({ children, size = "H4", text, ...props }: Props) {
  return (
    <h3 {...props} data-size={size}>
      {children ?? text}
    </h3>
  );
}
