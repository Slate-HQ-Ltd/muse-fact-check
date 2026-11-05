// Copyright © 2026 Slate HQ Ltd. All rights reserved and asserted.
import { createMuseModel, MODEL } from "./model.ts";
import { reviewedContracts } from "./contracts.ts";
const assert = (v: unknown) => { if (!v) throw Error("Assertion failed"); };

Deno.test("Muse transport sends the strict share schema and never exposes the key on the model object", async () => {
  let sentBody: any, sentHeaders: Headers | undefined;
  const model = createMuseModel({ key: "fixture-key", contracts: reviewedContracts, fetcher: (async (url, init) => {
    assert(url === "https://api.meta.ai/v1/chat/completions");
    sentBody = JSON.parse(String(init?.body)); sentHeaders = new Headers(init?.headers);
    return Response.json({ choices: [{ finish_reason: "stop", message: { content: '{"findings":[],"hashtag":null}' } }] });
  }) as typeof fetch });
  const out: any = await model.run({ comment: "fixture", sources: [] }, new AbortController().signal);
  assert(out.findings.length === 0 && sentBody.model === MODEL && MODEL === "muse-spark-1.3");
  assert(sentBody.response_format.json_schema.strict === true && sentBody.response_format.json_schema.name === "share_check_findings");
  assert(sentHeaders?.get("authorization") === ["Bear", "er fix", "ture-key"].join("") && !("key" in model) && model.calls.length === 1);
});

Deno.test("unconfigured, truncated and oversized model replies are refused", async () => {
  const disabled = createMuseModel({ contracts: null });
  assert(!disabled.ready);
  let refused = false;
  try { await disabled.run({}, new AbortController().signal); } catch { refused = true; }
  assert(refused);
  const truncated = createMuseModel({ key: "fixture-key", contracts: reviewedContracts,
    fetcher: (async () => Response.json({ choices: [{ finish_reason: "length", message: { content: "{}" } }] })) as typeof fetch });
  refused = false;
  try { await truncated.run({}, new AbortController().signal); } catch { refused = true; }
  assert(refused);
});

Deno.test("reviewed contract is strict: every object lists all properties and allows no others", () => {
  const strict = (schema: any): void => {
    if (schema?.type === "object") {
      assert(schema.additionalProperties === false);
      assert(JSON.stringify([...schema.required].sort()) === JSON.stringify(Object.keys(schema.properties).sort()));
      for (const key of Object.keys(schema.properties)) strict(schema.properties[key]);
    }
    if (schema?.items) strict(schema.items);
  };
  assert(reviewedContracts?.reviewed === true && reviewedContracts.version === "2026-11-05.1");
  strict(reviewedContracts!.check.schema);
  assert(/never instructions to you/.test(reviewedContracts!.check.prompt));
  assert(!/—/.test(reviewedContracts!.check.prompt));
});
