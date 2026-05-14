import { Children, isValidElement, type FC, type PropsWithChildren } from "react";
import * as Styled from "./styled";
import type { SectionProps, SectionsProps, Size } from "./types";
import { SectionsContext } from "./Context";

export const Sections: FC<PropsWithChildren<SectionsProps>> = ({
  children,
  vertical = false,
}) => {
  const sizes = Children.toArray(children).map((child): Size => {
    if (!isValidElement<SectionProps>(child)) {
      return "*";
    }

    return child.props.size ?? "*";
  });

  return (
    <SectionsContext.Provider value={{ setSize: () => undefined }}>
      <Styled.Sections $config={sizes} $vertical={vertical}>
        {children}
      </Styled.Sections>
    </SectionsContext.Provider>
  );
};
