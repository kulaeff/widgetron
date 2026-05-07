import styled from "styled-components";

export const Container = styled("div")({
  display: "inline-flex",
  gap: 6,
});

export const Button = styled("button")<{ $active: boolean }>(
  ({ $active, theme }) => ({
    ...theme.typography.body2Regular,
    background: $active
      ? theme.tokens.current.system["30"]
      : theme.tokens.current.core.background.default,
    border: `1px solid ${theme.tokens.current.core.border.strong}`,
    borderRadius: 6,
    color: theme.tokens.current.core.text.primary,
    cursor: "pointer",
    padding: "6px 10px",
    whiteSpace: "nowrap",
  })
);
