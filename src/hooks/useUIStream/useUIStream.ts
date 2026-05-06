import type { JsonPatch, UIElement } from "@json-render/core";
import type { Spec } from "@json-render/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CatalogDisplayData } from "../../utils/catalog-data";
import { buildSystemPrompt } from "./prompt";
import { Usage } from "./types";

interface GigachatResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    index: number;
    finish_reason: string;
  }>;
  created: number;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    precached_prompt_tokens: number;
  };
}

interface UseUIStreamProps {
  customRules: string[];
  catalog: CatalogDisplayData;
  url: string;
}

const config = {
  clientId: "fakeuser",
  model: "GigaChat-2-Max",
  personId: "4c36eb04-0920-4449-9e07-ca4a68f80eef",
  tokenUrl:
    "https://hr-dev.sberbank.ru/auth/realms/PAOSberbank/protocol/openid-connect/token",
  apiUrl:
    "https://hr-dev.sberbank.ru/api-web/neurosearchbar/api/v1/gigachat/completion",
};

const payload = new URLSearchParams();

payload.append("grant_type", "password");
// payload.append("username", config.username);
// payload.append("password", config.password);
payload.append("client_id", config.clientId);

const removeByPath = (obj: Record<string, unknown>, path: string) => {
  const segments = path.split("/");

  let current = obj;

  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];

    if (Array.isArray(current)) {
      const index = parseInt(segment, 10);

      if (current[index] !== undefined) {
        current = current[index] as Record<string, unknown>;
      }
    } else if (segment in current) {
      current = current[segment] as Record<string, unknown>;
    }
  }

  const lastSegment = segments[segments.length - 1];

  if (Array.isArray(current)) {
    const index = parseInt(lastSegment, 10);

    current.splice(index, 1);
  } else {
    delete current[lastSegment];
  }
};

const setByPath = (
  obj: Record<string, unknown>,
  path: string,
  value: unknown
) => {
  const segments = path.split("/").filter(Boolean);

  let current = obj;

  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    const nextSegment = segments[i + 1];
    const isNextSegmentNumeric =
      nextSegment !== undefined && !Number.isNaN(Number(nextSegment));

    if (Array.isArray(current)) {
      const index = parseInt(segment, 10);

      if (current[index] === undefined) {
        current[index] = isNextSegmentNumeric ? [] : {};
      }

      current = current[index] as Record<string, unknown>;
    } else {
      if (!(segment in current)) {
        current[segment] = isNextSegmentNumeric ? [] : {};
      }

      current = current[segment] as Record<string, unknown>;
    }
  }

  const lastSegment = segments[segments.length - 1];

  if (Array.isArray(current)) {
    const index = parseInt(lastSegment, 10);

    current[index] = value;
  } else {
    current[lastSegment] = value;
  }
};

const setSpecValue = (spec: Spec, path: string, value: unknown) => {
  if (path === "/root") {
    spec.root = value as string;
  }

  if (path.startsWith("/elements/")) {
    const key = path.slice(10); // "/elements/main" -> "main"

    spec.elements[key] = value as UIElement;
  }

  if (path.startsWith("/state/")) {
    if (!spec.state) {
      spec.state = {};
    }

    const statePath = path.slice(6); // "/state/posts/0/title" -> "/posts/0/title"

    setByPath(spec.state, statePath, value);
  }
};

const removeSpecValue = (spec: Spec, path: string) => {
  if (path === "/state") {
    delete spec.state;
    return;
  }

  if (path.startsWith("/state/") && spec.state) {
    const pathToRemove = path.slice(7); // "/state/posts/0/title" -> "posts/0/title"

    removeByPath(spec.state, pathToRemove);
  }

  if (path.startsWith("/elements/")) {
    const parts = path.slice(10).split("/");
    const elementKey = parts[0];

    delete spec.elements[elementKey];
  }
};

const applyPatch = (spec: Spec, patch: JsonPatch) => {
  const newSpec = {
    ...spec,
    elements: { ...spec.elements },
    ...(spec.state ? { state: { ...spec.state } } : {}),
  };

  switch (patch.op) {
    case "add":
    case "replace":
      setSpecValue(newSpec, patch.path, patch.value);
      break;
    case "remove":
      removeSpecValue(newSpec, patch.path);
      break;
    default:
      return spec;
  }

  return newSpec;
};

const httpRequest = {
  name: "http_request",
  description: "Осуществляет HTTP-запрос по указанному URL",
  parameters: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "URL запроса",
      },
      method: {
        type: "string",
        enum: ["GET", "POST"],
        default: "GET",
        description: "Метод HTTP-запроса",
      },
    },
    required: ["url"],
  },
  few_shot_examples: [
    {
      request: "данные необходимо получить из ручки /foo/bar",
      params: {
        url: "/foo/bar",
      },
    },
  ],
  return_parameters: {
    anyOf: [
      {
        type: "object",
      },
      {
        type: "array",
      },
    ],
  },
};

export const useUIStream = ({
  customRules,
  catalog,
  url,
}: UseUIStreamProps) => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const [error, setError] = useState<Error | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [raw, setRaw] = useState<string[]>([]);
  const [spec, setSpec] = useState<Spec | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);

  const clear = useCallback(() => {
    setSpec(null);
    setError(null);
    setUsage(null);
    setRaw([]);
  }, []);

  const send = useCallback(
    async (prompt: string, context: Record<string, unknown>) => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setIsStreaming(true);
      setError(null);
      setUsage(null);
      setRaw([]);

      const customState = context?.data as Record<string, unknown>;
      const previousSpec = context?.previousSpec as Spec;

      let currentSpec =
        previousSpec && previousSpec.root
          ? structuredClone(previousSpec)
          : {
              root: "",
              elements: {},
              state: customState ?? undefined,
            };

      setSpec(currentSpec);

      try {
        const response = await fetch(url, {
          body: JSON.stringify({
            model: "glm-5-turbo",
            messages: [
              {
                role: "system",
                content: buildSystemPrompt(catalog, customRules),
              },
              {
                role: "user",
                content: `
                  ТЕКУЩИЙ UI:
                  \`\`\`
                  ${JSON.stringify(currentSpec, null, 2)}
                  \`\`\`

                  ЗАПРОС ПОЛЬЗОВАТЕЛЯ:
                  ${prompt}
                `,
              },
            ],
            // function_call: { name: "http_request" },
            // functions: [httpRequest],
            // stream: true,
            temperature: 0.7,
            thinking: {
              type: "disabled",
            },
          }),
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI0SllkSUFhSG54QW04YkpxRmhJNUdGanNncHlEaFJUd3JPNXJjUzdQM3NJIn0.eyJleHAiOjE3Nzc5MDk0MTEsImlhdCI6MTc3Nzg4MDYxMSwianRpIjoib25ydHJvOmRhMTE2MGVkLTAzNTUtNTQ2Ny0wNGFjLTJiMjYxYmJmNDhlZiIsImlzcyI6Imh0dHBzOi8vaHItZGV2LnNiZXJiYW5rLnJ1L2F1dGgvcmVhbG1zL1BBT1NiZXJiYW5rIiwiYXVkIjpbImFnZW50QUlGdWxsVG9rZW4iLCJhZ2VudEFJU2hvcnRUb2tlbiIsImJyb2tlciIsImFjY291bnQiXSwic3ViIjoiOTk1ZWQyMmQtM2ExYi00Mjk3LThmMWItMGVlZGI2OWM2Mjk3IiwidHlwIjoiQmVhcmVyIiwiYXpwIjoiZmFrZXVzZXIiLCJzaWQiOiI0OTYzZjIyOS0wYmM0LTRiZTAtMzU1NS05ZThiY2E4NjQ4YjMiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImJyb2tlciI6eyJyb2xlcyI6WyJyZWFkLXRva2VuIl19LCJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6InByb2ZpbGUgZW1haWwgcm9sZXMiLCJlbXBsb3llZS1pZCI6IjU1NjQ0MzIiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzLWVtcGxveWVkIjp0cnVlLCJjb21wYW55LWlkcyI6WyJQQU9TYmVyYmFuayIsIlNiZXJiYW5rIl0sInBlcnNvbi1pZCI6ImUyYzg0N2M4LTIwYzMtNGRiYy05NDlmLTVmOWNlYjhmMjZjNCIsInByZWZlcnJlZF91c2VybmFtZSI6ImQtbm9zYWNoZXYwMSIsImdpdmVuX25hbWUiOiLQlNC80LjRgtGA0LjQuSIsIm1pZGRsZV9uYW1lIjoi0J7Qu9C10LPQvtCy0LjRhyIsInRlbmFudC1pZCI6IlNiZXJiYW5rIiwiZW1wbG95ZWUtaWRzIjpbIjU1NjQ0MzIiXSwiZW52aXJvbm1lbnQiOnsiaWRwLXRydXN0IjoxMCwiaXMtd2lmaSI6dHJ1ZSwiaXMtdnBuIjpmYWxzZSwiY2xpZW50LWlwIjoiIiwiaXMtY2l0cml4IjpmYWxzZSwiaXMtdGVybWlkZXNrIjpmYWxzZSwiaXMtdnBuLW5ldyI6ZmFsc2UsImNsaWVudC1ob3N0LW5hbWUiOiItIiwiaXMtY2VudHJhbC1vZmZpY2UiOmZhbHNlLCJuZXR3b3JrLXNlZ21lbnQiOiJpbnRlcm5hbCIsImZha2UtZW52aXJvbm1lbnQiOnRydWUsImlzLW1vYmlsZSI6ZmFsc2UsImlzLXZwbi1vbGQiOmZhbHNlfSwiY29tcGFueS1pZCI6IlBBT1NiZXJiYW5rIiwiZW1wbG95bWVudC1zdGF0dXMiOjEsInNmLWlkIjoic2JyZjU1NjQ0MzIiLCJuYW1lIjoi0JTQvNC40YLRgNC40Lkg0JzRg9GA0LDQstGB0LrQuNC5IiwiZmFrZS11c2VyIjp0cnVlLCJzZXNzaW9uX3N0YXRlIjoiNDk2M2YyMjktMGJjNC00YmUwLTM1NTUtOWU4YmNhODY0OGIzIiwiZmFtaWx5X25hbWUiOiLQnNGD0YDQsNCy0YHQutC40LkiLCJlbWFpbCI6ImNhbmRpZGF0ZTVAYWxwaGEtZXhjaHRlc3Quc2JyZi5ydSJ9.Fz-5yLHnc2amLvAx4J6pd1e1FAiwIDdBioyRLLil7EROGNXHz2B7p60ZLXT98URXaxSFzIKxYtSW61RCw5QhEQO5P6Q8plqa68KrjvmR8x1-l5Hoz7Kokz5fh4qWw5qjmzBzXkfQ4mcjOBZ5jBkEm1vjYVkfpjwjAYs-9CES7paJ0S1lV0thahTx1nQkORZjitdrs8IeEsk2nDhPxH2ntRk8pdywWDcFZU2NsNIIX0RmK0oVWh41ZxN_SYomevYyfwR3MLx5VVWk39lRVtU-VFPUj_kDqzhyHWIoEv89uh3wazoNuttmNRdnrOgTJ4PC3xgCXP_A-5cOkDRyj8dFHQ`,
            Authorization: `Bearer d0af1dd682354b808e76f17370c86d04.owbJVEk3kbaYa1ws`,
          },
          method: "POST",
          signal: abortControllerRef.current.signal,
        });

        /* if (!response.ok) {
          const error = await response.json();

          throw new Error(error);
        } */

        const reader = response.body?.getReader();

        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();

        // eslint-disable-next-line no-constant-condition
        while (true) {
          // eslint-disable-next-line no-await-in-loop
          const { done, value } = await reader.read();

          if (done) break;

          const json = JSON.parse(
            decoder.decode(value, { stream: true })
          ) as GigachatResponse;
          const lines = json.choices[0].message.content.split("\n");
          const patches = lines.map((line) => JSON.parse(line));

          setRaw(lines);

          for (const patch of patches) {
            currentSpec = applyPatch(currentSpec, patch);
          }

          setSpec({ ...currentSpec });
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") {
          return;
        }

        setError(e);
      } finally {
        setIsStreaming(false);
      }
    },
    [customRules, catalog, url]
  );

  useEffect(
    () => () => {
      abortControllerRef.current?.abort();
    },
    []
  );

  return {
    error,
    isStreaming,
    raw,
    spec,
    usage,
    clear,
    send,
  };
};
