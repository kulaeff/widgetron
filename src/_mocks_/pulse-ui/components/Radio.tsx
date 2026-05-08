import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  [key: string]: unknown;
};

export function Radio({ label, ...props }: Props) {
  return (
    <label>
      <input type="radio" {...props} />
      {label}
    </label>
  );
}
