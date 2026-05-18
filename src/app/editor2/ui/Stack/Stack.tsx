import type { FC, PropsWithChildren } from "react";
import * as Styled from "./styled";
import type { StackProps } from "./types";

export const Stack: FC<PropsWithChildren<StackProps>> = ({
  align = "stretch",
  children,
  direction = "column",
  gap = 0,
  justify = "stretch",
  ...rest
}) => (
  <Styled.Stack
    $align={align}
    $direction={direction}
    $gap={gap}
    $justify={justify}
    {...rest}
  >
    {children}
  </Styled.Stack>
);
