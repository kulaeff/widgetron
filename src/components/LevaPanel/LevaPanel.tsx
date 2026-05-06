import { Tag } from "@pulse/ui/components/Tags/Tag";
import * as Styled from "./styled";
import type { DynamicString } from "@json-render/core";
import { type FC, useMemo } from "react";
import { Leva, LevaStoreProvider, useControls, useCreateStore } from "leva";
import { useTheme } from "styled-components";

type BaseControl = {
  id: string;
  label: string;
};

type NumberControl = BaseControl & {
  type: "number";
  value: number;
  min?: number;
  max?: number;
  step?: number;
};

type TextControl = BaseControl & {
  type: "string";
  value: DynamicString;
  placeholder?: string;
};

type BooleanControl = BaseControl & {
  type: "boolean";
  value: boolean;
};

type SelectControl = BaseControl & {
  type: "select";
  value: string;
  options: string[];
};

type ColorControl = BaseControl & {
  type: "color";
  value: string;
};

export type LevaControl =
  | BooleanControl
  | ColorControl
  | NumberControl
  | SelectControl
  | TextControl;

const toStableOnChange = (
  onChange: (value: string | number | boolean) => void
): ((value: unknown, path: string, context: { initial: boolean }) => void) => {
  return (value, _path, context) => {
    if (context.initial) {
      return;
    }
    onChange(value as string | number | boolean);
  };
};

interface LevaPanelProps {
  controls: LevaControl[];
  // Name of the element being inspected
  name?: string;
  // Type of the element being inspected
  type?: string;
  onControlChange: (id: string, value: string | number | boolean) => void;
}

const LevaControls: FC<{
  schema: Record<string, any>;
  theme: Record<string, any>;
}> = ({ schema, theme }) => {
  useControls(() => schema, [schema]);

  return (
    <Leva
      fill
      flat
      oneLineLabels
      hideCopyButton
      titleBar={false}
      collapsed={false}
      theme={theme}
    />
  );
};

export const LevaPanel: FC<LevaPanelProps> = ({
  controls,
  name,
  type,
  onControlChange,
}) => {
  const { tokens, typography } = useTheme();
  const levaStore = useCreateStore();

  const schema = useMemo(() => {
    return controls.reduce<Record<string, any>>((acc, control) => {
      if (control.type === "number") {
        acc[control.id] = {
          label: control.label,
          value: control.value,
          min: control.min,
          max: control.max,
          step: control.step ?? 1,
          onChange: toStableOnChange((value) =>
            onControlChange(control.id, value as number)
          ),
        };
        return acc;
      }

      if (control.type === "boolean") {
        acc[control.id] = {
          label: control.label,
          value: control.value,
          onChange: toStableOnChange((value) =>
            onControlChange(control.id, value as boolean)
          ),
        };
        return acc;
      }

      if (control.type === "select") {
        acc[control.id] = {
          label: control.label,
          value: control.value,
          options: control.options,
          onChange: toStableOnChange((value) =>
            onControlChange(control.id, value as string)
          ),
        };
        return acc;
      }

      if (control.type === "color") {
        acc[control.id] = {
          label: control.label,
          value: control.value,
          onChange: toStableOnChange((value) =>
            onControlChange(control.id, value as string)
          ),
        };
        return acc;
      }

      const isExpression =
        typeof control.value === "object" &&
        control.value !== null &&
        "$state" in control.value;
      const dynamicValue = isExpression
        ? (control.value as { $state: string }).$state
        : (control.value ?? "");

      acc[control.id] = {
        label: control.label,
        value: dynamicValue,
        disabled: isExpression,
        onChange: toStableOnChange((value) =>
          onControlChange(control.id, value as string)
        ),
      };

      return acc;
    }, {});
  }, [controls, onControlChange]);

  const levaTheme = useMemo(
    () => ({
      borderWidths: {
        root: "1px",
        input: "1px",
        focus: "1px",
        hover: "1px",
        active: "1px",
        folder: "1px",
      },
      colors: {
        accent1: tokens.current.system["30"],
        accent2: tokens.current.system["30"],
        accent3: tokens.current.system["20"],
        elevation1: "transparent",
        elevation2: "transparent",
        elevation3: tokens.current.core.layer["01"],
        folderTextColor: tokens.current.core.text.primary,
        folderWidgetColor: tokens.current.core.border.strong,
        highlight1: tokens.current.core.text.primary,
        highlight2: tokens.current.core.text.primary,
        highlight3: tokens.current.core.text.primary,
        toolTipBackground: tokens.current.core.layer["01"],
        toolTipText: tokens.current.core.text.primary,
        vivid1: tokens.current.core.text.primary,
      },
      fontSizes: {
        root: typography.body2Regular.fontSize,
        toolTip: typography.captionRegular.fontSize,
      },
      fonts: {
        mono:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        sans:
          '"SB Sans Text", Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
      },
      fontWeights: {
        button: String(typography.body2Semibold.fontWeight),
        folder: String(typography.body2Semibold.fontWeight),
        label: String(typography.body2Regular.fontWeight),
      },
      radii: {
        lg: "8px",
        sm: "6px",
        xs: "4px",
      },
      shadows: {
        level1: "none",
        level2: "none",
      },
      sizes: {
        checkboxSize: "16px",
        colorPickerHeight: "112px",
        colorPickerWidth: "212px",
        controlWidth: "130px",
        folderTitleHeight: "28px",
        imagePreviewHeight: "100px",
        imagePreviewWidth: "100%",
        joystickHeight: "100px",
        joystickWidth: "100px",
        monitorHeight: "56px",
        numberInputMinWidth: "64px",
        rootWidth: "100%",
        rowHeight: "28px",
        scrubberHeight: "8px",
        scrubberWidth: "8px",
        titleBarHeight: "32px",
      },
      space: {
        colGap: "8px",
        md: "10px",
        rowGap: "8px",
        sm: "6px",
        xs: "3px",
      },
    }),
    [tokens, typography]
  );

  return (
    <Styled.Container>
      <Styled.Header>
        <Tag>{type}</Tag>
        {name ? <Styled.Name>{name}</Styled.Name> : null}
      </Styled.Header>
      <Styled.Panel>
        <LevaStoreProvider store={levaStore}>
          <LevaControls schema={schema} theme={levaTheme} />
        </LevaStoreProvider>
      </Styled.Panel>
    </Styled.Container>
  );
};
