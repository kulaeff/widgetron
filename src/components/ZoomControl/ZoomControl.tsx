import { useEffect, useRef, useState, type FC } from "react";
import * as Styled from "./styled";

export type ZoomOption = {
  id: string;
  label: string;
  value: number;
};

type ZoomControlProps = {
  value: number;
  options: ZoomOption[];
  onChange: (next: number) => void;
};

export const ZoomControl: FC<ZoomControlProps> = ({
  value,
  options,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) return;

      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <Styled.Root ref={rootRef}>
      {open ? (
        <Styled.Dropdown>
          {options.map((option) => (
            <Styled.OptionButton
              key={option.id}
              type="button"
              $active={option.value === value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </Styled.OptionButton>
          ))}
        </Styled.Dropdown>
      ) : null}

      <Styled.Trigger type="button" onClick={() => setOpen((prev) => !prev)}>
        {Math.round(value * 100)}%
      </Styled.Trigger>
    </Styled.Root>
  );
};
