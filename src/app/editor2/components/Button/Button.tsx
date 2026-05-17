import type { FC } from "react";
import * as Styled from "./styled";
import type { ButtonProps } from "./types";

export const Button: FC<ButtonProps> = ({
  active = false,
  label,
  size = "md",
  variant = "primary",
  ...rest
}) => {
  return (
    <Styled.Button
      $active={active}
      $size={size}
      $variant={variant}
      {...rest}
    >
      {label}
    </Styled.Button>
  );
}
