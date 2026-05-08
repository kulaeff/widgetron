import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react";
import { z } from "zod";

export const catalog = defineCatalog(schema, {
  components: {
    Avatar: {
      description: "Аватар",
      example: { name: "John Doe", size: "md" },
      group: "content",
      props: z.object({
        hasBadge: z
          .boolean()
          .default(false)
          .optional()
          .meta({ description: "Если true, то отображается бейдж" }),
        text: z.string().optional().meta({
          description: "Текст (инициалы), оторажаемые если url не задан",
        }),
        label: z.string().optional().meta({
          description:
            "Дополнительный лейбл в правом нижнем углу (например количество подчинённых или должность)",
        }),
        size: z
          .enum(["s", "m", "l", "xs", "xl", "xxl"])
          .default("l")
          .optional(),
        url: z.string().optional(),
      }),
    },
    Badge: {
      description:
        "Маленький кружок без контента (обычно используется как некий индикатор в правом верхнем углу)",
      example: { size: "l", style: "blue" },
      group: "content",
      props: z.object({
        size: z.enum(["m", "l"]).default("m").optional(),
        style: z.enum(["red", "blue"]).default("red").optional(),
      }),
    },
    Button: {
      group: "controls",
      props: z.object({
        disabled: z.boolean().default(false).optional(),
        fullWidth: z.boolean().default(false).optional(),
        isLoading: z.boolean().default(false).optional(),
        label: z.string(),
        size: z.enum(["s", "m", "l"]).default("m").optional(),
        type: z
          .enum(["primary", "secondary", "tertiary"])
          .default("primary")
          .optional(),
      }),
      events: ["press"],
      description: "Кнопка. Используй on.press для привязки действий.",
      example: { label: "Submit", variant: "secondary" },
    },
    Card: {
      description:
        "Контейнер для визуальной группировки элементов (например, задачи, посты, карточки товаров...)",
      example: { size: 5 },
      group: "layout",
      props: z.object({
        border: z.boolean().default(false).optional(),
        shadow: z.boolean().default(true).optional(),
        type: z.enum(["default", "contrast"]).default("default").optional(),
        variant: z.enum(["primary", "secondary"]).default("primary").optional(),
      }),
      slots: ["default"],
    },
    Chips: {
      description:
        "Компактный элемент, отображающий aтрибут, статус или действие.",
      events: ["press"],
      example: { label: "active", color: "green" },
      group: "content",
      props: z.object({
        type: z
          .enum(["default", "alert", "warnings"])
          .default("default")
          .optional(),
        label: z.string(),
        size: z.enum(["s", "m"]).default("s").optional(),
      }),
    },
    Stack: {
      group: "layout",
      description:
        "Флекс-контейнер, реализующий линейный макет (вертикальный или горизонтальный)",
      example: { align: "center", direction: "column", gap: 4 },
      props: z.object({
        align: z
          .enum(["start", "center", "end", "stretch"])
          .default("stretch")
          .optional(),
        direction: z.enum(["row", "column"]).default("column").optional(),
        gap: z
          .union([
            z.literal(0),
            z.literal(1),
            z.literal(2),
            z.literal(3),
            z.literal(4),
            z.literal(5),
            z.literal(6),
            z.literal(7),
            z.literal(8),
          ])
          .default(0)
          .optional(),
        justify: z
          .enum([
            "start",
            "center",
            "end",
            "stretch",
            "space-between",
            "space-around",
          ])
          .default("stretch")
          .optional(),
      }),
      slots: ["default"],
    },
    Grid: {
      description:
        "Грид-контейнер для расположения элементов по колонкам (1-6 колонок)",
      example: { columns: "* 2* auto", gap: 4 },
      group: "layout",
      props: z.object({
        align: z
          .enum(["start", "center", "end", "stretch"])
          .default("stretch")
          .optional(),
        columns: z.string().optional().meta({
          description:
            "Конфигурация колонок в виде строки, разделённой пробелами. Колонка может иметь размеры `n*` и `auto`, где * (эквивалентно 1*) - аналог 1fr (fractional unit).",
        }),
        gap: z
          .union([
            z.literal(0),
            z.literal(1),
            z.literal(2),
            z.literal(3),
            z.literal(4),
            z.literal(5),
            z.literal(6),
            z.literal(7),
            z.literal(8),
          ])
          .default(0)
          .optional(),
        justify: z
          .enum(["start", "center", "end", "stretch", "space-between", "space-around"])
          .default("stretch")
          .optional(),
      }),
      slots: ["default"],
    },
    Radio: {
      group: "controls",
      props: z.object({
        label: z.string().optional(),
        name: z.string().optional(),
        value: z.string().optional(),
      }),
      events: ["change"],
      description:
        "Радио-кнопка. Используй { $bindState } в свойстве checked для двусторонней привязки данных.",
    },
    Tag: {
      description:
        "Компактный элемент для вывода тегов, ключевых слов и так далее.",
      example: { label: "active", color: "green" },
      group: "content",
      props: z.object({
        color: z
          .enum([
            "blue",
            "cyan",
            "green",
            "grey",
            "lime",
            "magenta",
            "orange",
            "purple",
            "red",
            "teal",
            "white",
            "yellow",
          ])
          .default("yellow")
          .optional(),
        label: z.string(),
        size: z.enum(["s", "m"]).default("m").optional(),
      }),
    },
    Separator: {
      description: "Визуальный разделитель",
      group: "layout",
      props: z.object({
        orientation: z.enum(["horizontal", "vertical"]).optional(),
      }),
    },
    Table: {
      group: "content",
      props: z.object({
        columns: z.array(z.string()),
        rows: z.array(z.array(z.string())),
        caption: z.string().optional(),
      }),
      description:
        "Data table. Columns: header labels. Rows: 2D array of cell strings, e.g. [['Alice','admin'],['Bob','user']].",
      example: {
        columns: ["Name", "Role"],
        rows: [
          ["Alice", "Admin"],
          ["Bob", "User"],
        ],
      },
    },
    Title: {
      description: "Заголовок",
      example: { text: "Привет", size: "H4" },
      group: "content",
      props: z.object({
        size: z
          .enum(["H1", "H2", "H3", "H4", "subheadline", "footnote"])
          .optional(),
        text: z.string(),
      }),
    },
    Text: {
      group: "content",
      props: z.object({
        text: z.string(),
        variant: z
          .enum([
            "body1Regular",
            "body1Semibold",
            "body2Regular",
            "body2Semibold",
            "captionRegular",
            "captionSemibold",
            "extraBodyRegular",
            "smallTextRegular",
            "smallTextSemibold",
          ])
          .default("body1Regular")
          .optional(),
      }),
      description: "Текстовый блок",
      example: { text: "Hello, world!", variant: "body2Regular" },
    },
    Image: {
      group: "content",
      props: z.object({
        alt: z.string().optional(),
        height: z.number().default(64).optional(),
        src: z.string(),
        width: z.number().default(64).optional(),
      }),
      description: "Изображение",
    },
    Progress: {
      group: "content",
      props: z.object({
        value: z.number().optional(),
        // .default(0)
        label: z.string().optional(),
      }),
      description: "Progress bar (value 0-100)",
      example: { value: 65, label: "Upload progress" },
    },

    Skeleton: {
      group: "content",
      props: z.object({
        width: z.union([z.string(), z.number()]).optional(),
        height: z.union([z.string(), z.number()]).optional(),
      }),
      description: "Отображает заглушку контента пока данные грузятся",
    },

    Spinner: {
      group: "content",
      props: z.object({
        size: z.enum(["sm", "md", "lg"]).optional(),
        // .default("md")
      }),
      description: "Loading spinner indicator",
    },

    Rating: {
      group: "content",
      props: z.object({
        value: z.number().optional(),
      }),
      description: "Star rating display",
    },

    BarGraph: {
      group: "content",
      props: z.object({
        title: z.string().optional(),
        data: z.array(
          z.object({
            label: z.string(),
            value: z.number(),
          })
        ),
      }),
      description: "Vertical bar chart",
    },

    LineGraph: {
      group: "content",
      props: z.object({
        title: z.string().optional(),
        data: z.array(
          z.object({
            label: z.string(),
            value: z.number(),
          })
        ),
      }),
      description: "Line chart with points",
    },

    Input: {
      group: "controls",
      props: z.object({
        id: z.string().optional(),
        label: z.string().optional(),
        name: z.string().optional(),
        type: z.enum(["text", "email", "password", "number"]).optional(),
        // .default("text")
        placeholder: z.string().optional(),
        value: z.string().optional(),
        checks: z
          .array(
            z.object({
              type: z.string(),
              message: z.string(),
              args: z.record(z.string(), z.unknown()).optional(),
            })
          )
          .optional(),
      }),
      events: ["change", "focus", "blur"],
      description:
        "Text input field. Use { $bindState } on value for two-way binding. Use checks for validation (e.g. required, email, minLength).",
      example: {
        label: "Email",
        name: "email",
        type: "email",
        placeholder: "you@example.com",
      },
    },

    TextArea: {
      group: "controls",
      props: z.object({
        id: z.string().optional(),
        label: z.string().optional(),
        name: z.string().optional(),
        placeholder: z.string().optional(),
        rows: z.number().optional(),
        value: z.string().optional(),
        checks: z
          .array(
            z.object({
              type: z.string(),
              message: z.string(),
              args: z.record(z.string(), z.unknown()).optional(),
            })
          )
          .optional(),
      }),
      description:
        "Multi-line text input. Use { $bindState } on value for two-way binding. Use checks for validation (e.g. required, minLength).",
    },

    Select: {
      group: "controls",
      props: z.object({
        id: z.string().optional(),
        label: z.string().optional(),
        name: z.string().optional(),
        options: z.array(z.string()),
        placeholder: z.string().optional(),
        value: z.string().optional(),
        checks: z
          .array(
            z.object({
              type: z.string(),
              message: z.string(),
              args: z.record(z.string(), z.unknown()).optional(),
            })
          )
          .optional(),
      }),
      events: ["change"],
      description:
        "Dropdown select input. Use { $bindState } on value for two-way binding. Use checks for validation (e.g. required).",
    },

    Checkbox: {
      group: "controls",
      props: z.object({
        id: z.string().optional(),
        label: z.string(),
        name: z.string().optional(),
        checked: z.boolean().optional(),
      }),
      events: ["change"],
      description:
        "Checkbox input. Use { $bindState } on checked for two-way binding.",
    },

    Switch: {
      group: "controls",
      props: z.object({
        id: z.string().optional(),
        label: z.string(),
        name: z.string().optional(),
        checked: z.boolean().optional(),
      }),
      events: ["change"],
      description:
        "Toggle switch. Use { $bindState } on checked for two-way binding.",
    },

    Link: {
      group: "controls",
      props: z.object({
        to: z.string(),
      }),
      description: "Link",
      example: { to: "/about" },
      slots: ["default"],
    },

    Pagination: {
      group: "controls",
      props: z.object({
        totalPages: z.number(),
        page: z.number().optional(),
      }),
      events: ["change"],
      description:
        "Page navigation. Use { $bindState } on page for current page number.",
    },
  },

  actions: {
    buttonClick: {
      params: z.object({
        message: z.string().optional(),
      }),
      description: "Shows a toast with the message.",
    },
    formSubmit: {
      params: z.object({
        formName: z.string().optional(),
      }),
      description: "Shows a toast confirming form submission.",
    },
    linkClick: {
      params: z.object({
        href: z.string(),
      }),
      description: "Shows a toast with the link destination.",
    },
    httpRequest: {
      description: "Makes an HTTP request.",
      params: z.object({
        url: z.string(),
        method: z
          .enum(["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
          .optional(),
        headers: z.record(z.string(), z.string()).optional(),
        body: z.record(z.string(), z.unknown()).optional(),
        statePath: z.string().optional(),
      }),
    },
  },

  functions: {
    formatCurrency: {
      params: z.object({
        currency: z.string().optional(),
        value: z.number(),
      }),
      description: "Formats number to a currency string.",
    },
    formatDate: {
      params: z.object({
        value: z.date(),
        style: z
          .enum(["short", "medium", "long", "full"])
          // .default("short")
          .optional(),
      }),
      description: "Formats date to a string.",
    },
    formatList: {
      params: z.object({
        value: z.array(z.string()),
        style: z
          .enum(["short", "long", "narrow"])
          // .default("short")
          .optional(),
        type: z
          .enum(["conjunction", "disjunction", "unit"])
          // .default("conjunction")
          .optional(),
      }),
      description: "Formats array to a string.",
    },
    formatNumber: {
      params: z.object({
        value: z.number(),
      }),
      description: "Formats number to a string.",
    },
    formatPercent: {
      params: z.object({
        value: z.number(),
      }),
      description: "Formats number to a percent string.",
    },
    formatPlurals: {
      params: z.object({
        rules: z.object({
          zero: z.string().optional(),
          one: z.string(),
          two: z.string().optional(),
          few: z.string().optional(),
          many: z.string().optional(),
          other: z.string(),
        }),
        type: z
          .enum(["cardinal", "ordinal"])
          // .default("cardinal")
          .optional(),
        value: z.number(),
      }),
      description: "Formats number to a percent string.",
    },
    formatTime: {
      params: z.object({
        value: z.date(),
        style: z
          .enum(["short", "medium", "long", "full"])
          // .default("short")
          .optional(),
      }),
      description: "Formats time to a string.",
    },
    formatUnit: {
      params: z.object({
        unit: z.string().optional(),
        value: z.number(),
      }),
      description: "Formats number to a unit string.",
    },
  },
});
