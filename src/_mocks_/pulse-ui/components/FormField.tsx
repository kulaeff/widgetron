import type { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export function FormField({ children, ...props }: Props) {
  return <div {...props}>{children}</div>;
}

export function Label({ children, ...props }: Props) {
  return <div {...props}>{children}</div>;
}

export function Control({ children, ...props }: Props) {
  return <div {...props}>{children}</div>;
}
