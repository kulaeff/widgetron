import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { Toggle } from "../../components/Toggle";

const AUTO_OPTION = { id: "auto", label: "Auto" };

export interface AutoHeightButtonProps {
  disabled?: boolean;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export const AutoHeightButton: FC<AutoHeightButtonProps> = ({
  disabled = false,
  enabled,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <fieldset
      disabled={disabled}
      style={{ border: 0, margin: 0, padding: 0 }}
    >
      <Toggle
        options={[
          { id: "auto", label: t("Авто-высота") },
        ]}
        value={enabled ? "auto" : ""}
        onChange={() => onChange(!enabled)}
      />
    </fieldset>
  );
};
