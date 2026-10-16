# Step 2: Verify

## Goal
Generate tests, implement in parallel with blind separation, then verify.

## Process

### 2.1 Generate test design
Run:
```bash
node <skill-path>/cli/cli.js test-design \
  --file harmony/features/<feature-name>/requirements.md \
  --out harmony/features/<feature-name>/tests.harmony.md \
  --feature-id <feature-name>
```

Read `tests.harmony.md`. Understand the fork and step structure.

### 2.2 Define interface contract
Before firing subagents, the main agent must define the **public interface** that both sides will use:

- Function / method signatures
- Type definitions / interfaces
- Module boundaries
- API endpoints (if applicable)
- Database schema changes (if applicable)

Write this contract into a temporary prompt section — it is not persisted to disk.

### 2.3 Fire parallel subagents

Launch all subagents simultaneously. Each receives:
- The `requirements.md` (implementor only)
- The `.harmony.md` test design (test writers only)
- The interface contract (all)
- Existing code context if applicable

#### Implementor
System prompt must include:
> "You are the implementor. You have access to requirements and the interface contract. **You must NOT read files in any test directory** (e.g. `tests/`, `__tests__/`, `cypress/`, `*.test.*`). Implement the feature according to the requirements and the interface contract. If the contract is unimplementable, STOP and report to the main agent. Do not change public signatures without approval."

Outputs: source code in the project's normal source folders.

#### Test Writers
One or more of:
- **Unit Test Writer** — writes to normal unit test folder
- **API Test Writer** — writes to normal integration/API test folder  
- **E2E Test Writer** — writes to normal E2E test folder

System prompt must include:
> "You are a test writer. You have access to the high-level `.harmony.md` test design and the interface contract. Convert the high-level steps into executable tests using the project's existing test framework. Preserve the test case structure from `.harmony.md`. Tests must verify behavior against the contract, not against implementation details."

See `agents/test-writer.md` for detailed instructions.

### 2.4 Wait for completion
Do not proceed until all subagents finish.

### 2.5 Run tests
The **main agent** runs the test suite:
```bash
<project test command, e.g. npm test>
```

Capture output. Determine failures.

### 2.6 Fix failures
The main agent fixes failures:
- If implementation bug → fix implementation
- If test bug → fix test (rare, note in commit message)
- If contract mismatch → update contract and both sides (main agent coordinates)

Loop: run tests again until green.

## Output
- `harmony/features/<feature-name>/tests.harmony.md`
- Updated source code
- Updated test code in project's normal test folders
