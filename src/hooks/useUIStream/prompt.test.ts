import { describe, expect, it } from "vitest";
import { buildSystemPrompt } from "./prompt";

describe("buildSystemPrompt", () => {
  it("includes available catalog entities and custom editor rules", () => {
    const prompt = buildSystemPrompt(
      {
        components: [
          {
            name: "Button",
            group: "controls",
            description: "Clickable action",
            slots: [],
            events: ["press"],
            props: [
              { name: "label", type: "string" },
              { name: "disabled", type: "boolean", default: false },
            ],
          },
          {
            name: "Stack",
            group: "layout",
            description: "Linear layout",
            slots: ["default"],
            events: [],
            props: [{ name: "gap", type: "0 | 1 | 2", default: 0 }],
          },
        ],
        actions: [
          {
            name: "httpRequest",
            description: "Load data",
            params: [{ name: "url", type: "string" }],
          },
        ],
        functions: [
          {
            name: "formatCurrency",
            description: "Format money",
            params: [{ name: "value", type: "number" }],
          },
        ],
      },
      ["Use concise Russian labels."]
    );

    expect(prompt).toContain("Выводи JSONL");
    expect(prompt).toContain(
      "- Button: { label: string; disabled: boolean = false }"
    );
    expect(prompt).toContain("[события: press]");
    expect(prompt).toContain("[принимает children]");
    expect(prompt).toContain("gap: 0 | 1 | 2 = 0");
    expect(prompt).toContain("- httpRequest: { url: string } - Load data");
    expect(prompt).toContain(
      "- formatCurrency: { value: number } - Format money"
    );
    expect(prompt).toContain("Use concise Russian labels.");
  });
});
