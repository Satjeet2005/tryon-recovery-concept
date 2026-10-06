# Try-On Recovery + Taste Loop — Independent Product Concept

![CI](https://github.com/Satjeet2005/tryon-recovery-concept/actions/workflows/ci.yml/badge.svg)

**Live demo:** https://tryon-recovery-concept.vercel.app/

An independent concept prototype (not affiliated with any company) exploring one question:
**when a virtual try-on fails, can a cause-specific recovery keep the user trying instead of leaving?**

## 60-second demo script
1. Upload any portrait photo and continue. Attempt 1 is *intentionally simulated to fail*.
2. See the failure card: it names the issue and the outfit being fitted, and offers actions that match the cause (e.g. brighter photo for low light, another outfit for a fit failure).
3. Recover, then use **Less like this / Show me another look**. The next outfit reflects your feedback (taste loop, stored in `sessionStorage`).
4. Open **Metrics Dashboard** to see the live funnel for your session.

## What is real vs simulated
- Real: UI flow, client-side photo checks (type, size, resolution, brightness, aspect ratio), request cancellation/timeout/stale-response protection, taste state, event tracking, funnel calculation.
- Simulated: the try-on "AI" (`/api/generate` is a deterministic mock) and failure causes, which are derived from simple image heuristics. Live "recovery rate" is therefore not real-user data.
- The baseline table on the metrics page is illustrative, and hypotheses are targets to validate, not results.

## What I'd test first with real users
Cause-specific recovery vs. generic "Try again" on second-attempt rate, and whether taste feedback increases a second successful try-on.

## Run locally
```bash
npm ci
npm run dev      # http://localhost:3000
npm test         # unit + page-level regression tests
npm run lint && npm run build
```

## Known limitations
Mock backend only; no real image processing; session-scoped analytics; not tested on real devices yet.
