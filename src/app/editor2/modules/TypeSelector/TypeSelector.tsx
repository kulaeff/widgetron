import type { FC } from "react";
import { Toggle } from "../../components/Toggle";

export const TypeSelectorValue = {
  WIDGET: "widget",
  PAGE: "page",
} as const;

export const PAGE_SIZE = {
  minWidth: 512,
  minHeight: 512,
  maxWidth: 1024,
} as const;

export type TypeSelectorValue =
  (typeof TypeSelectorValue)[keyof typeof TypeSelectorValue];

const OPTIONS = [
  { id: TypeSelectorValue.WIDGET, label: "Виджет" },
  { id: TypeSelectorValue.PAGE, label: "Страница" },
];

export interface TypeSelectorProps {
  value: TypeSelectorValue;
  onChange: (value: TypeSelectorValue) => void;
}

export const TypeSelector: FC<TypeSelectorProps> = ({ value, onChange }) => {
  return (
    <Toggle
      options={OPTIONS}
      value={value}
      onChange={(id) => onChange(id as TypeSelectorValue)}
    />
  );
};
