import { standardDirectives } from "@json-render/directives";
import { JSONUIProvider, Renderer as JSONUIRenderer } from "@json-render/react";
import { useReactFlow, useViewport, ViewportPortal } from "@xyflow/react";
import { useCallback, useEffect, useMemo, useRef, useState, type FC, type MouseEvent } from "react";
import { registry, Fallback } from "../../lib/registry";
import * as Styled from "./styled";
import type { PreviewProps, Rect } from "./types";

const HIGHLIGHT_OFFSET = 4;

const resolveElement = (el: EventTarget) => {
  const target = el as HTMLElement;

  return target.closest<HTMLElement>("[data-element-id]");
};

export const Preview: FC<PreviewProps> = ({
  loading,
  selected = false,
  selectedElementID,
  spec,
  viewportSize,
  onElementSelect,
}) => {
  const { x, y } = useViewport();
  const { screenToFlowPosition } = useReactFlow();

  const [highlightRect, setHighlightRect] = useState<Rect | null>(null);
  const [hoverRect, setHoverRect] = useState<Rect | null>(null);

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

  const buildRect = useCallback((el: HTMLElement, offset: number) => {
    const rect = el.getBoundingClientRect();

    const start = screenToFlowPosition({ x: rect.left, y: rect.top });
    const end = screenToFlowPosition({ x: rect.right, y: rect.bottom });

    return {
      top: start.y - offset,
      left: start.x - offset,
      width: end.x - start.x + offset * 2,
      height: end.y - start.y + offset * 2,
    };
  }, [screenToFlowPosition]);

  //#region Handlers
  const handleClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const closest = resolveElement(e.target);

    if (closest === null) {
      setHighlightRect(null);
      return;
    }

    const id = closest.getAttribute("data-element-id");

    if (id === null) return;

    setHighlightRect(buildRect(closest, HIGHLIGHT_OFFSET));

    onElementSelect?.(id);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverRect(null);
  }, []);

  const handleMouseOver = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const closest = resolveElement(e.target);

    if (closest === null) {
      setHoverRect(null);
      return;
    }

    setHoverRect(buildRect(closest, HIGHLIGHT_OFFSET));
  }, []);
  //#endregion

  //#region Effects
  useEffect(() => {
    const containerElement = containerRef.current;

    if (containerElement === null || selectedElementID === undefined) {
      setHighlightRect(null);
      return;
    }

    const updateHighlightRect = () => {
      const targetElement = containerElement.querySelector<HTMLElement>(
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

      setHighlightRect(buildRect(targetElement, HIGHLIGHT_OFFSET));
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
  //#endregion

  return (
    <Styled.Tile
      $selected={selected}
      ref={containerRef}
      style={{
        ...viewportSize,
      }}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
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
          {hoverRect ? (
            <Styled.Hover
              style={{
                top: hoverRect.top,
                left: hoverRect.left,
                width: hoverRect.width,
                height: hoverRect.height,
              }}
            />
          ) : null}
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
