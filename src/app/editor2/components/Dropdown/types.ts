import type { CSSProperties, HTMLAttributes, Ref } from 'react';

export interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  inset?: CSSProperties['inset'];
  ref?: Ref<HTMLDivElement>;
  type?: 'auto' | 'manual' | 'hint';
}
