import styled, { css } from "styled-components";

export const Toggle = styled("div")`
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  display: inline-flex;
  gap: 4px;
  padding: 4px;
`;

export const Option = styled("button")<{ $isAccent: boolean; $isActive: boolean }>(({ $isAccent, $isActive, theme }) => css`
  ${theme.typography.captionRegular};
  appearance: none;
  border: none;
  border-radius: 5px;
  color: ${$isActive ? theme.tokens.current.core.text.onColor : theme.tokens.current.core.text.primary};
  cursor: pointer;
  padding: 4px 8px;
  transition: background-color 60ms, color 60ms;
  ${$isActive ? $isAccent ? css`
    background: linear-gradient(45deg, crimson, ${theme.tokens.current.colors.blue.solid[60]});
  ` : css`
    background-color: ${theme.tokens.current.colors.blue.solid[60]};
  ` : css`
    background-color: transparent;
    color: ${theme.tokens.current.core.text.secondary};
    &:hover {
      color: ${theme.tokens.current.core.text.primary};
    }
  `}
`);
