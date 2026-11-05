# Muse Fact Check

A Fourth Take project for the Meta AI Developer Hackathon 2026, entered in the Startups track under the Push the Frontier theme.

Muse Fact Check helps a reader check the factual claims in their own share comment against a story’s cited sources using Meta’s Muse Spark. The reader can review the findings, edit their words, and then share the story to Facebook.

Demo video: link added on submission

## Project status

- Published and tested here: the Muse Spark findings contract, the Model API transport, and three focused tests. The tests use a stubbed fetch, so they make no call to Meta.
- Checked against Meta: a minimal Muse Wonder CLI request to the Meta Model API returned `READY`. That confirms API access only. It is not a fact-check run.
- Not yet evidenced: a live signed-in verdict from the reader journey. This repository makes no claim that one has been observed, and it makes no accuracy claim.

## What existed before the event and what was built during it

Before the hackathon, Fourth Take had published stories with cited sources, a web share editor with share card, and iPhone ShareStudio. Studio also had claim and source records with a separate automated claim workflow.

Built during the hackathon:

- The contract, transport and tests in this repository.
- The private reader check service that uses them.
- The private web and iOS check interfaces, where each finding shows as supported, conflicting with a cited source, or needing a source in this story.
- The private web Facebook handoff, which opens Meta’s Share Dialog for the story link and copies the reader’s comment for them to paste.
- Separately, the dedicated Claim Check function and panel for Studio. They are not part of this repository.

## Public repository contents

This repository holds only the Meta integration files. It is not a runnable application.

- `README.md`: this overview.
- `supabase/functions/fourth-take-share-check/contracts.ts`: the prompt and strict JSON schema for `share_check_findings`, contract version `2026-11-05.1`. It asks for at most 10 findings, each with a claim, a status of `supported`, `conflicting` or `needs_source`, an exact quote and a source URL, plus one optional hashtag suggestion.
- `supabase/functions/fourth-take-share-check/model.ts`: the Muse Spark transport.
- `supabase/functions/fourth-take-share-check/model.test.ts`: three tests. They check the request sent to Meta, the handling of the key, refusal when unconfigured or truncated, and that the schema is strict.

## Meta model and API

`model.ts` uses Muse Spark, model `muse-spark-1.3`, through the Meta Model API:

- It sends a `POST` to `https://api.meta.ai/v1/chat/completions` with a bearer key that the caller supplies at runtime. The module does not log or return the key.
- The `developer` message carries the contract prompt. The `user` message carries JSON holding the comment and the story’s sources.
- `response_format` is `json_schema` with `strict: true`, using the schema in `contracts.ts`.
- A request times out after 25 seconds and does not follow redirects. It rejects a reply over 512,000 bytes, a model refusal, and any reply whose `finish_reason` is not `stop`.

The prompt tells the model to use only the sources given and to treat the comment and sources as data, never as instructions. The final check on each finding happens in the private service, which refuses any quote that is not in a page that run read.

## Run the tests

With Deno installed, run this from the repository root:

```sh
deno test supabase/functions/fourth-take-share-check/model.test.ts
```

Result with Deno 2.9.7 on the published source: 3 passed, 0 failed. No key or network access is needed.

## What stays private

The web and iOS interfaces and the rest of the product source are private and are not published here. They are shown in the demo video.

## Live hackathon sprint

[Follow the Muse Fact Check sprint](https://github.com/Slate-HQ-Ltd/muse-fact-check/discussions/2) for an update on every public repository commit.

## Contributor

Mo Hoosen, Slate HQ Ltd. Fourth Take is a Slate HQ Ltd project.

Copyright © 2026 Slate HQ Ltd. All rights reserved and asserted. Mo Hoosen retains his moral rights and rights of authorship, which are expressly asserted.
