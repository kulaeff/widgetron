import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  [key: string]: unknown;
};

export function Input(props: Props) {
  return <input {...props} />;
}
