import type { FC } from "react";
import { Toggle } from "../../components/Toggle";

const AUTO_OPTION = { id: "auto", label: "Auto" };

export interface AutoHeightButtonProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export const AutoHeightButton: FC<AutoHeightButtonProps> = ({
  enabled,
  onChange,
}) => {
  return (
    <Toggle
      options={[AUTO_OPTION]}
      value={enabled ? AUTO_OPTION.id : ""}
      onChange={() => onChange(!enabled)}
    />
  );
};
