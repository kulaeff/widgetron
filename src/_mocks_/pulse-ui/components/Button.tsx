import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  $type?: string;
  size?: string;
  [key: string]: unknown;
};

export function Button({ children, ...props }: Props) {
  return <button {...props}>{children}</button>;
}

export function IconButton({ children, ...props }: Props) {
  return <button {...props}>{children}</button>;
}
