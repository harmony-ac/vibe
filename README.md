# Harmony Vibe

A verification layer for agentic coding, built on years of test design research. It makes sure your agent builds the right thing, and builds it right:

- asks you the open questions in the requirements before coding anything
- builds test cases with far better defect coverage than agents produce on their own.

This skill connects to the Harmony API, which is a paid service.

## What it does

Harmony Vibe sits inside your agent and runs two checks on every feature:

1. **Specify** — Captures what you asked for, analyzes it for ambiguities, and asks you the critical questions that prevent bugs later.
2. **Verify the build** — Generates high-level acceptance tests, has a blind implementor write the code, and another blind agent write the tests — in parallel. Then runs the tests and fixes any failures.

All test designs and requirements are stored as human-readable Markdown files in your repo, committed alongside your code.

## Workflow Compatibility

Harmony Vibe adapts to how you already work. Here is what we support today and what is coming.

| Workflow                                        | Status              | How it works                                                                                                                      |
| ----------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Vibecoding / chat-driven**                    | **Supported (MVP)** | You ask for a feature in the chat. The agent infers requirements, asks one critical clarifying question, and verifies the result. |
| **Ticket-driven (Jira, Linear, GitHub Issues)** | **On the roadmap**  | Agent pulls the spec from a linked ticket, skips rewriting, and asks only about ambiguities the ticket does not cover.            |
| **API-first / OpenAPI**                         | **On the roadmap**  | Derive requirements from OpenAPI schema changes, then verify endpoint behavior.                                                   |
| **PR description driven**                       | **On the roadmap**  | Use the PR description as the source of truth for the feature spec.                                                               |
| **Figma / design comments**                     | **Future**          | Extract requirements from design file comments or annotations.                                                                    |
| **Notion / Confluence docs**                    | **Future**          | Pull spec from a living product document.                                                                                         |

## Install

```bash
npx skills add harmony-ac/vibe
```

Then add it to your agent's skill list. The skill handles the rest — auth, CLI setup, and workflow injection.

## Quick start

The first time you invoke it, the agent will ask you to authenticate at Harmony.

## How it works

### Step 1: Specify

You say: _"Add OAuth login with Google and GitHub."_

The agent:

1. Writes `harmony/features/oauth-login/requirements.md` in plain English.
2. Sends it to the Harmony server for analysis.
3. Returns one focused question, e.g.:
   > _"What happens when a user logs in with GitHub but the email already exists via Google?"_
   >
   > A) Merge the accounts automatically  
   > B) Show an error and ask the user to link manually  
   > C) Create a separate account  
   > D) Other / Not important

You click **B**. The agent updates the requirements. No re-analysis — we move fast.

### Step 2: Verify

The agent:

1. Generates `harmony/features/oauth-login/tests.harmony.md` — a forkable, human-readable test design.
2. Defines the interface contract (types, signatures, endpoints).
3. Fires three subagents in parallel:
   - **Implementor** — gets the requirements and contract. Forbidden from reading test files.
   - **Unit test writer** — gets the `.harmony.md` and contract. Writes to your normal `tests/` folder.
   - **API test writer** — same, writes to your integration test folder.
4. Waits for all three to finish.
5. Runs the tests. Fixes failures. Re-runs. Green.

The whole thing happens in one agent turn.

## Artifacts

Everything lives under `harmony/features/<feature-name>/`:

| File               | What                                                         |
| ------------------ | ------------------------------------------------------------ |
| `requirements.md`  | Human-readable requirements. Edited by you.                  |
| `analysis.json`    | Server anomaly analysis (temporary, replaced on re-analyze). |
| `tests.harmony.md` | High-level test design in Harmony format. Committed.         |

Test implementations live in your project's normal test directories (e.g. `tests/`, `__tests__/`, `cypress/e2e/`). We **do not** mirror your `src/` structure.

## The `.harmony.md` format

An indentation-based language for forkable test designs:

```harmony
+ Log in:
  - email is "user@example.com"
    + valid credentials:
      - password is `correct_password`
      - submit form => dashboard loads
    + invalid password:
      - password is `wrong`
      - submit form => !! "Invalid credentials"
```

- `+ ` creates **forks** (separate test cases)
- `- ` creates **consecutive steps** (setup → act → assert)
- `=>` separates action from expected result
- `=> !!` marks expected errors

The `harmonyc` npm package parses and flattens this format. Test-writer agents read it directly.

## CLI

The CLI lives in `cli/` and is invoked by the agent, not by you.

```bash
# Authenticate (one-time)
node cli/cli.js login

# Check status
node cli/cli.js status

# Analyze requirements
node cli/cli.js analyze \
  --file harmony/features/auth/requirements.md \
  --out analysis.json

# Generate test design
node cli/cli.js test-design \
  --file harmony/features/auth/requirements.md \
  --out tests.harmony.md
```

Environment variables:

- `HARMONY_API_URL` — override base URL (default: `https://cloud.harmony.ac`)

## Architecture

- **Transport**: Direct HTTP API calls. No MCP, no CLI binary distribution. The CLI is a Node script that lives inside the skill folder.
- **Auth**: Device-code OAuth2 flow. Token stored in `~/.harmony/token`.
- **Workflow-agnostic**: The core steps (`01-specify.md`, `02-verify.md`) are separate from workflow adapters (`workflows/vibecode.md`, etc.). You can add ticket-driven, API-first, or PR-driven workflows without touching the core.
- **Parallel by design**: Implementation and test writing happen simultaneously. The implementor is blind to the tests to prevent gaming.
- **Main agent runs tests**: The main agent has full context of requirements, contract, and failures. Subagents only write initial code.

## Project status

This is an MVP. Known limitations:

- One analysis turn only (no re-analysis loop yet).
- All anomalies are treated as blocking (no autopilot conventions yet).
- Subagent workspace isolation is instruction-based (not filesystem-enforced).
- Async optimization (fire analysis, continue thinking, come back later) is planned for v2.

## API

See [API.md](API.md) for the full REST API spec. Your server needs to implement:

- `POST /auth/device` — initiate device-code flow
- `POST /auth/token` — poll for access token
- `GET /health` — health check
- `POST /analyze` — requirement anomaly analysis
- `POST /test-design` — generate `.harmony.md` test design

## Contributing

### Adding a new workflow

1. Create `workflows/<name>.md`.
2. Answer three questions:
   - Where does the initial spec come from?
   - How much to infer vs. reuse?
   - Which anomalies are autopilot vs. blocking?
3. Wire it into `SKILL.md` if it should be selectable.

### Adding a new agent type

1. Create `agents/<role>.md`.
2. Provide the system prompt / instructions for that subagent.
3. Reference it from the relevant step in `steps/`.

## License

MIT
