export interface SizeSelectorOption extends Record<string, unknown> {
  id: string;
  label: string;
};

type Props = {
  options: SizeSelectorOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function SizeSelector({ options, value, onChange, disabled }: Props) {
  return (
    <div style={{ display: "inline-flex", gap: 4 }}>
      {options.map((option) => {
        const active = option.id === value;

        return (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.id)}
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              background: active ? "#1d4ed8" : "#fff",
              color: active ? "#fff" : "#0f172a",
              padding: "4px 8px",
              fontSize: 12,
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.6 : 1,
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
