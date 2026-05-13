import { useDraggable } from "@dnd-kit/react";
import type { FC } from "react";
import type { CatalogComponentInfo } from "../../utils/catalog-data";
import * as Styled from "./styled";

type ToolbarProps = {
  items: Record<string, CatalogComponentInfo[]>;
};

export const ToolBar: FC<ToolbarProps> = ({ items }) => {
  const Tool = ({
    componentName,
    group,
    icon,
  }: {
    componentName: string;
    group: string;
    icon?: string;
  }) => {
    const { ref, isDragging } = useDraggable({
      id: `toolbar:${group}:${componentName}`,
      data: {
        kind: "catalog-component",
        componentName,
        group,
      },
    });

    return (
      <Styled.Tool ref={ref} $isDragging={isDragging}>
        <Styled.Icon aria-hidden>{icon ?? componentName.slice(0, 1)}</Styled.Icon>
        <Styled.Label>{componentName}</Styled.Label>
      </Styled.Tool>
    );
  };

  return (
    <Styled.Container>
      {Object.entries(items).map(([group, components]) => (
        <Styled.Group key={group}>
          <Styled.Header>{group}</Styled.Header>
          <Styled.Tools>
            {components.map((component) => (
              <Tool
                key={`${group}:${component.name}`}
                componentName={component.name}
                group={group}
                icon={component.icon}
              />
            ))}
          </Styled.Tools>
        </Styled.Group>
      ))}
    </Styled.Container>
  );
};
