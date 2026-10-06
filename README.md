# Flickd — Try-On Recovery + Taste Loop Prototype

An independent product concept and interactive prototype demonstrating how AI virtual try-on failures can be converted into high-intent re-engagement pathways and personalized taste feedback loops.

---

## 🎯 Problem Statement

In AI-powered fashion virtual try-ons, initial avatar generation frequently fails due to suboptimal user photos (low lighting, incomplete framing, multiple people) or garment fitting constraints. In conventional consumer UX, these failures present a generic *"Something went wrong — Try Again"* dead end, causing heavy user drop-off.

---

## 💡 Product Hypothesis

> **Hypothesis:** Providing **cause-specific diagnosis and actionable recovery choices** (e.g., *"Upload a brighter photo"* or *"Try a different outfit"*) significantly increases 2nd-attempt re-engagement and successful try-on recovery compared to generic retries, while capturing valuable user input and taste intent signals.

---

## 🔄 End-to-End Prototype Flow

```
1. Upload photo  ──>  2. Client-side evaluation (Format/Size/Resolution & Brightness/Aspect Ratio Signals)
       │
3. Try-On Generation (Attempt #1)  ──>  4. Cause-Specific Failure Diagnosis (e.g., LOW_LIGHT / FULL_BODY_NOT_VISIBLE)
       │
5. Cause-Specific Recovery Action  ──>  6. Recovered Try-On Result (Attempt #2+)
       │
7. Taste Feedback Loop (More/Less/Save)  ──>  8. Next Personalized Recommendation & Metrics Audit
```

---

## 📊 Key Prototype Metrics

Every metric explicitly defines its calculation denominator:

- **First-Try Success Rate:** `successful 1st attempts / total session attempts`
- **Failed → Recovered Rate:** `failed attempts eventually recovered / total 1st-try failures`
- **Second-Try Engagement:** `sessions initiating 2nd attempt / total 1st-try failures`
- **Recovery Action Efficiency:** `successful recoveries per action type` (e.g. Upload Brighter vs Different Outfit)

---

## 🔒 Privacy & Architecture Guarantees

- **Browser-Only Photo Processing:** User photos stay 100% inside the client browser. No raw images are uploaded to external cloud servers or third-party AI models.
- **Client-Side Advisory Signals:** HTML Canvas relative luminance sampling provides immediate brightness feedback without heavy computer vision dependencies.
- **Deterministic Demo Execution:** Intentional 1st-attempt failure simulation ensures consistent, reproducible demo walkthroughs.

---

## 🛠️ Developer & Demo Controls

Click **"⚙️ Dev Controls"** in the top navigation header to open the live simulation panel:
- **Force Outcome Modes:** `Auto`, `Force Success`, `LOW_LIGHT`, `FULL_BODY_NOT_VISIBLE`, `MULTIPLE_PEOPLE`, `OUTFIT_FIT_FAILURE`, `NETWORK_ERROR`, `TIMEOUT`.
- **Latency Controls:** Fast (800ms), Normal (3.5s), Slow (7s).

---

## ⚠️ Important Prototype Limitations

1. **Mocked AI Generation:** Uses deterministic counter-based garment rendering for demonstration purposes.
2. **Local Session Scope:** State is preserved via `sessionStorage`. No persistent database or authentication is attached.
3. **Illustrative Baseline Metrics:** Seeded dataset numbers represent baseline targets for hypothesis design.

---

## 🧪 What I Would Test First in Production

1. **A/B Test Variant:** Compare 1st-try failure drop-off between control group (Generic *"Try Again"*) vs variant group (Cause-Specific Recovery options).
2. **Intent Capture Rate:** Measure how many users who decline an outfit specify a taste preference signal versus bouncing.

---

## 🚀 Local Development & Testing

```bash
# Install dependencies
npm install

# Run Vitest unit & integration test suite
npm run test

# Run ESLint check
npm run lint

# Run Next.js local development server
npm run dev

# Production build test
npm run build
```

