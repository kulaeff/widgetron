import type { FC } from "react";
import * as Styled from "./styled";
import type { TextProps } from "./types";

export const Text: FC<TextProps> = ({ text, variant = "body1Regular", ...rest }) => {
  if (typeof text === "object") {
    return JSON.stringify(text);
  }

  return <Styled.Text $variant={variant} {...rest}>{text}</Styled.Text>;
};
