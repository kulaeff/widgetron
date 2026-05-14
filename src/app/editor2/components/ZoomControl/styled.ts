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

export const Dropdown = styled("div")(({ theme }) => ({
  backgroundColor: theme.tokens.current.core.background.default,
  border: `1px solid ${theme.tokens.current.core.border.strong}`,
  borderRadius: 8,
  bottom: "calc(100% + 4px)",
  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.16)",
  display: "flex",
  flexDirection: "column",
  right: 0,
  padding: 8,
  position: "absolute",
  zIndex: 20,
}));

export const OptionButton = styled("button")(
  ({ theme }) => ({
    ...theme.typography.body2Regular,
    appearance: "none",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: 6,
    color: theme.tokens.current.core.text.primary,
    cursor: "pointer",
    padding: "6px 12px",
    textAlign: "left",
    whiteSpace: "nowrap",
  })
);
