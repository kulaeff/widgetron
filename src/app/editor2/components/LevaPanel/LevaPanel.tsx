import { Tag } from "@pulse/ui/components/Tags/Tag";
import { type ChangeEvent, type FC, useMemo, useState } from "react";
import * as Styled from "./styled";

type BaseControl = {
  id: string;
  label: string;
};

type NumberControl = BaseControl & {
  type: "number";
  value: unknown;
  min?: number;
  max?: number;
  step?: number;
};

type TextControl = BaseControl & {
  type: "string";
  value: unknown;
  placeholder?: string;
};

type BooleanControl = BaseControl & {
  type: "boolean";
  value: unknown;
};

type SelectControl = BaseControl & {
  type: "select";
  value: unknown;
  options: string[];
};

type ColorControl = BaseControl & {
  type: "color";
  value: unknown;
};

export type LevaControl =
  | BooleanControl
  | ColorControl
  | NumberControl
  | SelectControl
  | TextControl;

type LiteralValue = string | number | boolean;
type BindingMode =
  | "literal"
  | "$state"
  | "$bindState"
  | "$item"
  | "$bindItem"
  | "$template"
  | "$computed";

type PointerExpression =
  | { $state: string }
  | { $bindState: string }
  | { $item: string }
  | { $bindItem: string };

type TemplateExpression = { $template: string };
type ComputedExpression = { $computed: string; args?: Record<string, unknown> };
type SupportedExpression = PointerExpression | TemplateExpression | ComputedExpression;
export type LevaControlValue = LiteralValue | SupportedExpression;

type DraftState = {
  mode: BindingMode;
  pointer: string;
  template: string;
  computedName: string;
  computedArgsText: string;
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isPointerLike = (pointer: string): boolean => {
  if (pointer.length === 0) {
    return true;
  }

  return pointer.startsWith("/");
};

const getBindingMode = (value: unknown): BindingMode => {
  if (!isObjectRecord(value)) {
    return "literal";
  }

  if (typeof value.$state === "string") return "$state";
  if (typeof value.$bindState === "string") return "$bindState";
  if (typeof value.$item === "string") return "$item";
  if (typeof value.$bindItem === "string") return "$bindItem";
  if (typeof value.$template === "string") return "$template";
  if (typeof value.$computed === "string") return "$computed";

  return "literal";
};

const getBindingPreview = (value: unknown): string | null => {
  const mode = getBindingMode(value);
  if (mode === "literal" || !isObjectRecord(value)) {
    return null;
  }

  if (
    mode === "$state" ||
    mode === "$bindState" ||
    mode === "$item" ||
    mode === "$bindItem"
  ) {
    const path = value[mode];
    return typeof path === "string" ? `{"${mode}":"${path}"}` : `{"${mode}":""}`;
  }

  if (mode === "$template") {
    const template = typeof value.$template === "string" ? value.$template : "";
    return `{"$template":"${template}"}`;
  }

  const computedName = typeof value.$computed === "string" ? value.$computed : "";
  const args = isObjectRecord(value.args) ? value.args : undefined;
  if (!args || Object.keys(args).length === 0) {
    return `{"$computed":"${computedName}"}`;
  }

  return `{"$computed":"${computedName}","args":${JSON.stringify(args)}}`;
};

const getLiteralFallback = (control: LevaControl): LiteralValue => {
  if (typeof control.value === "string") return control.value;
  if (typeof control.value === "number") return control.value;
  if (typeof control.value === "boolean") return control.value;

  switch (control.type) {
    case "boolean":
      return false;
    case "number":
      return 0;
    case "select":
      return control.options[0] ?? "";
    case "color":
      return "#000000";
    default:
      return "";
  }
};

const createDraftState = (value: unknown): DraftState => {
  const mode = getBindingMode(value);
  const expression = isObjectRecord(value) ? value : undefined;
  const pointerMode =
    mode === "$state" || mode === "$bindState" || mode === "$item" || mode === "$bindItem";

  return {
    mode,
    pointer:
      pointerMode && typeof expression?.[mode] === "string"
        ? (expression[mode] as string)
        : "",
    template: typeof expression?.$template === "string" ? expression.$template : "",
    computedName: typeof expression?.$computed === "string" ? expression.$computed : "",
    computedArgsText: expression?.args ? JSON.stringify(expression.args, null, 2) : "{}",
  };
};

interface LevaPanelProps {
  controls: LevaControl[];
  name?: string;
  type?: string;
  onControlChange: (id: string, value: LevaControlValue) => void;
}

type ControlRowProps = {
  control: LevaControl;
  onControlChange: (id: string, value: LevaControlValue) => void;
};

const ControlRow: FC<ControlRowProps> = ({ control, onControlChange }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [draft, setDraft] = useState<DraftState>(() => createDraftState(control.value));
  const [lastLiteral, setLastLiteral] = useState<LiteralValue>(() =>
    getLiteralFallback(control)
  );

  const mode = useMemo(() => getBindingMode(control.value), [control.value]);
  const isBound = mode !== "literal";
  const bindingHint = isBound ? `Bound via ${mode}` : undefined;
  const bindingPreview = useMemo(() => getBindingPreview(control.value), [control.value]);
  const literalValue = useMemo(() => {
    if (
      !isBound &&
      (typeof control.value === "string" ||
        typeof control.value === "number" ||
        typeof control.value === "boolean")
    ) {
      return control.value;
    }

    return lastLiteral;
  }, [control.value, isBound, lastLiteral]);

  const pointerError =
    draft.mode === "$state" ||
    draft.mode === "$bindState" ||
    draft.mode === "$item" ||
    draft.mode === "$bindItem"
      ? isPointerLike(draft.pointer)
        ? null
        : "JSON Pointer должен начинаться с /"
      : null;

  let computedArgsError: string | null = null;
  if (draft.mode === "$computed") {
    try {
      const parsed = JSON.parse(draft.computedArgsText || "{}");
      if (!isObjectRecord(parsed)) {
        computedArgsError = "args должны быть JSON-объектом";
      }
    } catch {
      computedArgsError = "Некорректный JSON в args";
    }
  }

  const isApplyDisabled =
    !!pointerError ||
    !!computedArgsError ||
    (draft.mode === "$computed" && draft.computedName.trim().length === 0);

  const handleLiteralChange = (value: LiteralValue) => {
    setLastLiteral(value);
    onControlChange(control.id, value);
  };

  const handleModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDraft((prev) => ({
      ...prev,
      mode: event.target.value as BindingMode,
    }));
  };

  const applyBinding = () => {
    if (isApplyDisabled) return;

    if (draft.mode === "literal") {
      onControlChange(control.id, lastLiteral);
      setIsPopoverOpen(false);
      return;
    }

    if (
      draft.mode === "$state" ||
      draft.mode === "$bindState" ||
      draft.mode === "$item" ||
      draft.mode === "$bindItem"
    ) {
      onControlChange(control.id, {
        [draft.mode]: draft.pointer,
      } as PointerExpression);
      setIsPopoverOpen(false);
      return;
    }

    if (draft.mode === "$template") {
      onControlChange(control.id, { $template: draft.template });
      setIsPopoverOpen(false);
      return;
    }

    const parsedArgs = JSON.parse(draft.computedArgsText || "{}");
    const nextValue: ComputedExpression = {
      $computed: draft.computedName.trim(),
    };

    if (isObjectRecord(parsedArgs) && Object.keys(parsedArgs).length > 0) {
      nextValue.args = parsedArgs;
    }

    onControlChange(control.id, nextValue);
    setIsPopoverOpen(false);
  };

  return (
    <Styled.Row $bound={isBound}>
      <Styled.Label>{control.label}</Styled.Label>

      {control.type === "boolean" ? (
        <Styled.Checkbox
          checked={typeof literalValue === "boolean" ? literalValue : false}
          disabled={isBound}
          title={bindingHint}
          type="checkbox"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleLiteralChange(event.target.checked)
          }
        />
      ) : null}

      {control.type === "number" ? (
        <Styled.Input
          disabled={isBound}
          max={control.max}
          min={control.min}
          placeholder={isBound ? mode : undefined}
          step={control.step}
          title={bindingHint}
          type="number"
          value={typeof literalValue === "number" ? String(literalValue) : ""}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            if (event.target.value === "") {
              handleLiteralChange(0);
              return;
            }

            const next = Number(event.target.value);
            handleLiteralChange(Number.isNaN(next) ? 0 : next);
          }}
        />
      ) : null}

      {control.type === "string" ? (
        <Styled.Input
          disabled={isBound}
          placeholder={isBound ? mode : control.placeholder}
          title={bindingHint}
          type="text"
          value={typeof literalValue === "string" ? literalValue : ""}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleLiteralChange(event.target.value)
          }
        />
      ) : null}

      {control.type === "color" ? (
        <Styled.Input
          disabled={isBound}
          title={bindingHint}
          type="color"
          value={typeof literalValue === "string" ? literalValue : "#000000"}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleLiteralChange(event.target.value)
          }
        />
      ) : null}

      {control.type === "select" ? (
        <Styled.Select
          disabled={isBound}
          title={bindingHint}
          value={typeof literalValue === "string" ? literalValue : ""}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            handleLiteralChange(event.target.value)
          }
        >
          {control.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Styled.Select>
      ) : null}

      <Styled.BindingColumn>
        <Styled.FxButton
          $active={isBound}
          type="button"
          onClick={() => {
            setDraft(createDraftState(control.value));
            setIsPopoverOpen((prev) => !prev);
          }}
        >
          fx
        </Styled.FxButton>
        {isBound && bindingPreview ? (
          <Styled.BindingExpression>
            {bindingPreview}
          </Styled.BindingExpression>
        ) : null}
      </Styled.BindingColumn>

      {isPopoverOpen ? (
        <Styled.Popover>
          <Styled.Field>
            <Styled.FieldLabel>Mode</Styled.FieldLabel>
            <Styled.Select value={draft.mode} onChange={handleModeChange}>
              <option value="literal">literal</option>
              <option value="$state">$state</option>
              <option value="$bindState">$bindState</option>
              <option value="$item">$item</option>
              <option value="$bindItem">$bindItem</option>
              <option value="$template">$template</option>
              <option value="$computed">$computed</option>
            </Styled.Select>
          </Styled.Field>

          {(draft.mode === "$state" ||
            draft.mode === "$bindState" ||
            draft.mode === "$item" ||
            draft.mode === "$bindItem") && (
            <Styled.Field>
              <Styled.FieldLabel>JSON Pointer</Styled.FieldLabel>
              <Styled.Input
                placeholder="/path/to/value"
                type="text"
                value={draft.pointer}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setDraft((prev) => ({
                    ...prev,
                    pointer: event.target.value,
                  }))
                }
              />
              {pointerError ? <Styled.ErrorText>{pointerError}</Styled.ErrorText> : null}
            </Styled.Field>
          )}

          {draft.mode === "$template" ? (
            <Styled.Field>
              <Styled.FieldLabel>Template</Styled.FieldLabel>
              <Styled.Input
                placeholder="Hello ${/user/name}"
                type="text"
                value={draft.template}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setDraft((prev) => ({
                    ...prev,
                    template: event.target.value,
                  }))
                }
              />
            </Styled.Field>
          ) : null}

          {draft.mode === "$computed" ? (
            <>
              <Styled.Field>
                <Styled.FieldLabel>Function</Styled.FieldLabel>
                <Styled.Input
                  placeholder="functionName"
                  type="text"
                  value={draft.computedName}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setDraft((prev) => ({
                      ...prev,
                      computedName: event.target.value,
                    }))
                  }
                />
              </Styled.Field>
              <Styled.Field>
                <Styled.FieldLabel>Args (JSON object)</Styled.FieldLabel>
                <Styled.TextArea
                  rows={4}
                  value={draft.computedArgsText}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                    setDraft((prev) => ({
                      ...prev,
                      computedArgsText: event.target.value,
                    }))
                  }
                />
                {computedArgsError ? (
                  <Styled.ErrorText>{computedArgsError}</Styled.ErrorText>
                ) : null}
              </Styled.Field>
            </>
          ) : null}

          <Styled.PopoverActions>
            <Styled.SecondaryButton
              type="button"
              onClick={() => {
                setDraft(createDraftState(control.value));
                setIsPopoverOpen(false);
              }}
            >
              Cancel
            </Styled.SecondaryButton>
            <Styled.PrimaryButton
              disabled={isApplyDisabled}
              type="button"
              onClick={applyBinding}
            >
              Apply
            </Styled.PrimaryButton>
          </Styled.PopoverActions>
        </Styled.Popover>
      ) : null}
    </Styled.Row>
  );
};

export const LevaPanel: FC<LevaPanelProps> = ({
  controls,
  name,
  type,
  onControlChange,
}) => {
  return (
    <Styled.Container>
      <Styled.Header>
        <Tag>{type}</Tag>
        {name ? <Styled.Name>{name}</Styled.Name> : null}
      </Styled.Header>
      <Styled.Panel>
        {controls.map((control) => (
          <ControlRow
            key={control.id}
            control={control}
            onControlChange={onControlChange}
          />
        ))}
      </Styled.Panel>
    </Styled.Container>
  );
};
