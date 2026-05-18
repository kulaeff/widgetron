import type { FC, PropsWithChildren } from "react";
import * as Styled from "./styled";
import type { CardProps } from "./types";

export const Card: FC<PropsWithChildren<CardProps>> = ({
  border = false,
  children,
  shadow = true,
  variant = "primary",
  ...props
}) => {
  return (
    <Styled.Card {...props}>
      {children}
    </Styled.Card>
  );
}
