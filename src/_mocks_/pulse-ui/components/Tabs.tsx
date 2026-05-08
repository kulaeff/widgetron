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
    <div
      style={{
        background: "#f3f4f6",
        border: "1px solid #d1d5db",
        borderRadius: 8,
        display: "inline-flex",
        gap: 2,
        padding: 2,
      }}
    >
      {items.map((child, index) => (
        <button
          key={index}
          type="button"
          onClick={(event) => onTabChange?.(event, index)}
          style={{
            background: selectedIndex === index ? "#ffffff" : "transparent",
            border: "none",
            borderRadius: 6,
            boxShadow:
              selectedIndex === index
                ? "0 1px 2px rgba(15, 23, 42, 0.08)"
                : "none",
            color: selectedIndex === index ? "#111827" : "#6b7280",
            cursor: "pointer",
            font: "inherit",
            fontWeight: selectedIndex === index ? 600 : 400,
            padding: "5px 9px",
          }}
        >
          {child}
        </button>
      ))}
    </div>
  );
}
