import type { Spec } from "@json-render/core";
import { useCallback, useMemo, useRef, type DragEvent, type FC } from "react";
import * as Styled from "./styled";
import { Renderer, type RendererProps } from "../../components/Renderer";

interface PreviewProps extends Omit<RendererProps, "spec"> {
  spec: Spec | null;
  selectedElementId?: string | null;
  onDropComponent: (targetElementId: string, componentName: string) => void;
}

export const Preview: FC<PreviewProps> = ({
  spec,
  state,
  loading = false,
  setState,
  onDropComponent,
  onStateChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleDragEnter = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes("application/x-catalog-component"))
      return;

    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";

    const targetElement = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-element-id]"
    );

    if (!targetElement) return;

    targetElement.style.outline = "1px dashed red";
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    const targetElement = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-element-id]"
    );

    if (!targetElement) return;

    targetElement.style.outline = "";
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      const payload = JSON.parse(
        event.dataTransfer.getData("application/x-catalog-component")
      );

      // event.preventDefault();

      const targetElement = (event.target as HTMLElement).closest(
        "[data-element-id]"
      ) as HTMLElement;
      const targetElementId = targetElement.getAttribute(
        "data-element-id"
      ) as string;

      targetElement.style.outline = "";

      if (payload) {
        onDropComponent(targetElementId, payload.componentName);
      }
    },
    [onDropComponent]
  );

  return (
    <Styled.Container
      data-element-id="preview"
      ref={containerRef}
      onDragEnter={handleDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
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
