import styled, { css } from "styled-components";
import type { ButtonProps } from "./types";
import { Wrap } from "../../ui/types";

export const Button = styled.button<
  Wrap<Pick<ButtonProps, "active" | "size" | "variant">>
>(({ theme, $active, $size, $variant }) => css`
  ${$size === "sm" ? theme.typography.body2Regular : theme.typography.body1Regular};
  appearance: none;
  border: ${$variant === "primary" ? "none" : `1px solid ${theme.tokens.current.core.border.strong}`};
  border-radius: 6px;
  cursor: pointer;
  padding: ${$size === "sm" ? "4px 8px" : "9px 12px"};
  transition: background-color 60ms, color 60ms;
  ${$variant === "primary" ? css`
    background: ${theme.tokens.current.core.accent.primary};
    color: ${theme.tokens.current.core.text.onColor};
  ` : css`
    background: ${$active ? theme.tokens.current.interactive.hover.tertiary : theme.tokens.current.core.background.default};
    color: ${theme.tokens.current.core.text.primary};
    &:hover {
      background: ${theme.tokens.current.interactive.hover.tertiary};
    }
  `}
`);
