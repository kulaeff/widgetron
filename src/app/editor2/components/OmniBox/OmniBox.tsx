import { IconButton } from "@pulse/ui/components/Button";
import {
  MouseEventHandler,
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

export type OmniBoxContextTag = {
  id: string;
  label: string;
  count?: number;
};

export type OmniBoxProps = {
  loading?: boolean;
  placeholder?: string;
  contextTags?: OmniBoxContextTag[];
  onSubmit: (value: string) => void;
  onReset?: () => void;
  onToolRequest?: (tool: string) => void;
  onContextTagRemove?: (id: string) => void;
};

export const OmniBox: FC<OmniBoxProps> = ({
  loading = false,
  placeholder = "Опишите, что вы хотите получить...",
  contextTags = [],
  onSubmit,
  onReset,
  onToolRequest,
  onContextTagRemove,
}) => {
  const { t } = useTranslation();

  const [localValue, setLocalValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
    setIsDropdownOpen(false);

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
        <Styled.LeftActions>
          <Dropdown
            isOpen={isDropdownOpen}
            onChange={setIsDropdownOpen}
            trigger={(
              <Button
                label="+"
                size="sm"
                variant="secondary"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
              />
            )}
            style={{
              marginBottom: "4px",
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
                  command: "show-modal",
                  commandFor: "modalDom",
                },
                {
                  id: "openapi",
                  label: t("спецификация OpenAPI"),
                  command: "show-modal",
                  commandFor: "modalOpenApi",
                },
                {
                  id: "data",
                  label: t("данные"),
                  command: "show-modal",
                  commandFor: "modalData",
                },
              ]}
              onCommand={(id) => handleMenuCommand?.(id)}
            />
          </Dropdown>
          {contextTags.length > 0 ? (
            <Styled.ContextTags>
              {contextTags.map((tag) => (
                <Styled.ContextTag key={tag.id}>
                  <Styled.ContextTagButton
                    type="button"
                    onClick={() => onToolRequest?.(tag.id)}
                  >
                    {tag.label}
                    {tag.count !== undefined ? (
                      <Styled.ContextTagBadge>{tag.count}</Styled.ContextTagBadge>
                    ) : null}
                  </Styled.ContextTagButton>
                  <Styled.ContextTagRemove
                    aria-label={t("Удалить {{label}}", { label: tag.label })}
                    type="button"
                    onClick={() => onContextTagRemove?.(tag.id)}
                  >
                    ×
                  </Styled.ContextTagRemove>
                </Styled.ContextTag>
              ))}
            </Styled.ContextTags>
          ) : null}
        </Styled.LeftActions>
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
