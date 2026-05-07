import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  children?: ReactNode;
  [key: string]: unknown;
};

export function Input(props: Props) {
  return <input {...props} />;
}
