import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
  $type?: string;
  fullWidth?: boolean;
  isLoading?: boolean;
  label?: string;
  size?: string;
  [key: string]: unknown;
};

export function Button({
  children,
  $type,
  fullWidth = false,
  isLoading = false,
  label,
  size = "m",
  style,
  ...props
}: Props) {
  return (
    <button
      {...props}
      data-size={size}
      data-ui-type={$type}
      style={{
        ...buttonStyle(props.disabled),
        ...style,
        width: fullWidth ? "100%" : style?.width,
      }}
    >
      {isLoading ? "Loading..." : children ?? label}
    </button>
  );
}

export function IconButton({ children, $type, size, style, ...props }: Props) {
  return (
    <button
      {...props}
      data-size={size}
      data-ui-type={$type}
      style={{ ...iconButtonStyle(props.disabled), ...style }}
    >
      {children}
    </button>
  );
}

const buttonStyle = (disabled?: boolean): CSSProperties => ({
  background: disabled ? "#f3f4f6" : "#ffffff",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  color: disabled ? "#9ca3af" : "#111827",
  cursor: disabled ? "default" : "pointer",
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
