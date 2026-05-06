import styled, { css } from "styled-components";

export const Container = styled.div`
  box-sizing: border-box;
  height: 100%;
  padding: 8px;
  overflow: auto;
`;

export const Group = styled.section``;

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
    display: block;
  `
);

export const Label = styled.span(
  ({ theme }) => css`
    ${theme.typography.body2Regular};
    display: block;
    margin-top: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `
);

export const Tool = styled.li(
  ({ theme }) => css`
    align-content: center;
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 6px;
    height: 64px;
    padding: 8px;
    overflow: hidden;
    text-align: center;
    transition: background-color 40ms, color 40ms;
    width: 64px;
    &:hover {
      background-color: ${theme.tokens.current.core.accent.secondary};
    }
  `
);

export const Tools = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  list-style: none;
  margin: 0;
  padding: 0;
`;
