import type { FC, PropsWithChildren } from "react";
import * as Styled from "./styled";
import type { ViewProps } from "./types";

export const View: FC<PropsWithChildren<ViewProps>> = ({ children, ...rest }) => (
  <Styled.View {...rest}>{children}</Styled.View>
);
