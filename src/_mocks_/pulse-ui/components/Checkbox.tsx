import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  [key: string]: unknown;
};

export function Checkbox({ label, ...props }: Props) {
  return (
    <label>
      <input type="checkbox" {...props} />
      {label}
    </label>
  );
}
