import * as Styled from "./styled";
import type { FC } from "react";
import type { ToggleProps } from "./types";

export const Toggle: FC<ToggleProps> = ({ options, value, onChange }) => {
  return (
    <Styled.Toggle>
      {options.map((option) => (
        <Styled.Option
          $isAccent={option.isAccent}
          $isActive={option.id === value}
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </Styled.Option>
      ))}
    </Styled.Toggle>
  );
}
