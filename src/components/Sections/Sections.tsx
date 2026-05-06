import { useCallback, useEffect, useState, type FC, type PropsWithChildren } from "react";
import * as Styled from "./styled";
import type { SectionsProps, Size } from "./types";
import { SectionsContext } from "./Context";

export const Sections: FC<PropsWithChildren<SectionsProps>> = ({
  children,
  vertical = false,
}) => {
  const [sizes, setSizes] = useState([] as Size[]);

  const setSize = useCallback((size: Size) => {
    setSizes((p) => [...p, size]);
  }, []);

  useEffect(() => () => {
    setSizes([]);
  }, []);

  return (
    <SectionsContext.Provider value={{ setSize }}>
      <Styled.Sections $config={sizes} $vertical={vertical}>
        {children}
      </Styled.Sections>
    </SectionsContext.Provider>
  );
};
