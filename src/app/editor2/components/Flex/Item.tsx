import { type FC, type PropsWithChildren } from "react";
import * as Styled from "./styled";
import type { ItemProps } from "./types";

export const Item: FC<PropsWithChildren<ItemProps>> = ({
  children,
  grow,
}) => <Styled.Item>{children}</Styled.Item>;
