import styled, { css } from "styled-components";

export const Tabs = styled.ul(({ theme }) => css`
  border-bottom: 1px solid ${theme.tokens.current.core.border.strong};
  display: flex;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
`);

export const Tab = styled.li<{ $isSelected: boolean }>(({ theme, $isSelected }) => css`
  ${theme.typography.body2Regular};
  cursor: pointer;
  padding-bottom: 8px;
  position: relative;
  transition: color 60ms;
  &:after {
    background-color: ${theme.tokens.current.core.text.primary};
    bottom: -1px;
    content: "";
    height: 1px;
    left: 0;
    opacity: ${$isSelected ? 1 : 0};
    position: absolute;
    transition: opacity 60ms;
    width: 100%;
  }
  ${$isSelected ? css`
    color: ${theme.tokens.current.colors.blue.solid["60"]};
  ` : css`
    color: ${theme.tokens.current.core.text.secondary};
    &:hover {
      color: ${theme.tokens.current.core.text.primary};
    }
  `}
`);
