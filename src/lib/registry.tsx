import {
  defineRegistry,
  useBoundProp,
  useFieldValidation,
} from "@json-render/react";
import { type ReactNode, useState } from "react";
import { Avatar } from "@pulse/ui/components/Avatar";
import { Badge } from "@pulse/ui/components/Grade/Badge";
import { Button } from "@pulse/ui/components/Button";
import { Card } from "@pulse/ui/components/Card";
import { Chips } from "@pulse/ui/components/Tags/Chips";
import { Checkbox } from "@pulse/ui/components/Checkbox";
import { Divider } from "@pulse/ui/components/Divider";
import { Input } from "@pulse/ui/components/Input";
import { Loader } from "@pulse/ui/components/Loader";
// import { Pagination } from "@pulse/ui/components/Pagination";
import { Radio } from "@pulse/ui/components/Radio";
import { RadioGroup } from "@pulse/ui/components/RadioGroup";
import { Rating } from "@pulse/ui/components/Rating";
import { Select } from "@pulse/ui/components/Select";
import { SkeletonRect } from "@pulse/ui/components/Skeleton";
import { Switch } from "@pulse/ui/components/Switch";
import { Tag } from "@pulse/ui/components/Tags/Tag";
import { TextArea } from "@pulse/ui/components/Input/TextArea";
import { Title } from "@pulse/ui/components/Title";
import { Grid } from "../ui/Grid";
import { Image } from "../ui/Image";
import { Stack } from "../ui/Stack";
// import { Table } from "@/components/ui/table";
import { Text } from "../ui/Text";
// import { Link } from "@/components/ui/link";
import { catalog } from "./catalog";

const getSpecId = <T extends Record<string, unknown>>(
  props: T
): string | null => {
  const fromProps = props?.["data-element-id"];

  if (typeof fromProps === "string" && fromProps.length > 0) return fromProps;

  return null;
};

const withSpecMarker = <T extends Record<string, unknown>>(
  props: T,
  node: ReactNode
) => {
  const id = getSpecId(props);

  if (!id) return node;

  return (
    <div data-element-id={id} style={{ display: "contents" }}>
      {node}
    </div>
  );
};

export const { registry, handlers, executeAction } = defineRegistry(catalog, {
  components: {
    Avatar: ({ props }) =>
      withSpecMarker(
        props,
        <Avatar
          $hasBadge={props.hasBadge}
          $icon={props.url}
          $label={props.label}
          $size={props.size}
          $text={props.text}
        />
      ),
    Badge: ({ props }) =>
      withSpecMarker(props, <Badge $size={props.size} $style={props.style} />),
    Button: ({ props, emit }) =>
      withSpecMarker(
        props,
        <Button
          $fullWidth={props.fullWidth}
          $isLoading={props.isLoading}
          $size={props.size}
          $type={props.type}
          disabled={props.disabled}
          onClick={() => emit("press")}
        >
          {props.label}
        </Button>
      ),
    Card: ({ props, children }) =>
      withSpecMarker(
        props,
        <Card
          $border={props.border}
          $shadow={props.shadow}
          $type={props.type}
          $variant={props.variant}
        >
          {children}
        </Card>
      ),
    Chips: ({ props, emit }) =>
      withSpecMarker(
        props,
        <Chips
          $size={props.size}
          $type={props.type}
          onClick={() => emit("press")}
        >
          {props.label}
        </Chips>
      ),
    Grid: ({ props, children }) =>
      withSpecMarker(props, <Grid {...props}>{children}</Grid>),
    Radio: ({ props, bindings, emit }) => {
      const [boundValue, setBoundValue] = useBoundProp(
        props.value,
        bindings?.value
      );
      const [localValue, setLocalValue] = useState("");

      const isBound = !!bindings?.value;
      const value = isBound ? boundValue ?? "" : localValue;
      const setValue = isBound ? setBoundValue : setLocalValue;

      return withSpecMarker(
        props,
        <Radio
          {...props}
          checked={value === props.value}
          value={props.value}
          onChange={(e) => {
            setValue(e.target.value);

            emit?.("change");
          }}
        >
          {props.label}
        </Radio>
      );
    },
    Stack: ({ props, children }) =>
      withSpecMarker(props, <Stack {...props}>{children}</Stack>),
    Skeleton: ({ props, children }) =>
      withSpecMarker(props, <SkeletonRect {...props}>{children}</SkeletonRect>),
    Divider: ({ props }) => withSpecMarker(props, <Divider {...props} />),
    // Table: ({ props }) => withSpecMarker(props, <Table {...props} />),
    Tag: ({ props }) =>
      withSpecMarker(
        props,
        <Tag $color={props.color} $size={props.size}>
          {props.label}
        </Tag>
      ),
    Text: ({ props }) => withSpecMarker(props, <Text {...props} />),
    Title: ({ props }) =>
      withSpecMarker(
        props,
        <Title $size={props.size}>
          {typeof props.text !== "string"
            ? JSON.stringify(props.text)
            : props.text}
        </Title>
      ),
    Image: ({ props }) => withSpecMarker(props, <Image {...props} />),
    Loader: ({ props }) => withSpecMarker(props, <Loader {...props} />),
    Rating: ({ props }) => withSpecMarker(props, <Rating {...props} />),
    Input: ({ props, bindings, emit }) => {
      const [boundValue, setBoundValue] = useBoundProp(
        props.value,
        bindings?.value
      );
      const [localValue, setLocalValue] = useState("");
      const isBound = Boolean(bindings?.value);
      const value = isBound ? boundValue ?? "" : localValue;
      const setValue = isBound ? setBoundValue : setLocalValue;

      const hasValidation = Boolean(bindings?.value && props.checks?.length);
      const { errors, validate } = useFieldValidation(
        bindings?.value ?? "",
        hasValidation ? { checks: props.checks ?? [] } : undefined
      );

      return withSpecMarker(
        props,
        <div>
          <label className="flex flex-col gap-1">
            {props.label}
            <Input
              {...props}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);

                emit?.("change");
              }}
            />
          </label>
          {errors.length > 0 && (
            <p className="text-sm text-red-500">{errors[0]}</p>
          )}
        </div>
      );
    },
    TextArea: ({ bindings, props, emit }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);

      return withSpecMarker(
        props,
        <TextArea
          {...props}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);

            emit?.("change");
          }}
        />
      );
    },
    Select: ({ props, bindings, emit }) => {
      const [value, setValue] = useBoundProp(props.value, bindings?.value);

      return withSpecMarker(
        props,
        <Select
          {...props}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);

            emit?.("change");
          }}
        />
      );
    },
    Checkbox: ({ props, bindings, emit }) => {
      const [checked, setChecked] = useBoundProp(
        props.checked,
        bindings?.checked
      );

      return withSpecMarker(
        props,
        <Checkbox
          {...props}
          checked={checked}
          onChange={(e) => {
            setChecked(e.target.checked);

            emit?.("change");
          }}
        />
      );
    },
    Switch: ({ props, bindings, emit }) => {
      const [checked, setChecked] = useBoundProp(
        props.checked,
        bindings?.checked
      );

      return withSpecMarker(
        props,
        <Switch
          {...props}
          checked={checked}
          onChange={(e) => {
            setChecked(e.target.checked);

            emit?.("change");
          }}
        />
      );
    },
    // Link: ({ props, children }) =>
    // withSpecMarker(props, <Link {...props}>{children}</Link>),
    /* Pagination: ({ props, bindings, emit }) => {
      const { page, ...rest } = props;

      const [boundPage, setBoundPage] = useBoundProp(page, bindings?.page);

      return withSpecMarker(
        props,
        <Pagination
          {...rest}
          page={boundPage}
          onChange={(page) => {
            setBoundPage(page);

            emit("change");
          }}
        />
      );
    }, */
  },
  actions: {
    // Demo actions — show toasts
    buttonClick: async (params) => {
      console.log("click", params);
    },
    formSubmit: async (params) => {
      console.log("submit", params);
    },
    linkClick: async (params) => {
      console.log("link", params);
    },
    httpRequest: async (params, setState) => {
      if (params) {
        const { url, method, headers, body, statePath = "data" } = params;

        const response = await fetch(url, {
          method: method ?? "GET",
          headers: { ...headers, "Content-Type": "application/json" },
          body: body ? JSON.stringify(body) : undefined,
        });

        const data = await response.json();

        setState((p) => ({ ...p, [statePath]: data }));
      }
    },
  },
});

// Fallback component for unknown types
export function Fallback({ type }: { type: string }) {
  return <div className="text-xs text-red-500">[{type}]</div>;
}
