import { forwardRef, type PropsWithChildren } from "react";
import * as Styled from "./styled";
import type { DropdownProps } from "./types";

export const Dropdown = forwardRef<HTMLDivElement, PropsWithChildren<DropdownProps>>((props, ref) => {
  const {
    children,
    className,
    inset,
    style,
    type = "auto",
    ...rest
  } = props;

  return (
    <Styled.Dropdown
      {...rest}
      className={className}
      // @ts-expect-error Popover API attribute is not typed yet
      popover={type}
      ref={ref}
      style={{
        ...style,
        inset,
      }}
    >
      {children}
    </Styled.Dropdown>
  );
});

Dropdown.displayName = "Dropdown";
