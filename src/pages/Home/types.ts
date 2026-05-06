import type { Spec } from "@json-render/core";

export interface Version {
  id: string;
  prompt: string;
  raw: string[];
  spec: Spec | null;
  status: "pending" | "complete" | "error";
  usage: {
    prompt: number;
    completion: number;
    total: number;
  } | null;
}
