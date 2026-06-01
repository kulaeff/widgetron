import type { Spec } from "@json-render/core";
import { useEffect, useMemo, type FC } from "react";
import * as Styled from "./styled";
import { Renderer, type RendererProps } from "../../components/Renderer";
import { ta } from "zod/locales";
import { JSONUIProvider, Renderer as JSONUIRenderer } from "@json-render/react";
import { standardDirectives } from "@json-render/directives";
import { Fallback, registry } from "../../lib/registry";

export interface PreviewProps extends Record<string, unknown> {
  loading: boolean;
  spec: Spec | null;
  selected?: boolean;
  selectedElementId?: string;
  viewportSize?: {
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
  };
}

export const Preview: FC<PreviewProps> = ({
  spec,
  loading,
  selected = false,
  selectedElementId,
  viewportSize,
}) => {
  console.log(selected);
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

    if (!selectedElementId) {
      return;
    }

    const targetElement = resolveHighlightElement(selectedElementId);

    if (targetElement instanceof HTMLElement) {
      // targetElement.style.isolation = "isolate";
      targetElement.style.outline = "2px solid rgba(35, 111, 255, 0.9)";
      // targetElement.style.outlineOffset = "-2px";
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
      {markedSpec ? (
        <JSONUIProvider
          directives={standardDirectives}
          initialState={spec?.state}
          registry={registry}
        >
          <JSONUIRenderer
            fallback={({ element }) => <Fallback type={element.type} />}
            loading={loading}
            registry={registry}
            spec={markedSpec}
          />
        </JSONUIProvider>
      ) : null}
    </Styled.Container>
  );
};
