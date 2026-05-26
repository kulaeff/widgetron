import type { FC } from "react";
import { Toggle } from "../../components/Toggle";
import { TILE_SIZE } from "../../constants";
import type { Viewport } from "../../types";

export interface SizeSelectorProps {
  value: Viewport["id"];
  onChange: (value: Viewport["id"]) => void;
}

export const SizeSelector: FC<SizeSelectorProps> = ({ value, onChange }) => {
  const options = TILE_SIZE.map((viewport) => ({
    id: viewport.id,
    label: viewport.label,
  }));

  return (
    <Toggle
      options={options}
      value={value}
      onChange={(id) => onChange(id)}
    />
  );
};
