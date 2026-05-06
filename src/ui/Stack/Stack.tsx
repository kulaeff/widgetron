import type { FC, PropsWithChildren } from "react";
import * as Styled from "./styled";
import type { StackProps } from "./types";

export const Stack: FC<PropsWithChildren<StackProps>> = ({
  align = "stretch",
  children,
  direction = "column",
  gap = 0,
  justify = "stretch",
}) => (
  <Styled.Stack
    $align={align}
    $direction={direction}
    $gap={gap}
    $justify={justify}
  >
    {children}
  </Styled.Stack>
);
