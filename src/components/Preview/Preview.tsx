import type { Spec } from "@json-render/core";
import { CollisionPriority } from "@dnd-kit/abstract";
import { useDroppable } from "@dnd-kit/react";
import { useEffect, useMemo, type FC } from "react";
import * as Styled from "./styled";
import { Renderer, type RendererProps } from "../../components/Renderer";

export interface PreviewProps extends Omit<RendererProps, "spec">, Record<string, unknown> {
  spec: Spec | null;
  activeDropTargetId?: string | null;
  selected?: boolean;
  selectedElementId?: string;
  viewportSize?: {
    width: number;
    height: number;
  };
}

export const Preview: FC<PreviewProps> = ({
  spec,
  state,
  selected = false,
  loading = false,
  setState,
  activeDropTargetId,
  selectedElementId,
  onStateChange,
  viewportSize,
}) => {
  const { ref: previewDropRef } = useDroppable({
    collisionPriority: CollisionPriority.Low,
    id: "preview",
    data: {
      kind: "preview",
    },
  });

  const resolveHighlightElement = (targetId: string): HTMLElement | null => {
    const markerElement = document.querySelector(
      `[data-element-id="${targetId}"]`
    );

    if (!(markerElement instanceof HTMLElement)) {
      return null;
    }

    if (window.getComputedStyle(markerElement).display !== "contents") {
      return markerElement;
    }

    const childElement = markerElement.firstElementChild;

    return childElement instanceof HTMLElement ? childElement : null;
  };

  const markedSpec = useMemo(() => {
    if (!spec || spec.root.length === 0) {
      return null;
    }

    const nextElements = Object.fromEntries(
      Object.entries(spec.elements).map(([id, element]) => [
        id,
        {
          ...element,
          props: {
            ...element.props,
            "data-element-id": id,
          },
        },
      ])
    );

    return {
      ...spec,
      elements: nextElements,
    };
  }, [spec]);

  useEffect(() => {
    const highlightedElements = document.querySelectorAll("[data-preview-highlight]");
    highlightedElements.forEach((element) => {
      if (element instanceof HTMLElement) {
        element.style.outline = "";
        element.removeAttribute("data-preview-highlight");
      }
    });

    const highlightId = activeDropTargetId ?? selectedElementId;

    if (!highlightId) return;

    const targetElement = resolveHighlightElement(highlightId);

    if (targetElement instanceof HTMLElement) {
      if (activeDropTargetId) {
        targetElement.style.outline = "1px dashed red";
        targetElement.setAttribute("data-preview-highlight", "drop");
      } else {
        targetElement.style.outline = "2px solid rgba(35, 111, 255, 0.9)";
        targetElement.setAttribute("data-preview-highlight", "selected");
      }
    }
  }, [activeDropTargetId, selectedElementId]);

  return (
    <Styled.Container
      $selected={selected}
      data-element-id="preview"
      ref={previewDropRef}
      style={{
        ...viewportSize,
      }}
    >
      {/* eslint-disable-next-line no-nested-ternary */}
      {markedSpec && markedSpec.root.length > 0 ? (
        <Renderer
          loading={loading}
          spec={markedSpec}
          state={{ ...markedSpec.state, ...state }}
          setState={setState}
          onStateChange={onStateChange}
        />
      ) : null}
    </Styled.Container>
  );
};
