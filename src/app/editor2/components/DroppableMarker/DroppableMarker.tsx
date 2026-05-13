import { CollisionPriority } from "@dnd-kit/abstract";
import { useDroppable } from "@dnd-kit/react";
import type { FC, PropsWithChildren } from "react";

type DroppableMarkerProps = PropsWithChildren<{
  id?: string | null;
  priority?: CollisionPriority;
}>;

export const DroppableMarker: FC<DroppableMarkerProps> = ({
  children,
  id,
  priority = CollisionPriority.Normal,
}) => {
  const { ref } = useDroppable({
    collisionPriority: priority,
    disabled: !id,
    id: id ?? "droppable-marker-disabled",
    data: {
      kind: "preview-element",
    },
  });

  if (!id) {
    return <>{children}</>;
  }

  return (
    <div data-element-id={id} ref={ref}>
      {children}
    </div>
  );
};
