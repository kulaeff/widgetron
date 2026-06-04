import { IconButton } from "@pulse/ui/components/Button";
import {
  MouseEventHandler,
  useState,
  type ChangeEventHandler,
  type FC,
  type KeyboardEventHandler,
} from "react";
import { useTranslation } from "react-i18next";
import { ArrowRightIcon } from "../../icons/ArrowRight";
import { PlusIcon } from "../../icons/Plus";
import { StopIcon } from "../../icons/Stop";
import * as Styled from "./styled";
import { Dropdown } from "../Dropdown";
import { Menu } from "../Menu";
import { Prompt } from "./Prompt";

export type OmniBoxContextTag = {
  id: string;
  label: string;
  count?: number;
};

export type OmniBoxProps = {
  contextTags?: OmniBoxContextTag[];
  elementTag?: string;
  loading?: boolean;
  onSubmit: (value: string) => void;
  onReset?: () => void;
  onToolRequest?: (tool: string) => void;
  onContextTagRemove: (id: string) => void;
  onElementTagClick: () => void;
};

export const OmniBox: FC<OmniBoxProps> = ({
  contextTags = [],
  elementTag,
  loading = false,
  onSubmit,
  onReset,
  onToolRequest,
  onContextTagRemove,
  onElementTagClick,
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
      {elementTag ? (
        <Styled.ElementTag onClick={onElementTagClick}>
          {elementTag}
        </Styled.ElementTag>
      ) : null}
      <Prompt
        disabled={loading}
        placeholder={elementTag ? `Что вы хотите изменить?` : "Что вы хотите получить?"}
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
              <IconButton
                onClick={() => setIsDropdownOpen((prev) => !prev)}
              >
                <PlusIcon />
              </IconButton>
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
            <StopIcon />
          ) : (
            <ArrowRightIcon />
          )}
        </IconButton>
      </Styled.Buttons>
    </Styled.OmniBox>
  );
};
