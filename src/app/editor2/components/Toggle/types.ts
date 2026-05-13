export interface ToggleOption extends Record<string, unknown> {
  id: string;
  isAccent?: boolean;
  label: string;
};

export interface ToggleProps {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
};
