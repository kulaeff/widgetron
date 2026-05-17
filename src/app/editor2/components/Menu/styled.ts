import styled, { css } from "styled-components";

export const Menu = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const MenuItem = styled.li`
  list-style: none;
`;

export const MenuButton = styled.button(({ theme }) => css`
  ${theme.typography.body2Regular};
  appearance: none;
  background-color: transparent;
  border: none;
  border-radius: 6px;
  color: ${theme.tokens.current.core.text.primary};
  cursor: pointer;
  display: block;
  padding: 4px 12px;
  text-align: left;
  transition: background-color 60ms;
  width: 100%;
  &:hover:not(:disabled) {
    background: ${theme.tokens.current.interactive.hover.tertiary};
  }
  &:disabled {
    color: ${theme.tokens.current.core.text.secondary};
  }
`);
