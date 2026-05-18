import { type FC } from "react";
import { Toggle } from "../Toggle";

export type ToolPickerItem = {
  id: string;
  title: string;
};

type ToolPickerProps = {
  tools: ToolPickerItem[];
  value?: string;
  onSelect: (toolId: string) => void;
};

export const ToolPicker: FC<ToolPickerProps> = ({
  tools,
  value,
  onSelect,
}) => {
  const selectedValue = value ?? tools[0]?.id ?? "";
  const options = tools.map((tool) => ({
    id: tool.id,
    label: tool.title,
  }));

  return (
    <Toggle options={options} value={selectedValue} onChange={onSelect} />
  );
};
