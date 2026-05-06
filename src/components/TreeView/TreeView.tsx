import { Tag } from "@pulse/ui/components/Tags/Tag";
import type { CSSProperties, DragEvent, DragEventHandler, FC, ReactNode } from "react";
import { useRef, useState } from "react";
import { ReactComponent as AddIcon } from "$common/icons/add-icon.svg";
import * as Styled from "./styled";

export type TreeItem = {
  children: TreeItem[];
  canDrop?: boolean;
  detached?: boolean;
  icon?: ReactNode;
  id: string;
  isRoot?: boolean;
  label: string;
  type: string;
};

export type TreeViewProps = {
  items: TreeItem[];
  value?: string;
  onChange?: (id: string) => void;
  onItemPositionChange?: (payload: {
    sourceParentId: string | null;
    sourceId: string;
    targetParentId: string;
    targetId: string;
    placement: "inside" | "before" | "after";
  }) => void;
};

const INDENT_PER_LEVEL = 16;
const BASE_PADDING = 8;

export const TreeView: FC<TreeViewProps> = ({
  items,
  value,
  onItemPositionChange,
  onChange,
}) => {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(
    () => new Set()
  );
  const [dragTarget, setDragTarget] = useState<{
    itemId: string;
    placement: "inside" | "before" | "after";
    lineOffset: number;
  } | null>(null);

  const parentItemRef = useRef<TreeItem | null>(null);
  const sourceItemRef = useRef<TreeItem | null>(null);

  const hasDescendant = (item: TreeItem, id: string): boolean =>
    item.children.some(
      (child) => child.id === id || hasDescendant(child, id)
    );

  const canDropInside = (
    source: TreeItem | null,
    sourceParent: TreeItem | null,
    target: TreeItem
  ) =>
    Boolean(
      source &&
        source.id !== target.id &&
        sourceParent?.id !== target.id &&
        target.canDrop &&
        !hasDescendant(source, target.id)
    );

  const canDropBeforeAfter = (
    source: TreeItem | null,
    target: TreeItem,
    targetParent: TreeItem | null
  ) =>
    Boolean(
      source &&
        source.id !== target.id &&
        targetParent &&
        targetParent.id !== source.id &&
        !hasDescendant(source, targetParent.id)
    );

  const toggleCollapsed = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const handleClick = (item: TreeItem) => {
    onChange?.(item.id);
  };

  const handleIconButtonAddClick = (item: TreeItem) => {
    // not yet implemented
    console.log(item);
  };

  const resolveDropPlacement = (
    e: DragEvent<HTMLDivElement>,
    item: TreeItem
  ): "inside" | "before" | "after" => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - bounds.top;
    const offsetX = e.clientX - bounds.left;
    const threshold = bounds.height / 3;
    const insideThresholdX = 28;

    if (offsetY < threshold) {
      return "before";
    }

    if (offsetY > bounds.height - threshold) {
      return "after";
    }

    if (item.canDrop && offsetX > insideThresholdX) {
      return "inside";
    }

    return "after";
  };

  const handleDragEnter = (
    e: DragEvent<HTMLDivElement>,
    parent: TreeItem | null,
    item: TreeItem,
    depth: number
  ) => {
    const placement = resolveDropPlacement(e, item);

    const canDrop =
      placement === "inside"
        ? canDropInside(sourceItemRef.current, parentItemRef.current, item)
        : canDropBeforeAfter(sourceItemRef.current, item, parent);

    const lineOffset = placement === "inside" ? 0 : depth === 0 ? 0 : depth * INDENT_PER_LEVEL + BASE_PADDING;

    setDragTarget(
      canDrop
        ? {
          itemId: item.id,
          placement,
          lineOffset,
        }
        : null
    );
  };

  const handleDragLeave: DragEventHandler<HTMLDivElement> = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragTarget(null);
    }
  };

  const handleDragOver = (
    e: DragEvent<HTMLDivElement>,
    parent: TreeItem | null,
    item: TreeItem,
    depth: number
  ) => {
    e.preventDefault();

    const placement = resolveDropPlacement(e, item);
    const canDrop =
      placement === "inside"
        ? canDropInside(sourceItemRef.current, parentItemRef.current, item)
        : canDropBeforeAfter(sourceItemRef.current, item, parent);

    if (canDrop) {
      e.dataTransfer.dropEffect = "move";
      const lineOffset =
        placement === "inside"
          ? 0
          : depth === 0
            ? 0
            : depth * INDENT_PER_LEVEL + BASE_PADDING;

      setDragTarget({ itemId: item.id, placement, lineOffset });
    } else {
      e.dataTransfer.dropEffect = "none";
      setDragTarget(null);
    }
  };

  const handleDragStart = (
    e: DragEvent<HTMLDivElement>,
    parent: TreeItem | null,
    item: TreeItem
  ) => {
    e.dataTransfer.effectAllowed = "move";

    parentItemRef.current = parent;
    sourceItemRef.current = item;

    setDragTarget(null);
  };

  const handleDragEnd = () => {
    setDragTarget(null);
    parentItemRef.current = null;
    sourceItemRef.current = null;
  };

  const handleDrop = (parent: TreeItem | null, item: TreeItem) => {
    if (
      !dragTarget ||
      dragTarget.itemId !== item.id ||
      !sourceItemRef.current
    ) {
      return;
    }

    const canDrop =
      dragTarget.placement === "inside"
        ? canDropInside(sourceItemRef.current, parentItemRef.current, item)
        : canDropBeforeAfter(sourceItemRef.current, item, parent);

    if (!canDrop) {
      return;
    }

    onItemPositionChange?.({
      sourceParentId: parentItemRef.current?.id ?? null,
      sourceId: sourceItemRef.current.id,
      targetParentId:
        dragTarget.placement === "inside" ? item.id : (parent as TreeItem).id,
      targetId: item.id,
      placement: dragTarget.placement,
    });

    setDragTarget(null);
    parentItemRef.current = null;
    sourceItemRef.current = null;
  };

  const renderNode = (
    parent: TreeItem | null,
    item: TreeItem,
    depth: number
  ) => {
    const isCollapsed = collapsedIds.has(item.id);
    const isSelected = value === item.id;

    return (
      <Styled.Item key={item.id} $isSelected={isSelected}>
        <Styled.Content
          aria-expanded={!isCollapsed}
          aria-selected={isSelected}
          $dragPlacement={
            dragTarget?.itemId === item.id ? dragTarget.placement : null
          }
          $isDetached={Boolean(item.detached)}
          $isSelected={isSelected}
          draggable={!item.isRoot}
          style={{
            "--drop-line-offset": `${dragTarget?.itemId === item.id ? dragTarget.lineOffset : 0}px`,
            paddingLeft: `${depth * INDENT_PER_LEVEL + BASE_PADDING}px`,
          } as CSSProperties}
          tabIndex={isSelected ? 0 : -1}
          onClick={() => handleClick(item)}
          onDragStart={(e) => handleDragStart(e, parent, item)}
          onDragEnd={handleDragEnd}
          onDragEnter={(e) => handleDragEnter(e, parent, item, depth)}
          onDragLeave={handleDragLeave}
          onDragOver={(e) => handleDragOver(e, parent, item, depth)}
          onDrop={() => handleDrop(parent, item)}
        >
          {item.children.length > 0 ? (
            <Styled.Arrow
              $isCollapsed={isCollapsed}
              aria-label={isCollapsed ? "Expand" : "Collapse"}
              type="button"
              onClick={() => toggleCollapsed(item.id)}
            >
              <svg
                aria-hidden="true"
                fill="none"
                height="16"
                width="16"
                viewBox="0 0 16 16"
              >
                <path
                  d="M6 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </Styled.Arrow>
          ) : (
            <Styled.Spacer />
          )}
          <Styled.Label>
            <Styled.Text>{item.label}</Styled.Text>
            <Tag $color="grey" $size="s">
              {depth === 0 ? "root | " : ""}
              {item.type}
              {item.detached ? " | detached" : ""}
            </Tag>
          </Styled.Label>
        </Styled.Content>
        {item.children.length > 0 && !isCollapsed ? (
          <Styled.Container>
            {item.children.map((child) => renderNode(item, child, depth + 1))}
          </Styled.Container>
        ) : null}
      </Styled.Item>
    );
  };

  return (
    <Styled.Container $isRoot>
      {items.map((item) => renderNode(null, item, 0))}
    </Styled.Container>
  );
};
