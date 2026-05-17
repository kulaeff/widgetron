import type { ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  label?: string;
  size?: "sm" | "md";
  variant?: "primary" | "secondary";
}
