import { useState, type FC } from "react";
import { Renderer, type RendererProps } from "../../components/Renderer";
import * as Styled from "./styled";

export interface RuntimeProps extends Omit<RendererProps, "state" | "setState"> {
  viewportSize?: {
    width: number;
    height: number;
  };
}

export const Runtime: FC<RuntimeProps> = ({
  spec,
  loading = false,
  viewportSize,
}) => {
  const [state, setState] = useState({});

  return (
    <Styled.Runtime>
      <Styled.Tile style={{ ...viewportSize }}>
        {spec ? (
          <Renderer
            loading={loading}
            spec={spec}
            state={state}
            setState={setState}
            // onStateChange={onStateChange}
          />
        ) : null}
      </Styled.Tile>
    </Styled.Runtime>
  );
};
