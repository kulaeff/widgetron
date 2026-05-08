import styled, { css } from "styled-components";

export const Container = styled("div")<{ $selected?: boolean }>(({ $selected }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.72)",
  border: "1px solid rgba(209, 213, 219, 0.8)",
  borderRadius: "12px",
  boxShadow: "0 14px 42px rgba(15, 23, 42, 0.10)",
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
