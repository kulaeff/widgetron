import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';

export interface MenuProps extends HTMLAttributes<HTMLMenuElement> {
  items: MenuItemProps[];
  onCommand?: (id: string) => void;
}

export interface MenuItemProps extends Record<string, unknown> {
  disabled?: boolean;
  icon?: string;
  id: string;
  label: string;
  popoverTarget?: string;
  shortcut?: string;
}
