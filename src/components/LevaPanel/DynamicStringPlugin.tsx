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

const { Row, Label, Number, } = Components

const DynamicStringComponent: FC = () => {
  const { label, value, displayValue, onUpdate, settings } = useInputContext<DynamicStringPluginProps>();

  return (
    <Row input>
      <Label>{label}</Label>
      <Number value={displayValue} onUpdate={(v) => onUpdate(v + settings.multiplier)} />
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
  format: (value, settings) => (value * settings.multiplier).toFixed(2),
}

