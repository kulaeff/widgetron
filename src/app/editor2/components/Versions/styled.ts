import styled, { css } from "styled-components";

export const Versions = styled.ul`
  box-sizing: border-box;
  height: 100%;
  margin: 0;
  overflow: auto;
  padding: 0;
`;

export const Empty = styled.span((
  { theme }) => css`
    ${theme.typography.body2Regular};
    align-items: center;
    color: ${theme.tokens.current.core.text.secondary};
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    list-style: none;
    padding: 8px;
    text-align: center;
  `
);

export const Id = styled.span`
  color: ${({ theme }) => theme.tokens.current.core.text.secondary};
  display: block;
  width: 3ch;
`;

export const Item = styled.li<{
  $isDisabled?: boolean;
  $isSelected?: boolean;
}>`
  background-color: ${({ $isDisabled, $isSelected, theme }) =>
    // eslint-disable-next-line no-nested-ternary
    $isSelected
      ? $isDisabled
        ? theme.tokens.current.core.accent.secondary
        : theme.tokens.current.colors.blue.solid[20]
      : "transparent"};
  border-radius: 4px;
  cursor: ${({ $isDisabled }) => ($isDisabled ? "default" : "pointer")};
  list-style: none;
  margin: 4px 0 0 0;
  padding: 0;
  pointer-events: ${({ $isDisabled }) => ($isDisabled ? "none" : "auto")};
  transition: background-color 40ms;
  &:hover {
    background-color: ${({ $isSelected, theme }) =>
      $isSelected
        ? theme.tokens.current.colors.blue.solid[20]
        : theme.tokens.current.core.accent.secondary};
  }
`;

export const Content = styled.div<{
  $isLoading?: boolean;
}>`
  border-radius: 4px;
  display: grid;
  gap: 8px;
  grid-template-columns: auto 1fr auto;
  padding: 12px 16px;
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

export const Tokens = styled.span`
  ${({ theme }) => theme.typography.body2Regular};
  color: ${({ theme }) => theme.tokens.current.core.text.secondary};
  display: block;
`;
