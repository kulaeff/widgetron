import { Tag } from "@pulse/ui/components/Tags/Tag";
import * as Styled from "./styled";
import type { DynamicString } from "@json-render/core";
import { type FC, useMemo } from "react";
import { Leva, useControls } from "leva";
import type { Schema } from "leva/dist/declarations/src/types";
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
  value: Extract<DynamicString, string>;
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

type LevaControlChangeHandler = (
  value: unknown,
  path: string,
  context: { initial: boolean }
) => void;

export type LevaControl =
  | BooleanControl
  | ColorControl
  | NumberControl
  | SelectControl
  | TextControl;

const toStableOnChange = (
  onChange: (value: string | number | boolean) => void
): LevaControlChangeHandler => {
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

export const LevaPanel: FC<LevaPanelProps> = ({
  controls,
  name,
  type,
  onControlChange,
}) => {
  const { tokens, typography } = useTheme();

  console.log(controls);

  const schema = useMemo(() => {
    return controls.reduce<Schema>((acc, control) => {
      const { type: _type, ...schemaControl } = control;

      acc[control.id] = {
        ...schemaControl,
        onChange: toStableOnChange((value) =>
          onControlChange(control.id, value)
        ),
      };
      return acc;
    }, {});
  }, [controls, onControlChange]);

  console.log(schema);

  const theme = useMemo(
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

  useControls(() => schema, [schema]);

  return (
    <Styled.Container>
      <Styled.Header>
        <Tag>{type}</Tag>
        {name ? <Styled.Name>{name}</Styled.Name> : null}
      </Styled.Header>
      <Styled.Panel>
        <Leva
          fill
          flat
          hideCopyButton
          titleBar={false}
          collapsed={false}
          theme={theme}
        />
      </Styled.Panel>
    </Styled.Container>
  );
};
