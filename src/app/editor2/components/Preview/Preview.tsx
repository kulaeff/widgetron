import type { Spec } from "@json-render/core";
import { useEffect, useMemo, type FC } from "react";
import * as Styled from "./styled";
import { Renderer, type RendererProps } from "../../components/Renderer";

export interface PreviewProps extends Omit<RendererProps, "spec">, Record<string, unknown> {
  spec: Spec | null;
  selected?: boolean;
  selectedElementId?: string;
  viewportSize?: {
    width: number;
    height: number;
  };
  emptyLabel?: string | null;
}

export const Preview: FC<PreviewProps> = ({
  spec,
  state,
  loading = false,
  setState,
  selected = false,
  selectedElementId,
  onStateChange,
  viewportSize,
  emptyLabel = "Сгенерируйте интерфейс в AI mode или перетащите компонент в Design mode",
}) => {
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
        element.style.boxShadow = "";
        element.removeAttribute("data-preview-highlight");
      }
    });

    if (!selectedElementId) {
      return;
    }

    const targetElement = resolveHighlightElement(selectedElementId);

    if (targetElement instanceof HTMLElement) {
      targetElement.style.boxShadow = "inset 0 0 0 2px rgba(35, 111, 255, 0.9)";
      targetElement.setAttribute("data-preview-highlight", "selected");
    }
  }, [selectedElementId]);

  return (
    <Styled.Container
      $selected={selected}
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
      ) : emptyLabel ? (
        <Styled.Label>{emptyLabel}</Styled.Label>
      ) : (
        null
      )}
    </Styled.Container>
  );
};
