import type { FC } from "react";
import { Toggle } from "../../components/Toggle";
import { CONTENT_TYPE } from "../../constants";
import { useTranslation } from "react-i18next";

export interface TypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const TypeSelector: FC<TypeSelectorProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <Toggle
      options={[
        { id: CONTENT_TYPE.TILE, label: t("Виджет") },
        { id: CONTENT_TYPE.PAGE, label: t("Страница") },
      ]}
      value={value}
      onChange={(id) => onChange(id)}
    />
  );
};
