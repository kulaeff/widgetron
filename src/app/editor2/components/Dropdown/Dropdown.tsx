import {
  forwardRef,
  useEffect,
  useRef,
  type PropsWithChildren,
} from "react";
import * as Styled from "./styled";
import type { DropdownProps } from "./types";

export const Dropdown = forwardRef<HTMLDivElement, PropsWithChildren<DropdownProps>>((props, ref) => {
  const {
    children,
    isOpen,
    onChange,
    trigger,
    style,
    ...rest
  } = props;

  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: Event) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      onChange(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onChange(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onChange]);

  return (
    <Styled.Root ref={rootRef}>
      {trigger}
      {isOpen ? (
        <Styled.Dropdown
          {...rest}
          ref={ref}
          style={style}
        >
          {children}
        </Styled.Dropdown>
      ) : null}
    </Styled.Root>
  );
});

Dropdown.displayName = "Dropdown";
