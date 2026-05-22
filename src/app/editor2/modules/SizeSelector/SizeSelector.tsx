import type { FC } from "react";
import { Toggle } from "../../components/Toggle";

export const SIZE_OPTIONS = [
  { id: "minor", label: "SM", width: 294, height: 280 },
  { id: "important", label: "MD", width: 612, height: 280 },
  { id: "major", label: "LG", width: 612, height: 612 },
] as const;

export type SizeOption = (typeof SIZE_OPTIONS)[number];
export type SizeId = SizeOption["id"];

export const DEFAULT_SIZE_ID: SizeId = SIZE_OPTIONS[0].id;

export const getSizeOption = (id: string): SizeOption =>
  SIZE_OPTIONS.find((option) => option.id === id) ?? SIZE_OPTIONS[0];

export interface SizeSelectorProps {
  value: SizeId;
  onChange: (value: SizeId) => void;
}

export const SizeSelector: FC<SizeSelectorProps> = ({ value, onChange }) => {
  return (
    <Toggle
      options={[...SIZE_OPTIONS]}
      value={value}
      onChange={(id) => onChange(id as SizeId)}
    />
  );
};
