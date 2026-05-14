import styled, { css } from "styled-components";
import type { Wrap } from "../../ui/types";
import type { FlexProps, ItemProps } from "./types";

export const Item = styled.div<Wrap<ItemProps>>(
  ({ $grow }) => css`
    flex: ${$grow ? 1 : 0};
  `
);

export const Flex = styled.div<Wrap<FlexProps>>(
  ({ $vertical }) => css`
    display: flex;
    flex-direction: ${$vertical ? "column" : "row"};
    gap: 8px;
    height: 100%;
`);
