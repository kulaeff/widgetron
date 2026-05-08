import styled from "styled-components";

export const Buttons = styled("div")`
  align-items: center;
  display: flex;
  justify-content: space-between;
  position: absolute;
  right: 6px;
  top: 6px;

  > div {
    display: none;
  }
`;

export const OmniBox = styled("div")`
  min-width: 0;
`;

export const Flex = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  position: "relative",
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
