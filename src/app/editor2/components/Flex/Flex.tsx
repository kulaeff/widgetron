import type { FC, PropsWithChildren } from "react";
import * as Styled from "./styled";
import type { FlexProps } from "./types";

export const Flex: FC<PropsWithChildren<FlexProps>> = ({
  children,
  vertical = false,
}) => <Styled.Flex $vertical={vertical}>{children}</Styled.Flex>;
