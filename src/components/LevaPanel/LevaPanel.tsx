/* eslint-disable no-nested-ternary */
import { Dropdown } from "@pulse/ui/components/Dropdown";
import { IconButton } from "@pulse/ui/components/Button";
import { ChipsInput } from "@pulse/ui/components/Input/variants/ChipsInput";
import { Select, Option } from "@pulse/ui/components/Select";
import { Switch } from "@pulse/ui/components/Switch";
import { Tab, Tabs } from "@pulse/ui/components/Tabs";
import { Fragment, useState, type FC } from "react";
import * as Styled from "./styled";
import { useTranslation } from "react-i18next";
import type { DynamicString } from "@json-render/core";
import { Tag } from "@pulse/ui/components/Tags/Tag";
import { Chips } from "@pulse/ui/components/Tags/Chips";
import { Input } from "@pulse/ui/components/Input";

type BaseControl = {
  id: string;
  label: string;
};

type NumberControl = BaseControl & {
  type: "number";
  value: number;
  min?: number;
  max?: number;
  step?: number;
};

type TextControl = BaseControl & {
  type: "string";
  value: DynamicString;
  placeholder?: string;
};

type BooleanControl = BaseControl & {
  type: "boolean";
  value: boolean;
};

type SelectControl = BaseControl & {
  type: "select";
  value: string;
  options: string[];
};

type ColorControl = BaseControl & {
  type: "color";
  value: string;
};

export type LevaControl =
  | BooleanControl
  | ColorControl
  | NumberControl
  | SelectControl
  | TextControl;

interface LevaPanelProps {
  controls: LevaControl[];
  // Name of the element being inspected
  name?: string;
  // Type of the element being inspected
  type?: string;
  onControlChange: (id: string, value: string | number | boolean) => void;
}

const baseInputClassName =
  "h-6 rounded border border-black/15 bg-white/90 px-2 text-xs text-black outline-none transition focus:border-accent-500/70 dark:border-white/15 dark:bg-black/35 dark:text-white";

const Control: FC<{
  control: LevaControl;
  onChange: (id: string, value: string | number | boolean) => void;
}> = ({ control, onChange }) => {
  if (control.type === "number") {
    return (
      <Input
        id={control.id}
        className={`${baseInputClassName} w-24 text-right tabular-nums`}
        min={control.min}
        max={control.max}
        step={control.step ?? 1}
        type="number"
        value={control.value}
        onChange={(event) => {
          onChange(control.id, event.target.valueAsNumber);
        }}
      />
    );
  }

  if (control.type === "boolean") {
    return (
      <Switch
        id={control.id}
        checked={control.value}
        onChange={(e) => onChange(control.id, e.target.checked)}
      />
    );
  }

  if (control.type === "select") {
    return (
      <Select
        id={control.id}
        value={control.value}
        onChange={(value) => onChange(control.id, value)}
      >
        {control.options.map((option) => (
          <Option
            key={option}
            selected={option === control.value}
            value={option}
          >
            {option}
          </Option>
        ))}
      </Select>
    );
  }

  if (control.type === "color") {
    return (
      <div className="flex items-center gap-2">
        <input
          id={control.id}
          className="h-6 w-6 rounded border border-black/15 bg-transparent p-0 dark:border-white/15"
          type="color"
          value={control.value}
          onChange={(event) => onChange(control.id, event.target.value)}
        />
        <input
          className={`${baseInputClassName} w-24`}
          type="text"
          value={control.value}
          onChange={(event) => onChange(control.id, event.target.value)}
        />
      </div>
    );
  }

  return (
    <ChipsInput
      $chips={
        typeof control.value === "object"
          ? [<Chips key="0">{control.value.$state}</Chips>]
          : []
      }
      inputProps={{
        id: control.id,
        readOnly: typeof control.value === "object",
        value: typeof control.value === "object" ? "" : control.value,
        placeholder: control.placeholder,
        onChange: (event) => onChange(control.id, event.target.value),
      }}
    />
  );
};

const ApplyExpressionButton = () => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Dropdown
      align="end"
      isOpen={isOpen}
      trigger={
        <IconButton size="m-alt" $type="mono" onClick={() => setIsOpen(true)}>
          #
        </IconButton>
      }
      withPadding
      onChange={(value) => setIsOpen(value)}
    >
      <Tabs
        $type="secondary"
        selectedIndex={activeTab}
        onTabChange={(_, id) => setActiveTab(id)}
      >
        <Tab>{t("значение")}</Tab>
        <Tab>{t("условие")}</Tab>
        <Tab>{t("шаблон")}</Tab>
        <Tab>{t("функция")}</Tab>
      </Tabs>
      <Styled.Panel>
        {activeTab === 0 ? (
          <div>{t("значение")}</div>
        ) : activeTab === 1 ? (
          <div>{t("условие")}</div>
        ) : activeTab === 2 ? (
          <div>{t("шаблон")}</div>
        ) : (
          <div>{t("функция")}</div>
        )}
      </Styled.Panel>
    </Dropdown>
  );
};

export const LevaPanel: FC<LevaPanelProps> = ({
  controls,
  name,
  type,
  onControlChange,
}) => {
  return (
    <Styled.Container>
      <Styled.Header>
        <Tag>{type}</Tag>
        {name ? <Styled.Name>{name}</Styled.Name> : null}
      </Styled.Header>
      <Styled.Sections>
        {controls.map((control) => (
          <Fragment key={control.id}>
            <label htmlFor={control.id}>{control.label}</label>
            <Control control={control} onChange={onControlChange} />
            <ApplyExpressionButton />
          </Fragment>
        ))}
      </Styled.Sections>
    </Styled.Container>
  );
};
