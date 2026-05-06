import type { ElementType, ReactNode } from "react";
import React from "react";

type BaseProps = {
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
};

export function createMockComponent(tag: ElementType = "div") {
  return function MockComponent({ children, ...rest }: BaseProps) {
    return React.createElement(tag, rest, children);
  };
}

export type OptionProps = {
  children?: ReactNode;
  value?: string;
};
