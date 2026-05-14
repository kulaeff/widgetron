import styled from "styled-components";

export const Buttons = styled("div")`
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: space-between;
`;

export const OmniBox = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const TextArea = styled("textarea")(({ theme }) => ({
  ...theme.typography.body1Regular,
  backgroundColor: "transparent",
  appearance: "none",
  border: "none",
  maxHeight: "160px",
  outline: "none",
  overflowY: "hidden",
  padding: 0,
  resize: "none",
  width: "100%",
  "&:disabled": {
    backgroundColor: "transparent",
  },
}));

export const ToggleButton = styled.button(({ theme }) => ({
  ...theme.typography.body2Regular,
  backgroundColor: theme.tokens.current.colors.grey.solid[10],
  borderRadius: "4px",
  appearance: "none",
  border: "none",
  cursor: "pointer",
  outline: "none",
  padding: "8px 12px",
  transition: "background-color 60ms",
  "&:hover": {
    backgroundColor: theme.tokens.current.colors.grey.solid[20],
  },
}));
