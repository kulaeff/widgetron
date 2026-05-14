import { type FC, type PropsWithChildren } from "react";
import * as Styled from "./styled";
import type { SectionProps } from "./types";

export const Section: FC<PropsWithChildren<SectionProps>> = ({
  children,
}) => {
  return <Styled.Section>{children}</Styled.Section>;
};
