import type { FC, PropsWithChildren } from "react";
import * as Styled from "./styled";
import type { GridProps } from "./types";

export const Grid: FC<PropsWithChildren<GridProps>> = ({
  children,
  columns,
  gap = 0,
  align = "stretch",
  justify = "stretch",
}) => (
  <Styled.Stack $align={align} $columns={columns} $gap={gap} $justify={justify}>
    {children}
  </Styled.Stack>
);
