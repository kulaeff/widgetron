import type { HTMLAttributes, ReactNode } from "react";

export interface DropdownProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  isOpen: boolean;
  onChange: (state: boolean) => void;
  trigger: ReactNode;
}
