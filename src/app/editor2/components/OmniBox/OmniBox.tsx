import { Button, IconButton } from "@pulse/ui/components/Button";
import {
  MouseEventHandler,
  useState,
  type ChangeEventHandler,
  type FC,
  type KeyboardEventHandler,
} from "react";
import { useTranslation } from "react-i18next";
import * as Styled from "./styled";
import { Prompt } from "./Prompt";

export type OmniBoxProps = {
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  onSubmit: (value: string) => void;
  onReset?: () => void;
  onToolRequest?: (tool: string) => void;
};

export const OmniBox: FC<OmniBoxProps> = ({
  disabled = false,
  loading = false,
  placeholder = "Опишите, что вы хотите получить...",
  onSubmit,
  onReset,
  onToolRequest,
}) => {
  const { t } = useTranslation();

  const [localValue, setLocalValue] = useState("");

  const handlePromptChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setLocalValue(e.target.value);
  };

  const handleButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
    if (loading) {
      onReset?.();
    } else {
      onSubmit(localValue);

      setLocalValue("");
    }
  };

  const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (loading) return;

      if (localValue.length > 0) {
        onSubmit(localValue);

        setLocalValue("");
      }
    }
  };

  return (
    <Styled.OmniBox>
      <Prompt
        disabled={loading}
        placeholder={placeholder}
        value={localValue}
        onChange={handlePromptChange}
        onKeyDown={handleKeyDown}
      />
      <Styled.Buttons>
        <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
          <IconButton size="s" $type="secondary">
            +
          </IconButton>
          <Button
            $size="s"
            $type="secondary"
            onClick={() => onToolRequest?.("data")}
          >
            {t("данные")}
          </Button>
        </div>
        <IconButton
          aria-label={loading ? "Stop" : "Send"}
          disabled={loading ? !onReset : localValue.length === 0}
          size="s"
          type="button"
          onClick={handleButtonClick}
          style={{ justifySelf: "end" }}
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
    </Styled.OmniBox>
  );
};
