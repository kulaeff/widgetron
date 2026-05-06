import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  [key: string]: unknown;
};

export function Rating(props: Props) {
  return <input type="range" min={1} max={5} {...props} />;
}
