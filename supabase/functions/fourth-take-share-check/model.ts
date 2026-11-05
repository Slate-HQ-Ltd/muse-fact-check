// Copyright © 2026 Slate HQ Ltd. All rights reserved and asserted.
// Muse Spark transport for Muse Fact Check.
// The caller supplies a Meta Model API key at runtime; this module never logs or returns it.
import type { ReviewedContracts } from "./contracts.ts";
export const MODEL = "muse-spark-1.3";
export type ModelCall = { model: string; ms: number };
export interface Model {
  ready: boolean;
  calls: ModelCall[];
  run(input: unknown, signal: AbortSignal): Promise<unknown>;
}
export function createMuseModel(options: { key?: string; contracts: ReviewedContracts | null; fetcher?: typeof fetch }): Model {
  const calls: ModelCall[] = [], send = options.fetcher ?? fetch;
  return {
    ready: !!options.key && options.contracts?.reviewed === true, calls,
    async run(input, signal) {
      if (!options.key || !options.contracts?.reviewed) throw Error("model_unconfigured");
      const contract = options.contracts.check;
      const start = performance.now();
      const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 25_000);
      const abort = () => controller.abort(); signal.addEventListener("abort", abort, { once: true });
      if (signal.aborted) controller.abort();
      try {
        const response = await send("https://api.meta.ai/v1/chat/completions", {
          method: "POST", redirect: "error", signal: controller.signal,
          headers: { Authorization: `Bearer ${options.key}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: MODEL, messages: [
            { role: "developer", content: contract.prompt },
            { role: "user", content: JSON.stringify(input) },
          ], response_format: { type: "json_schema", json_schema: { name: contract.name, strict: true, schema: contract.schema } } }),
        });
        if (!response.ok) { await response.body?.cancel(); throw Error("model_unavailable"); }
        const reader = response.body?.getReader(); if (!reader) throw Error("model_response_invalid");
        let bytes = 0, raw = ""; const decoder = new TextDecoder();
        try { for (;;) {
          const { done, value } = await reader.read(); if (done) break;
          bytes += value.byteLength; if (bytes > 512_000) throw Error("model_response_too_large");
          raw += decoder.decode(value, { stream: true });
        } } finally { await reader.cancel().catch(() => {}); }
        const output = JSON.parse(raw + decoder.decode());
        const choice = output?.choices?.[0];
        if (choice?.finish_reason !== "stop" || choice.message?.refusal || typeof choice.message?.content !== "string")
          throw Error("model_response_invalid");
        const parsed = JSON.parse(choice.message.content);
        calls.push({ model: MODEL, ms: Math.round(performance.now() - start) });
        return parsed;
      } finally { clearTimeout(timeout); signal.removeEventListener("abort", abort); }
    },
  };
}
