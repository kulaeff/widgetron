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
  boxSizing: "border-box",
  maxHeight: "100px",
  outline: "none",
  padding: 0,
  resize: "none",
  width: "100%",
  "&:disabled": {
    backgroundColor: "transparent",
  },
}));
