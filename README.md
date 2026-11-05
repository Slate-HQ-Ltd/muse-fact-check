# Muse Fact Check

A Fourth Take project for the Meta AI Developer Hackathon 2026.

Muse Fact Check is being built to help a reader check factual claims in their own share comment against a story’s cited sources using Muse Spark. The reader can review the findings before sharing the story to Facebook.

## Project status

Development is in progress. The Muse Spark contract, Model API transport, and focused tests are now published here. A minimal Muse Wonder CLI request to the Meta Model API returned `READY`; the reader-comment feature is still being integrated.

## Public repository contents

The public `main` branch contains:

- `README.md`: project overview and progress links.
- `supabase/functions/fourth-take-share-check/contracts.ts`: the source-grounded findings contract.
- `supabase/functions/fourth-take-share-check/model.ts`: the Muse Spark Model API transport.
- `supabase/functions/fourth-take-share-check/model.test.ts`: focused transport and contract tests.

## Run the tests

With Deno installed, run:

```sh
deno test supabase/functions/fourth-take-share-check/model.test.ts
```

The three focused tests pass on the published source.

## Live hackathon sprint

[Follow the Muse Fact Check sprint](https://github.com/Slate-HQ-Ltd/muse-fact-check/discussions/2) for an update on every public repository commit.

## Hackathon contribution

Before the hackathon, Fourth Take had a web share editor and iPhone ShareStudio. Studio also had claim and source records with a separate automated claim workflow. The dedicated Claim Check function and panel were built during the hackathon.

This sprint is building a Muse Spark check for a reader’s share comment against a story’s cited sources, a source-grounded findings view, and a Facebook sharing handoff.

## Contributor

Mo Hoosen, Slate HQ Ltd. Fourth Take is a Slate HQ Ltd project.

Copyright © 2026 Slate HQ Ltd. All rights reserved and asserted. Mo Hoosen retains his moral rights and rights of authorship, which are expressly asserted.
