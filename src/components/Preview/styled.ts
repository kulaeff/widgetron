import styled, { css } from "styled-components";

export const Container = styled("div")<{ $selected?: boolean }>(({ $selected }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.44)",
  border: "1px solid rgba(255, 255, 255, 1)",
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  boxSizing: "border-box",
  minWidth: "294px",
  outline: $selected ? "1px solid rgba(35, 111, 255, 0.9)" : "none",
  padding: "20px",
}));

export const Label = styled.span(
  ({ theme }) => css`
    ${theme.typography.body2Regular};
    align-content: center;
    color: ${theme.tokens.current.core.text.secondary};
    display: block;
    max-width: 240px;
    margin: auto 0;
    text-align: center;
  `
);
