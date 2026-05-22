import type { FC } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  return (
    <Toggle
      options={[
        { id: "auto", label: t('Авто-высота') },
      ]}
      value={enabled ? 'auto' : ""}
      onChange={() => onChange(!enabled)}
    />
  );
};
