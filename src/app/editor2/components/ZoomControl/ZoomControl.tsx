import { useViewport } from "@xyflow/react";
import { useEffect, useRef, useState, type FC } from "react";
import * as Styled from "./styled";

export type ZoomOption = {
  id: string;
  label: string;
};

type ZoomControlProps = {
  options: ZoomOption[];
  onChange: (id: ZoomOption["id"]) => void;
};

export const ZoomControl: FC<ZoomControlProps> = ({
  options,
  onChange,
}) => {
  const [open, setOpen] = useState(false);

  const { zoom } = useViewport();

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
              onClick={() => {
                onChange(option.id);
                setOpen(false);
              }}
            >
              {option.label}
            </Styled.OptionButton>
          ))}
        </Styled.Dropdown>
      ) : null}

      <Styled.Trigger type="button" onClick={() => setOpen((prev) => !prev)}>
        {Math.round(zoom * 100)}%
      </Styled.Trigger>
    </Styled.Root>
  );
};
