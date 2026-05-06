import type { ReactNode } from "react";
import React from "react";

type TabProps = {
  children?: ReactNode;
};

type TabsProps = {
  children?: ReactNode;
  selectedIndex?: number;
  onTabChange?: (event: React.MouseEvent<HTMLButtonElement>, index: number) => void;
  $type?: string;
};

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}

export function Tabs({ children, selectedIndex = 0, onTabChange }: TabsProps) {
  const items = React.Children.toArray(children);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        {items.map((child, index) => (
          <button
            key={index}
            type="button"
            onClick={(event) => onTabChange?.(event, index)}
            style={{ fontWeight: selectedIndex === index ? 700 : 400 }}
          >
            {child}
          </button>
        ))}
      </div>
      <div>{items[selectedIndex] ?? null}</div>
    </div>
  );
}
