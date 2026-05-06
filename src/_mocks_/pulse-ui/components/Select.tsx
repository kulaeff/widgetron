import type { ReactElement, ReactNode, SelectHTMLAttributes } from "react";

type OptionProps = {
  children?: ReactNode;
  value: string;
  selected?: boolean;
  [key: string]: unknown;
};

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> & {
  children?: ReactNode;
  onChange?: (value: string) => void;
  [key: string]: unknown;
};

export function Option({ children, value }: OptionProps) {
  return <option value={value}>{children}</option>;
}

export function Select({ children, value, onChange, ...props }: SelectProps) {
  return (
    <select
      {...props}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    >
      {children as ReactElement[]}
    </select>
  );
}
