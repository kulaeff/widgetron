import styled, { css } from "styled-components";

export const Container = styled("div")<{ $selected?: boolean }>(({ $selected }) => css`
  background-color: rgba(255, 255, 255, 0.44);
  border: 1px solid rgb(255, 255, 255);
  border-radius: 16px;
  box-shadow: 0 0 32px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  outline: ${$selected ? "1px solid rgba(35, 111, 255, 0.9)" : "none"};
  padding: 20px;
`);

export const Label = styled.span(
  ({ theme }) => css`
    ${theme.typography.body2Regular};
    align-content: center;
    color: ${theme.tokens.current.core.text.secondary};
    display: block;
    height: 200px;
    margin: auto 0;
    text-align: center;
  `
);
