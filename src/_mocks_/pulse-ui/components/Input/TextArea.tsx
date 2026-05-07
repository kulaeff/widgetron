import type { ReactNode, TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  children?: ReactNode;
  [key: string]: unknown;
};

export function TextArea(props: Props) {
  return <textarea {...props} />;
}
