import { Tag } from "@pulse/ui/components/Tags/Tag";
import type { DragEvent, DragEventHandler, FC, ReactNode } from "react";
import { useRef, useState } from "react";
import { ReactComponent as AddIcon } from "$common/icons/add-icon.svg";
import * as Styled from "./styled";

export type TreeItem = {
  children: TreeItem[];
  canDrop?: boolean;
  icon?: ReactNode;
  id: string;
  label: string;
  type: string;
};

export type TreeViewProps = {
  items: TreeItem[];
  value?: string;
  onChange?: (id: string) => void;
  onItemPositionChange?: (
    parentId: string,
    sourceId: string,
    targetId: string
  ) => void;
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
  const [draggingItem, setDraggingItem] = useState<TreeItem | null>(null);

  const parentItemRef = useRef<TreeItem | null>(null);
  const sourceItemRef = useRef<TreeItem | null>(null);

  const canDrop = (source: TreeItem | null, target: TreeItem) =>
    source?.children.findIndex((child) => child.id === target.id) === -1 &&
    target.children.findIndex((child) => child.id === source?.id) === -1 &&
    source.id !== target.id &&
    target.canDrop;

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

  const handleDragEnter = (item: TreeItem) => {
    setDraggingItem(canDrop(sourceItemRef.current, item) ? item : null);
  };

  const handleDragLeave: DragEventHandler<HTMLDivElement> = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDraggingItem(null);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, item: TreeItem) => {
    e.preventDefault();

    if (canDrop(sourceItemRef.current, item)) {
      e.dataTransfer.dropEffect = "move";
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  };

  const handleDragStart = (
    e: DragEvent<HTMLDivElement>,
    parent: TreeItem,
    item: TreeItem
  ) => {
    e.dataTransfer.effectAllowed = "move";

    parentItemRef.current = parent;
    sourceItemRef.current = item;

    setDraggingItem(item);
  };

  const handleDrop = (item: TreeItem) => {
    if (canDrop(sourceItemRef.current, item)) {
      setDraggingItem(null);

      if (parentItemRef.current && sourceItemRef.current) {
        onItemPositionChange?.(
          parentItemRef.current.id,
          sourceItemRef.current.id,
          item.id
        );
      }

      parentItemRef.current = null;
      sourceItemRef.current = null;
    }
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
          $isDraggingOver={
            draggingItem?.id === item.id &&
            draggingItem?.id !== sourceItemRef.current?.id
          }
          $isSelected={isSelected}
          draggable={depth !== 0}
          style={{
            paddingLeft: `${depth * INDENT_PER_LEVEL + BASE_PADDING}px`,
          }}
          tabIndex={isSelected ? 0 : -1}
          onClick={() => handleClick(item)}
          onDragStart={(e) => handleDragStart(e, parent as TreeItem, item)}
          onDragEnter={() => handleDragEnter(item)}
          onDragLeave={handleDragLeave}
          onDragOver={(e) => handleDragOver(e, item)}
          onDrop={() => handleDrop(item)}
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
              {item.type}
              {depth === 0 ? "| root" : ""}
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
