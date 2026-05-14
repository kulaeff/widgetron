import styled, { css } from "styled-components";

export const Container = styled.div`
  box-sizing: border-box;
  height: 100%;
  overflow: auto;
`;

export const Group = styled.section`
  & + & {
    margin-top: 14px;
  }
`;

export const Header = styled.h5(
  ({ theme }) => css`
    color: ${theme.tokens.current.core.text.secondary};
    margin: 0;
    padding: 8px;
  `
);

export const Icon = styled.div(
  ({ theme }) => css`
    ${theme.typography.body1Semibold};
    align-items: center;
    background-color: ${theme.tokens.current.core.background.default};
    border: 1px solid ${theme.tokens.current.core.border.strong};
    border-radius: 6px;
    display: inline-flex;
    flex: 0 0 28px;
    height: 28px;
    justify-content: center;
    width: 28px;
  `
);

export const Label = styled.span(
  ({ theme }) => css`
    ${theme.typography.body2Regular};
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `
);

export const Tool = styled.li<{ $isDragging?: boolean }>(
  ({ theme, $isDragging }) => css`
    align-items: center;
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 6px;
    cursor: grab;
    display: flex;
    gap: 8px;
    height: 44px;
    opacity: ${$isDragging ? 0.5 : 1};
    padding: 8px 10px;
    overflow: hidden;
    text-align: left;
    transition: background-color 40ms, color 40ms;
    &:hover {
      background-color: ${theme.tokens.current.core.accent.secondary};
    }
  `
);

export const Tools = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 6px;
  list-style: none;
  margin: 0;
  padding: 0;
`;
