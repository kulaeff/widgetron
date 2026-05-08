import type { ReactNode, TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  children?: ReactNode;
};

export function Line(props: Props) {
  return (
    <textarea
      rows={2}
      style={{
        border: "none",
        color: "#111827",
        boxSizing: "border-box",
        font: "inherit",
        lineHeight: "20px",
        minHeight: 44,
        outline: "none",
        paddingRight: 42,
        resize: "none",
        width: "100%",
      }}
      {...props}
    />
  );
}
