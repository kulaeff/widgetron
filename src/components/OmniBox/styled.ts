import styled from "styled-components";

export const Buttons = styled("div")`
  display: flex;
  justify-content: space-between;
`;

export const OmniBox = styled("div")``;

export const Flex = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "8px",
});

export const Input = styled("textarea")(({ theme }) => ({
  ...theme.typography.body1Regular,
  appearance: "none",
  border: "none",
  outline: "none",
  padding: 0,
  resize: "none",
  width: "100%",
}));
