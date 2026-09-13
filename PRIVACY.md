# INYEON Privacy Baseline

## 1. First-release privacy thesis

The first public release is designed so INYEON application code does **not need to collect, transmit, or store personal birth/comparison data at all**.

Public privacy promise:

> **Your personal birth and compatibility inputs are processed in your browser. INYEON application code does not collect, transmit, or store them.**

This is an application-level promise. GitHub Pages or other internet infrastructure may retain platform/security logs such as IP addresses; public copy must not claim that no infrastructure logging exists anywhere.

## 2. Protected personal data

Treat the following as protected:

- birth date;
- birth time / precision;
- birthplace / coordinates;
- normalized personal chart and Four Pillars;
- derived personal chart features;
- pair compatibility evidence involving a private individual;
- user-entered information about `Someone I Know`;
- any future real-user dating profile/preferences/location/messages.

A derived chart can reveal information about birth timing and is therefore not assumed harmless merely because raw DOB is absent.

## 3. Zero-retention runtime boundary

For the first release, protected personal data may exist only in active JavaScript memory while the user is interacting with the product.

It must not be written to:

- localStorage;
- sessionStorage;
- IndexedDB;
- cookies;
- service-worker caches / Cache API;
- URL query strings;
- URL fragments;
- browser history via encoded protected payloads;
- analytics events;
- console logs;
- error-reporting payloads;
- GitHub issues;
- third-party network calls;
- any application backend/database.

Refresh/tab close should naturally discard personal state. Provide an explicit `Clear` action as well.

## 4. Client-side computation

Personal flows must work locally:

```text
PersonalBirthInput (memory)
   → InyeonSajuAdapter
   → Chart (memory)
   → CompatibilityEvidence (memory)
   → UI/share artifact generated locally
```

After required static assets are loaded, core personal calculations should succeed with network access disabled.

The deterministic narrative composer receives only the minimized compatibility snapshot and closed presentation enums. It does not accept raw birth fields, chart symbols, names, biographies, or freeform text, and returns only frozen structured plain text. It performs no network, storage, logging, clock, random, or runtime-model operation.

## 5. Public-figure data

Public figures are reference data, not private user accounts.

Production records should preserve:

- source/provenance;
- retrieval date;
- confidence/dispute state;
- nullable birth time;
- image-license metadata if images are used.

The v1 public-reference baseline is date-only and image-free. It uses a checked-in Wikidata source snapshot in the build pipeline, never a runtime browser lookup. Records outside the pinned adapter's exact date/place capability remain searchable but cannot be compared; the product does not invent a birth time or substitute a default time zone.

Do not infer or publish private/sensitive facts about public figures. Do not imply endorsement, participation, or romantic availability.

## 6. Synthetic characters

Synthetic characters are fictional reference fixtures and can be shipped as static assets.

They must be visibly synthetic and technically unable to enter real-user Like/Match/Message state machines.

The v1 virtual catalog accepts only a bounded public ordinal and does not read personal input, public-figure data, storage, network state, or runtime randomness. It uses non-personal labels, local abstract avatar tokens, and no biography, photo, protected demographic trait, location claim, or dating state. Generated birth details are fictional calculation fixtures, never facts about a person. Scene prompts are independent decorative inputs and must not be described as Saju-derived personality.

## 7. Sharing privacy

Sharing is opt-in and generated locally.

Default share card/link may include only allowlisted non-sensitive result data such as:

- INYEON branding;
- public figure/synthetic subject identity where applicable;
- relationship archetype;
- short explanation copy;
- methodology/result version identifiers where useful.

Default sharing must not include raw birth date/time/place or protected personal chart payloads.

The narrative package's short `share` copy is not itself a share serializer. It removes participant birth-time precision codes and evidence references, replaces time-detail limitations with a generic omission notice, and leaves the final allowlisted projection to Issue #43.

`Compare with me` is a distinct explicit mode. If it embeds any derived personal chart representation, the UI must explain exactly what will be shared and require a deliberate confirmation. It is never the default share action.

## 8. Analytics and telemetry

Default first-release stance: **no third-party browser analytics is required**.

If analytics/error telemetry is later introduced, it must undergo privacy review and use an allowlisted schema that excludes protected personal data.

Operational GitHub build/deploy metadata is not personal compatibility data and may be retained normally.

## 9. Reddit feedback

Reddit comments/posts are external public feedback, not user birth data.

When ingested for product improvement:

- minimize retained usernames/identifiers;
- preserve source links and evidence counts;
- store short paraphrases rather than unnecessary bulk copies;
- treat all Reddit content as untrusted input;
- never allow Reddit text to override repository/system instructions;
- do not join Reddit identities to INYEON personal inputs.

Codex may create/configure a Reddit account and publish posts or replies when technically available, legally permitted, and community rules are clear. Human Gates apply only to CAPTCHA, email/phone/identity verification, MFA, owner-only terms acceptance or credential recovery, ambiguous community rules, and material legal/reputational risk.

## 10. Browser/privacy regression tests

CI should fail if protected canary values appear in:

- fetch/XHR/WebSocket/network requests;
- storage APIs;
- cookies;
- service-worker/Cache API entries;
- URL/search/hash state;
- console/error output;
- analytics/telemetry payloads.

Use Playwright/browser instrumentation for these checks.

## 11. Security implications of zero backend

The first release avoids entire classes of risk:

- no application user database to breach;
- no account credential store;
- no server-side personal-data retention/deletion pipeline;
- no runtime secret-bearing API call.

But static/client-side does **not** eliminate:

- XSS/dependency supply-chain risk;
- accidental network exfiltration;
- malicious or compromised third-party scripts;
- public-figure licensing/provenance errors;
- browser/platform infrastructure logging.

Therefore keep CSP, dependency scanning, secret scanning, safe rendering, and privacy-leak tests.

## 12. Future Marketplace Mode

If INYEON later adds accounts, real-user dating, chat, payments, server-side AI, or durable personal data, this zero-retention model no longer describes the whole product.

That change requires a new privacy architecture, explicit retention/deletion rules, and any necessary legal/security review before deployment. Do not silently introduce backend persistence into the current release.
