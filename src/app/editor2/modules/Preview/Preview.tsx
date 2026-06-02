import type { Spec } from "@json-render/core";
import { standardDirectives } from "@json-render/directives";
import { JSONUIProvider, Renderer as JSONUIRenderer } from "@json-render/react";
import { useReactFlow, useViewport, ViewportPortal } from "@xyflow/react";
import { useEffect, useMemo, useRef, useState, type FC } from "react";
import { registry, Fallback } from "../../lib/registry";
import * as Styled from "./styled";

export interface PreviewProps extends Record<string, unknown> {
  loading: boolean;
  selected?: boolean;
  selectedElementID?: string;
  spec: Spec | null;
  viewportSize?: {
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
  };
}

const HIGHLIGHT_OFFSET = 4;

export const Preview: FC<PreviewProps> = ({
  loading,
  selected = false,
  selectedElementID,
  spec,
  viewportSize,
}) => {
  const { x, y } = useViewport();
  const { screenToFlowPosition } = useReactFlow();

  const [highlightRect, setHighlightRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const normalizedSpec = useMemo(() => {
    if (spec === null || spec.root.length === 0) {
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
    const containerElement = containerRef.current;

    if (containerElement === null || selectedElementID === undefined) {
      setHighlightRect(null);
      return;
    }

    const updateHighlightRect = () => {
      const targetElement = containerElement.querySelector(
        `[data-element-id="${selectedElementID}"]`
      );

      if (targetElement === null) {
        setHighlightRect(null);
        return;
      }

      const rect = targetElement.getBoundingClientRect();

      const start = screenToFlowPosition({
        x: rect.left,
        y: rect.top,
      });

      const end = screenToFlowPosition({
        x: rect.right,
        y: rect.bottom,
      });

      setHighlightRect({
        top: start.y - HIGHLIGHT_OFFSET,
        left: start.x - HIGHLIGHT_OFFSET,
        width: end.x - start.x + HIGHLIGHT_OFFSET * 2,
        height: end.y - start.y + HIGHLIGHT_OFFSET * 2,
      });
    };

    updateHighlightRect();

    const ro = new ResizeObserver(() => {
      updateHighlightRect();
    });

    ro.observe(containerElement);

    return () => {
      ro.disconnect();
    };
  }, [
    normalizedSpec,
    selectedElementID,
    x,
    y,
    screenToFlowPosition,
  ]);

  return (
    <Styled.Tile
      $selected={selected}
      ref={containerRef}
      style={{
        ...viewportSize,
      }}
    >
      {/* eslint-disable-next-line no-nested-ternary */}
      {normalizedSpec ? (
        <JSONUIProvider
          directives={standardDirectives}
          initialState={spec?.state}
          registry={registry}
        >
          <JSONUIRenderer
            fallback={({ element }) => <Fallback type={element.type} />}
            loading={loading}
            registry={registry}
            spec={normalizedSpec}
          />
        </JSONUIProvider>
      ) : null}
      {normalizedSpec ? (
        <ViewportPortal>
          {highlightRect ? (
            <Styled.Highlight
              style={{
                top: highlightRect.top,
                left: highlightRect.left,
                width: highlightRect.width,
                height: highlightRect.height,
              }}
            />
          ) : null}
        </ViewportPortal>
      ) : null}
    </Styled.Tile>
  );
};
