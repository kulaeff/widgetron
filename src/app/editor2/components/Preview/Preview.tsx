import type { Spec } from "@json-render/core";
import type { FC } from "react";
import * as Styled from "./styled";
import { Renderer, type RendererProps } from "../../components/Renderer";

export interface PreviewProps extends Omit<RendererProps, "spec">, Record<string, unknown> {
  spec: Spec | null;
  selected?: boolean;
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
  onStateChange,
  viewportSize,
  emptyLabel = "Сгенерируйте интерфейс в AI mode или перетащите компонент в Design mode",
}) => {
  return (
    <Styled.Container
      $selected={selected}
      style={{
        ...viewportSize,
      }}
    >
      {/* eslint-disable-next-line no-nested-ternary */}
      {spec && spec.root.length > 0 ? (
        <Renderer
          loading={loading}
          spec={spec}
          state={{ ...spec.state, ...state }}
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
