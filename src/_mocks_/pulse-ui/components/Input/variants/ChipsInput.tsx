import type { InputHTMLAttributes, ReactNode } from "react";

type Props = {
  $chips?: ReactNode[];
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
};

export function ChipsInput({ $chips = [], inputProps }: Props) {
  return (
    <div>
      <div>{$chips.map((chip, index) => <span key={index}>{chip}</span>)}</div>
      <input {...inputProps} />
    </div>
  );
}
