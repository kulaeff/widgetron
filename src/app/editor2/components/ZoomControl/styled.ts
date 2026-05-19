import styled from "styled-components";

export const Root = styled("div")({
  position: "relative",
});

export const Trigger = styled("button")(({ theme }) => ({
  ...theme.typography.body1Regular,
  backgroundColor: theme.tokens.current.core.background.default,
  border: `1px solid ${theme.tokens.current.core.border.strong}`,
  borderRadius: 6,
  color: theme.tokens.current.core.text.primary,
  cursor: "pointer",
  minWidth: 68,
  padding: "8px 12px",
}));

