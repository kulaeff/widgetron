import {
  cloneElement,
  forwardRef,
  isValidElement,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  useCallback,
  useEffect,
  useRef,
  type PropsWithChildren,
} from "react";
import * as Styled from "./styled";
import type { DropdownProps } from "./types";

export const Dropdown = forwardRef<HTMLDivElement, PropsWithChildren<DropdownProps>>((props, ref) => {
  const {
    children,
    className,
    isOpen,
    onChange,
    trigger,
    style,
    ...rest
  } = props;

  const rootRef = useRef<HTMLDivElement | null>(null);

  const setRootRef = useCallback((node: HTMLDivElement | null) => {
    rootRef.current = node;
  }, []);

  const setDropdownRef = useCallback((node: HTMLDivElement | null) => {
    if (!ref) return;

    if (typeof ref === "function") {
      ref(node);
      return;
    }

    ref.current = node;
  }, [ref]);

  const triggerElement = isValidElement<{ onClick?: (event: ReactMouseEvent<HTMLElement>) => void }>(trigger)
    ? trigger as ReactElement<{ onClick?: (event: ReactMouseEvent<HTMLElement>) => void }>
    : null;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
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

  const resolvedTrigger = triggerElement
    ? cloneElement(triggerElement, {
        ...triggerElement.props,
      })
    : trigger;

  return (
    <Styled.Root ref={setRootRef}>
      {resolvedTrigger}
      {isOpen ? (
        <Styled.Dropdown
          {...rest}
          className={className}
          ref={setDropdownRef}
          style={style}
        >
          {children}
        </Styled.Dropdown>
      ) : null}
    </Styled.Root>
  );
});

Dropdown.displayName = "Dropdown";
