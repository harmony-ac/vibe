---
name: harmony-vibe
description: >-
  The project's testing workflow, and the specification workflow. IMPORTANT: you MUST load this skill wheneve the user requests change in the software or tests (ALSO when refactoring. But NOT when just asking questions, and NOT when asking for changes only in the CI pipeline or helper scripts). You MUST load it BEFORE planning/thinking about implementation details. This describes the feature testing workflow you MUST follow when developing features or tests.
---

DO NOT just jump into coding, not even planning what to code. You MUST follow an exact workflow:

1. Decide whether this will be a change in the software's production behavior. If not, just ignore the rest of this skill file.
2. Write a requirement specification text into `harmony/features/<feature-name>/requirements.md`. No fluff, no bureaucratic headers, no acceptance criteria, no "In order to/As A/I want to", no scenarios, just plain sentences about how the software is expected to work.
3. Run `cli.js analyze` and save result, which contains a set of anomalies
4. Present anomalies to user as interactive multiple-choice questions (include "Other" and "Ignore").
5. Update `requirements.md` with clarifications.
6. Test implementations live in the project's normal test folders (e.g. `tests/`, `__tests__/`, `cypress/e2e/`, etc.) — **never** inside `harmony/`.
7. Run `cli.js test-design` and save to `harmony/features/<feature-name>/tests.harmony.md`.
8. Implement the app change and the tests in parallel.

- First, define the **interface contract** (types, signatures, module boundaries), the parts that both the tests and the implementation will need.
- Fire parallel subagents:
  - **Implementor** — receives requirements + interface contract. **Must not read test files.**
  - **Unit Test Writer** (if needed) — receives `.harmony.md` + interface contract. Writes to normal unit-test folders.
  - **API Test Writer** (if needed) — writes to normal integration-test/API test folder.
  - **E2E Test Writer** (if needed) — writes to normal E2E folder.
- Wait for all subagents.
- Run tests and fix failures (as the main agent).

## CLI Reference

The CLI is located at `<skill-path>/cli/cli.js`.

```bash
# Authenticate
node cli.js login

# Check health / token
node cli.js status

# Analyze requirements
node cli.js analyze --file harmony/features/auth/requirements.md --out analysis.json

# Generate test design
node cli.js test-design --file harmony/features/auth/requirements.md --out tests.harmony.md
```

Environment variables:

- `HARMONY_API_URL` — overrides base URL (default: `https://cloud.harmony.ac`)

## Notes

- The agent must **never** expose the auth token in conversation or tool arguments.
- The implementor subagent must be explicitly told: `DO NOT read files in test directories: <directory patterns...>.`
- All `harmony/` files should be committed alongside source code so they live with the project. They should to in one commit.
