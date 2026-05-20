import { useState, type FC } from "react";
import { Renderer, type RendererProps } from "../../components/Renderer";
import * as Styled from "./styled";

export interface RuntimeProps extends Omit<RendererProps, "state" | "setState"> {
  size?: {
    width: number;
    height: number;
  };
}

export const Runtime: FC<RuntimeProps> = ({
  spec,
  loading = false,
  size,
}) => {
  const [state, setState] = useState({});

  return (
    <Styled.Runtime>
      <Styled.Tile style={{ ...size }}>
        {spec ? (
          <Renderer
            loading={loading}
            spec={spec}
            state={{ ...spec?.state, ...state }}
            setState={setState}
          />
        ) : null}
      </Styled.Tile>
    </Styled.Runtime>
  );
};
