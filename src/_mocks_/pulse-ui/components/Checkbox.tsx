import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  [key: string]: unknown;
};

export function Checkbox(props: Props) {
  return <input type="checkbox" {...props} />;
}
