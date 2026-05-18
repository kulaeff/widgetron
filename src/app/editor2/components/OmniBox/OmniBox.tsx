import { IconButton } from "@pulse/ui/components/Button";
import {
  MouseEventHandler,
  useRef,
  useState,
  type ChangeEventHandler,
  type FC,
  type KeyboardEventHandler,
} from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../Button";
import * as Styled from "./styled";
import { Prompt } from "./Prompt";
import { Dropdown } from "../Dropdown";
import { Menu } from "../Menu";

export type OmniBoxProps = {
  loading?: boolean;
  placeholder?: string;
  onSubmit: (value: string) => void;
  onReset?: () => void;
  onToolRequest?: (tool: string) => void;
};

export const OmniBox: FC<OmniBoxProps> = ({
  loading = false,
  placeholder = "Опишите, что вы хотите получить...",
  onSubmit,
  onReset,
  onToolRequest,
}) => {
  const { t } = useTranslation();

  const [localValue, setLocalValue] = useState("");

  const dropdownAttachRef = useRef<HTMLDivElement>(null);

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

  const handleMenuCommand = (id: string) => {
    dropdownAttachRef.current?.hidePopover();

    onToolRequest?.(id);
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
          <Button label="+" size="sm" variant="secondary" popovertarget="dropdown" style={{ anchorName: "--button-attach" }} />
          <Dropdown
            id="dropdown"
            ref={dropdownAttachRef}
            style={{
              marginBottom: "4px",
              positionAnchor: "--button-attach",
              positionArea: "top span-right",
            }}
          >
            <Menu
              items={[
                {
                  id: "image",
                  label: t("изображение"),
                },
                {
                  id: "api",
                  label: t("API"),
                  command: "show-modal",
                  commandFor: "modalApi",
                },
                {
                  id: "dom",
                  label: t("дерево DOM"),
                },
                {
                  id: "openapi",
                  label: t("спецификация OpenAPI"),
                },
                {
                  id: "data",
                  label: t("данные"),
                },
              ]}
              onCommand={(id) => handleMenuCommand?.(id)}
            />
          </Dropdown>
          <Button
            label={t("данные")}
            size="sm"
            variant="secondary"
            onClick={() => onToolRequest?.("data")}
          />
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
