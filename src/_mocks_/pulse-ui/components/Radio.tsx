import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  [key: string]: unknown;
};

export function Radio(props: Props) {
  return <input type="radio" {...props} />;
}
