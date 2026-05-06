import styled from "styled-components";

export const Buttons = styled("div")`
  display: flex;
  justify-content: space-between;
  padding: 0 16px 12px 16px;
`;

export const OmniBox = styled("div")`
  padding: 4px 0;
`;

export const Flex = styled("div")({
  display: "flex",
  flexDirection: "column",
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
