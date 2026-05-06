import styled, { css } from "styled-components";

export const Container = styled("div")({
  backgroundColor: "rgba(255, 255, 255, 0.44)",
  border: "1px solid rgb(255, 255, 255)",
  borderRadius: "16px",
  boxShadow: "0 0 32px rgba(0, 0, 0, 0.1)",
  boxSizing: "border-box",
  minWidth: "294px",
  padding: "20px",
});

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
