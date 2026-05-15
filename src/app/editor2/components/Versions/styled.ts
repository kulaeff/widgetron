import styled, { css } from "styled-components";

export const Versions = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0;
  overflow: hidden;
  padding: 0;
`;

export const List = styled.div`
  max-height: 210px;
  overflow: auto;
`;

export const Items = styled.ul`
  margin: 0;
  padding: 0;
`;

export const Id = styled.span(({ theme }) => css`
  ${theme.typography.body2Regular};
  color: ${theme.tokens.current.core.text.secondary};
  display: block;
  width: 3ch;
`);

export const Item = styled.li<{
  $isDisabled?: boolean;
  $isSelected?: boolean;
}>(({ $isDisabled, $isSelected, theme }) => css`
  ${theme.typography.body1Regular};
  background-color: ${
    // eslint-disable-next-line no-nested-ternary
    $isSelected
      ? $isDisabled
        ? theme.tokens.current.core.accent.secondary
        : theme.tokens.current.system["20"]
      : "transparent"};
  border-radius: 4px;
  cursor: ${$isDisabled ? "default" : "pointer"};
  list-style: none;
  margin: 4px 0 0 0;
  padding: 0;
  pointer-events: ${$isDisabled ? "none" : "auto"};
  transition: background-color 60ms;
  &:hover {
    background-color: ${$isSelected
      ? theme.tokens.current.system["20"]
      : theme.tokens.current.interactive.hover.tertiary};
  }
`);

export const Content = styled.div<{
  $isLoading?: boolean;
}>`
  border-radius: 4px;
  display: grid;
  gap: 8px;
  grid-template-columns: auto 1fr auto;
  padding: 12px;
  transition: background-color 40ms;
`;

export const Main = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
  overflow: hidden;
`;

export const Prompt = styled.span`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const Tokens = styled.span(({ theme }) => css`
  ${theme.typography.body2Regular};
  color: ${theme.tokens.current.core.text.secondary};
  display: block;
`);

export const Button = styled.button(
  ({ theme }) => css`
    ${theme.typography.body1Regular};
    appearance: none;
    align-items: center;
    background-color: transparent;
    border: none;
    color: ${theme.tokens.current.core.text.primary};
    cursor: pointer;
    display: grid;
    gap: 16px;
    grid-template-columns: 1fr auto;
    padding: 0;
    text-align: left;
    width: 100%;
    &:disabled {
      color: ${theme.tokens.current.core.text.secondary};
      cursor: default;
    }
  `
);

export const Arrow = styled("span") <{ $open: boolean }>`
  align-items: center;
  color: ${({ theme }) => theme.tokens.current.core.text.secondary};
  display: inline-flex;
  justify-content: center;
  transform: rotate(${({ $open }) => ($open ? "180deg" : "0deg")});
  transition: transform 0.16s ease;
`;

export const Label = styled.span``;
