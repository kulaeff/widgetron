import { useDroppable } from "@dnd-kit/react";
import type { CSSProperties, FC, PropsWithChildren } from "react";
import * as Styled from "./styled";

export interface DroppableProps {
  elementId: string;
  style?: CSSProperties;
}

export const Droppable: FC<PropsWithChildren<DroppableProps>> = ({
  children,
  elementId,
  style,
}) => {
  const { ref, isDropTarget } = useDroppable({
    id: `preview:${elementId}`,
    data: {
      kind: "preview.droppable",
      elementId,
    },
  });

  return (
    <Styled.Droppable
      $active={isDropTarget}
      ref={ref}
      style={style}
    >
      {children}
    </Styled.Droppable>
  );
};
