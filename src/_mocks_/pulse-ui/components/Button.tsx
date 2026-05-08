import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  $type?: string;
  size?: string;
  [key: string]: unknown;
};

export function Button({ children, ...props }: Props) {
  return (
    <button {...props} style={{ ...buttonStyle(props.disabled), ...props.style }}>
      {children}
    </button>
  );
}

export function IconButton({ children, ...props }: Props) {
  return (
    <button {...props} style={{ ...iconButtonStyle(props.disabled), ...props.style }}>
      {children}
    </button>
  );
}

const buttonStyle = (disabled?: boolean): CSSProperties => ({
  background: disabled ? "#f3f4f6" : "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  color: disabled ? "#9ca3af" : "#111827",
  cursor: disabled ? "not-allowed" : "pointer",
  font: "inherit",
  opacity: disabled ? 0.72 : 1,
  padding: "6px 12px",
});

const iconButtonStyle = (disabled?: boolean): CSSProperties => ({
  ...buttonStyle(disabled),
  alignItems: "center",
  display: "inline-flex",
  height: 32,
  justifyContent: "center",
  padding: 0,
  width: 32,
});
