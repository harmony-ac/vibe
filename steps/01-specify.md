# Step 1: Specify

## Goal
Produce a precise, user-reviewed requirements document and resolve critical anomalies before implementation.

## Process

### 1.1 Determine workflow context
Read `workflows/` to know where requirements come from.

### 1.2 Name the feature
Pick a kebab-case feature name (e.g. `oauth-login`, `checkout-payment`).
Create the folder: `harmony/features/<feature-name>/`.

### 1.3 Write requirements
Write `harmony/features/<feature-name>/requirements.md`.

Rules:
- Written from the end-user's perspective.
- No low-level implementation details unless explicitly requested.
- Use precise, unambiguous language.
- If you need to infer, state assumptions clearly.

### 1.4 Analyze
Run:
```bash
node <skill-path>/cli/cli.js analyze \
  --file harmony/features/<feature-name>/requirements.md \
  --out harmony/features/<feature-name>/analysis.json \
  --feature-id <feature-name>
```

Read `analysis.json`. If anomalies array is empty, skip to Step 2.

### 1.5 Present anomalies to user
Format each anomaly as an **interactive multiple-choice question**.

Example:
```
Anomaly: "What should happen when an unconfirmed user tries to log in?"

A) Reject login with "Please confirm your email first"
B) Allow login but restrict access to unconfirmed areas
C) Resend confirmation email and show message
D) Other: ___________
E) Not important
```

Always include:
- The anomaly description
- The "suggested_fixes" from analysis as options
- An "Other" option (free text)
- A "Not important" option

### 1.6 Update requirements
Incorporate the user's answers into `requirements.md`.

For MVP: **do not re-run analysis**. Trust the one-turn refinement.

## Output
- `harmony/features/<feature-name>/requirements.md` (updated)
- `harmony/features/<feature-name>/analysis.json`
