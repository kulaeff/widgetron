import {
  defineRegistry,
  useBoundProp,
  useFieldValidation,
} from "@json-render/react";
import { useState } from "react";
import { Avatar } from "@pulse/ui/components/Avatar";
import { Badge } from "@pulse/ui/components/Grade/Badge";
import { Button } from "@pulse/ui/components/Button";
import { Card } from "@pulse/ui/components/Card";
import { Chips } from "@pulse/ui/components/Tags/Chips";
import { Checkbox } from "@pulse/ui/components/Checkbox";
import { Divider } from "@pulse/ui/components/Divider";
import { Input } from "@pulse/ui/components/Input";
import { Loader } from "@pulse/ui/components/Loader/Loader";
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
import { Slider } from "../ui/Slider";
import { createStateStore } from "@json-render/react";
import { setByPath } from "@json-render/core";
import { View } from "../ui/View";

const getSpecMarkerProps = (props: unknown) => {
  const id =
    props && typeof props === "object"
      ? (props as Record<string, unknown>)["data-element-id"]
      : undefined;

  if (typeof id !== "string" || id.length === 0) {
    return {};
  }

  return { "data-element-id": id };
};

export const { registry, handlers, executeAction } = defineRegistry(catalog, {
  components: {
    Avatar: ({ props }) =>
      <Avatar
        {...(getSpecMarkerProps(props))}
        $hasBadge={props.hasBadge}
        $icon={props.url}
        $label={props.label}
        $size={props.size}
        $text={props.text}
      />,
    Badge: ({ props }) =>
      <Badge
        {...(getSpecMarkerProps(props) as any)}
        $size={props.size}
        $style={props.style}
      />,
    Button: ({ props, emit }) =>
      <Button
        {...(getSpecMarkerProps(props) as any)}
        $fullWidth={props.fullWidth}
        $isLoading={props.isLoading}
        $size={props.size}
        $type={props.type}
        disabled={props.disabled}
        onClick={() => { console.log("click", props); emit("press")}}
      >
        {props.label}
      </Button>,
    Card: ({ props, children }) => (
      <Card
        {...(getSpecMarkerProps(props) as any)}
        $border={props.border}
        $shadow={props.shadow}
        $variant={props.variant}
      >
        {children}
      </Card>
    ),
    Slider: ({ props, children }) => (
      <Slider
        {...(getSpecMarkerProps(props) as any)}
        autoplay={props.autoPlay}
        loop={props.loop}
      >
        {children}
      </Slider>
    ),
    Chips: ({ props, emit }) =>
      <Chips
        {...(getSpecMarkerProps(props) as any)}
        $size={props.size}
        $type={props.type}
        onClick={() => emit("press")}
      >
        {props.label}
      </Chips>,
    Grid: ({ props, children }) => (
      <Grid {...(getSpecMarkerProps(props) as any)} {...props}>
        {children}
      </Grid>
    ),
    Radio: ({ props, bindings, emit }) => {
      const [boundValue, setBoundValue] = useBoundProp(
        props.value,
        bindings?.value
      );
      const [localValue, setLocalValue] = useState("");

      const isBound = !!bindings?.value;
      const value = isBound ? boundValue ?? "" : localValue;
      const setValue = isBound ? setBoundValue : setLocalValue;

      return (
        <Radio
          {...props}
          {...(getSpecMarkerProps(props) as any)}
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
    Stack: ({ props, children }) => (
      <Stack {...(getSpecMarkerProps(props) as any)} {...props}>
        {children}
      </Stack>
    ),
    Skeleton: ({ props, children }) =>
      <SkeletonRect {...(getSpecMarkerProps(props) as any)} {...props}>{children}</SkeletonRect>,
    Divider: ({ props }) => <Divider {...(getSpecMarkerProps(props) as any)} />,
    // Table: ({ props }) => <Table {...props} />,
    Tag: ({ props }) =>
      <Tag
        {...(getSpecMarkerProps(props) as any)}
        $color={props.color}
        $size={props.size}
      >
        {props.label}
      </Tag>,
    Text: ({ props }) => <Text {...(getSpecMarkerProps(props) as any)} {...props} />,
    Title: ({ props }) =>
      <Title {...(getSpecMarkerProps(props) as any)} $size={props.size}>
        {typeof props.text !== "string"
          ? JSON.stringify(props.text)
          : props.text}
      </Title>,
    Image: ({ props }) => <Image {...(getSpecMarkerProps(props) as any)} {...props} />,
    Progress: ({ props }) =>
      <div {...getSpecMarkerProps(props)}>
        {props.label ? <span>{String(props.label)}</span> : null}
        <progress value={Number(props.value ?? 0)} max={100} />
      </div>,
    Table: ({ props }) =>
      <table {...getSpecMarkerProps(props)}>
        {props.caption ? <caption>{String(props.caption)}</caption> : null}
        <thead>
          <tr>
            {(props.columns ?? []).map((column, index) => (
              <th key={index}>{String(column)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(props.rows ?? []).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{String(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>,
    Loader: ({ props }) => <Loader {...(getSpecMarkerProps(props) as any)} />,
    BarGraph: ({ props }) =>
      <div {...getSpecMarkerProps(props)}>
        {props.title ? <strong>{String(props.title)}</strong> : null}
        {(props.data ?? []).map((item, index) => (
          <div key={index}>
            {String(item.label)}: {Number(item.value)}
          </div>
        ))}
      </div>,
    LineGraph: ({ props }) =>
      <div {...getSpecMarkerProps(props)}>
        {props.title ? <strong>{String(props.title)}</strong> : null}
        {(props.data ?? []).map((item, index) => (
          <div key={index}>
            {String(item.label)}: {Number(item.value)}
          </div>
        ))}
      </div>,
    Rating: ({ props }) => <Rating {...(getSpecMarkerProps(props) as any)} {...props} />,
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

      return (
        <div>
          <label className="flex flex-col gap-1">
            {props.label}
            <Input
              {...(getSpecMarkerProps(props) as any)}
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

      return (
        <TextArea
          {...(getSpecMarkerProps(props) as any)}
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

      return (
        <Select
          {...(getSpecMarkerProps(props) as any)}
          {...props}
          value={value}
          onChange={(value) => {
            setValue(value);

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

      return (
        <Checkbox
          {...(getSpecMarkerProps(props) as any)}
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

      return (
        <Switch
          {...(getSpecMarkerProps(props) as any)}
          {...props}
          checked={checked}
          onChange={(e) => {
            setChecked(e.target.checked);

            emit?.("change");
          }}
        />
      );
    },
    Link: ({ props, children }) => (
      <a {...getSpecMarkerProps(props)} href={props.to}>
        {children}
      </a>
    ),
    Pagination: ({ props, bindings, emit }) => {
      const [page, setPage] = useBoundProp(props.page, bindings?.page);

      return (
        <input
          {...getSpecMarkerProps(props)}
          max={props.totalPages}
          min={1}
          type="number"
          value={page ?? 1}
          onChange={(event) => {
            setPage(Number(event.target.value));

            emit("change");
          }}
        />
      );
    },
    View: ({ props, children }) => {
      return (
      <View {...getSpecMarkerProps(props)}>{children}</View>
    )},
  },
  actions: {
    httpRequest: async (params, setState) => {
      if (params) {
        const { url, method, headers, body, statePath = "data" } = params;

        const response = await fetch(url, {
          method: method ?? "GET",
          headers: { ...headers, "Content-Type": "application/json" },
          body: body ? JSON.stringify(body) : undefined,
        });

        const data = await response.json();

        setState((prev) => {
          const next = {...prev};

          setByPath(next, statePath, data);

          return next;
        });
      }
    },
  },
});

// Fallback component for unknown types
export function Fallback({ type }: { type: string }) {
  return <div className="text-xs text-red-500">[{type}]</div>;
}
