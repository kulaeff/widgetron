import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  [key: string]: unknown;
};

export function TextArea(props: Props) {
  return <textarea {...props} />;
}
