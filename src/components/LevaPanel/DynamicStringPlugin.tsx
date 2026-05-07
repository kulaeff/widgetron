import { type LevaInputProps, type Plugin, useInputContext, Components } from "leva/plugin";
import type { FC } from "react";

interface DynamicStringPluginInput {
  value: string;
  multiplier?: number;
}

interface DynamicStringPluginSettings {
  multiplier: number;
}

interface DynamicStringPluginProps extends LevaInputProps<string, DynamicStringPluginSettings> {}

const { Row, Label, Number: NumberInput } = Components;

const DynamicStringComponent: FC = () => {
  const { label, value, displayValue, onUpdate, settings } = useInputContext<DynamicStringPluginProps>();

  return (
    <Row input>
      <Label>{label}</Label>
      <NumberInput
        value={displayValue}
        onUpdate={(v: number) => onUpdate(String(v + settings.multiplier))}
      />
      <span>× {settings.multiplier}</span>
    </Row>
  );
};

const dynamicStringPlugin: Plugin<DynamicStringPluginInput, string, DynamicStringPluginSettings> = {
  component: DynamicStringComponent,
  normalize: ({ value, multiplier }) => ({
    value: value ?? "",
    settings: { multiplier: multiplier ?? 1 },
  }),
  sanitize: (value) => String(value),
  format: (value, settings) =>
    (globalThis.Number(value) * settings.multiplier).toFixed(2),
};
