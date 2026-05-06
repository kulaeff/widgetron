import type { DragEvent, FC } from "react";
import type { CatalogComponentInfo } from "../../utils/catalog-data";
import { encodeCatalogDragPayload } from "../../utils/catalog-dnd";
import * as Styled from "./styled";

type ToolbarProps = {
  items: Record<string, CatalogComponentInfo[]>;
};

export const ToolBar: FC<ToolbarProps> = ({ items }) => {
  const handleDragStart = (
    event: DragEvent<HTMLLIElement>,
    componentName: string,
    group: string
  ) => {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData(
      "application/x-catalog-component",
      JSON.stringify({ componentName, group })
    );
    // event.dataTransfer.setData("text/plain", componentName);
  };

  console.log("TOOLBAR", items);

  return (
    <Styled.Container>
      {Object.entries(items).map(([group, components]) => (
        <Styled.Group key={group}>
          <Styled.Header>{group}</Styled.Header>
          <Styled.Tools>
            {components.map((component) => (
              <Styled.Tool
                key={`${group}:${component.name}`}
                draggable
                onDragStart={(event) =>
                  handleDragStart(event, component.name, group)
                }
              >
                <Styled.Icon aria-hidden>
                  {component.icon ?? component.name.slice(0, 1)}
                </Styled.Icon>
                <Styled.Label>{component.name}</Styled.Label>
              </Styled.Tool>
            ))}
          </Styled.Tools>
        </Styled.Group>
      ))}
    </Styled.Container>
  );
};
