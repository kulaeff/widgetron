import type { InputHTMLAttributes } from "react";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  [key: string]: unknown;
};

export function Switch({ disabled, checked, label, ...props }: Props) {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        margin: 0,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        {...props}
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none",
          margin: 0,
        }}
      />
      <span
        aria-hidden
        style={{
          position: "relative",
          width: 36,
          height: 20,
          borderRadius: 999,
          backgroundColor: checked ? "#4f46e5" : "#cbd5e1",
          transition: "background-color 0.15s ease",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 18 : 2,
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: "#fff",
            transition: "left 0.15s ease",
          }}
        />
      </span>
      {label ? <span style={{ marginLeft: 8 }}>{label}</span> : null}
    </label>
  );
}
