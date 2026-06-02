import { useDraggable } from "@dnd-kit/react";
import type { FC } from "react";
import type { CatalogComponentInfo } from "../../utils/catalog-data";
import * as Styled from "./styled";
import { DraggingCatalogComponentPayload } from "../../types";

type ToolbarProps = {
  items: Record<string, CatalogComponentInfo[]>;
};

export const Tool: FC<Pick<DraggingCatalogComponentPayload, "name">> = ({
  name,
}) => {
  const { ref } = useDraggable({
    id: `toolbar:${name}`,
    data: {
      kind: "catalog.component",
      name,
    },
  });

  return (
    <Styled.Tool ref={ref}>
      <Styled.Icon aria-hidden>{name.slice(0, 1)}</Styled.Icon>
      <Styled.Label>{name}</Styled.Label>
    </Styled.Tool>
  );
};

export const ToolBar: FC<ToolbarProps> = ({ items }) => {
  return (
    <Styled.Container>
      {Object.entries(items).map(([group, components]) => (
        <Styled.Group key={group}>
          <Styled.Header>{group}</Styled.Header>
          <Styled.Tools>
            {components.map((component) => (
              <Tool
                key={`${group}:${component.name}`}
                name={component.name}
                icon={component.icon}
              />
            ))}
          </Styled.Tools>
        </Styled.Group>
      ))}
    </Styled.Container>
  );
};
