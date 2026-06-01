import type { FC } from "react";
import { TILE_SIZE } from "../../constants";
import { Toggle } from "../../components/Toggle";

export interface SizeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const SizeSelector: FC<SizeSelectorProps> = ({ value, onChange }) => {
  return (
    <Toggle
      options={TILE_SIZE.map((viewport) => ({
        id: viewport.id,
        label: viewport.label,
      }))}
      value={value}
      onChange={(id) => onChange(id)}
    />
  );
};
