import { useState, type FC } from "react";
import { Renderer, type RendererProps } from "../../components/Renderer";
import * as Styled from "./styled";

export interface RuntimeProps extends Omit<RendererProps, "state" | "setState"> {
  autoHeight?: boolean;
  size?: {
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
  };
}

export const Runtime: FC<RuntimeProps> = ({
  spec,
  loading = false,
  size,
  autoHeight = false,
}) => {
  const [state, setState] = useState({});

  return (
    <Styled.Runtime>
      <Styled.Tile $autoHeight={autoHeight} style={{ ...size }}>
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
