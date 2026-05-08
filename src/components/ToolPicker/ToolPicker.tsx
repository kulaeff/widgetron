import { useMemo, useState, type FC } from "react";
import * as Styled from "./styled";

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
  return (
    <Styled.Container>
      {tools.map((tool) => (
        <Styled.Button
          key={tool.id}
          type="button"
          $active={tool.id === value}
          onClick={() => {
            onSelect(tool.id);
          }}
        >
          {tool.title}
        </Styled.Button>
      ))}
    </Styled.Container>
  );
};
