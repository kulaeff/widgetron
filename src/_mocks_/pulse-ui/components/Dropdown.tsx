import type { ReactNode } from "react";

type Props = {
  trigger: ReactNode;
  children?: ReactNode;
  isOpen?: boolean;
  onChange?: (open: boolean) => void;
  align?: string;
  withPadding?: boolean;
};

export function Dropdown({ trigger, children, isOpen = false, onChange }: Props) {
  return (
    <div>
      <div
        onClick={() => onChange?.(!isOpen)}
        onKeyDown={() => onChange?.(!isOpen)}
        role="button"
        tabIndex={0}
      >
        {trigger}
      </div>
      {isOpen ? <div>{children}</div> : null}
    </div>
  );
}
