import { useMemo, useState, type FC } from "react";
import * as Styled from "./styled";

export type ToolPickerItem = {
  id: string;
  title: string;
};

type ToolPickerProps = {
  tools: ToolPickerItem[];
  defaultSelectedId?: string;
  onSelect: (toolId: string) => void;
};

export const ToolPicker: FC<ToolPickerProps> = ({
  tools,
  defaultSelectedId,
  onSelect,
}) => {
  const initialSelectedId = useMemo(() => {
    if (defaultSelectedId) return defaultSelectedId;

    return tools[0]?.id ?? "";
  }, [defaultSelectedId, tools]);

  const [selectedId, setSelectedId] = useState(initialSelectedId);

  return (
    <Styled.Container>
      {tools.map((tool) => (
        <Styled.Button
          key={tool.id}
          type="button"
          $active={tool.id === selectedId}
          onClick={() => {
            setSelectedId(tool.id);
            onSelect(tool.id);
          }}
        >
          {tool.title}
        </Styled.Button>
      ))}
    </Styled.Container>
  );
};
