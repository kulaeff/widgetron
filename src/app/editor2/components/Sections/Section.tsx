import { useContext, useEffect, type FC, type PropsWithChildren } from "react";
import * as Styled from "./styled";
import type { SectionProps } from "./types";
import { SectionsContext } from "./Context";

export const Section: FC<PropsWithChildren<SectionProps>> = ({
  children,
  size = "*",
}) => {
  const { setSize } = useContext(SectionsContext);

  useEffect(() => {
    setSize(size);
  }, [size]);

  return <Styled.Section>{children}</Styled.Section>;
};
