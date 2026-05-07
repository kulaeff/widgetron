import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  [key: string]: unknown;
};

export function Line(props: Props) {
  return <textarea rows={3} style={{ border: "none", outline: "none", resize: "none" }} {...props} />;
}
