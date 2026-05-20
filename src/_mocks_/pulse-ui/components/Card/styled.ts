import styled, { css } from "styled-components";
import type { Wrap } from "../../../../app/editor2/ui/types";
import type { CardProps } from "./types";

export const Card = styled.div<
  Wrap<Pick<CardProps, "border" | "shadow" | "variant">>
>(({ $border, $shadow, $variant, theme }) => css`
  background-color: ${$variant === "primary" ? theme.tokens.current.core.background.default : theme.tokens.current.core.background.default};
  border: ${$border ? `1px solid ${theme.tokens.current.core.border.strong}` : "none"};
  border-radius: 8px;
  box-shadow: ${$shadow ? "0 0 8px 0 rgba(0, 0, 0, 0.1)" : "none"};
  height: 100%;
  padding: 16px;
  width: 100%;
`);
