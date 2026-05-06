import { IconButton } from "@pulse/ui/components/Button";
import { Line } from "@pulse/ui/components/Input/TextArea/Line";
import {
  MouseEventHandler,
  useState,
  type ChangeEventHandler,
  type FC,
  type KeyboardEventHandler,
} from "react";
import * as Styled from "./styled";

export type Prompt = {
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  onSubmit: (value: string) => void;
  onReset?: () => void;
};

export const OmniBox: FC<Prompt> = ({
  disabled = false,
  loading = false,
  placeholder = "Опишите, что вы хотите получить...",
  onSubmit,
  onReset,
}) => {
  const [localValue, setLocalValue] = useState("");

  const handleTextAreaChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setLocalValue(e.target.value);
  };

  const handleButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
    if (loading) {
      onReset?.();
    } else if (localValue.trim().length > 0) {
      onSubmit(localValue);
      setLocalValue("");
    }
  };

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (disabled || loading) return;

      if (localValue.trim().length > 0) {
        onSubmit(localValue);
        setLocalValue("");
      }
    }
  };

  return (
    <Styled.OmniBox>
      <Styled.Flex>
        <Line
          disabled={disabled || loading}
          placeholder={placeholder}
          value={localValue}
          onChange={handleTextAreaChange}
          onKeyDown={handleKeyDown}
        />
        <Styled.Buttons>
          <div />
          <IconButton
            aria-label={loading ? "Stop" : "Send"}
            disabled={
              disabled || (loading ? !onReset : localValue.trim().length === 0)
            }
            size="m-alt"
            type="button"
            onClick={handleButtonClick}
          >
            {loading ? (
              /* stop */
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect x="6" y="6" width="12" height="12" rx="2px" ry="2px" />
              </svg>
            ) : (
              /* arrow right */
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </IconButton>
        </Styled.Buttons>
      </Styled.Flex>
    </Styled.OmniBox>
  );
};
