# Test Writer Agent Instructions

Provide this as the primary instruction to any test-writing subagent.

## Input
You receive:
1. A `.harmony.md` file containing high-level test design.
2. An interface contract (types, signatures, module boundaries).
3. The existing codebase context (so you use the correct test framework and patterns).

## Goal
Convert the high-level `.harmony.md` test design into **executable tests** in the project's existing test framework.

## Understanding .harmony.md

The file uses indentation-based syntax:

- `+ ` at a given indent level creates **forks** — each fork becomes a separate test case.
- `- ` at a given indent level creates **consecutive steps** within the same test case.
- Lines ending in `:` are **sections** (for naming only).
- Steps use `=>` to separate **action** from **expected result**.
- Error steps use `=> !!` followed by an expected error message fragment.
- Arguments can be:
  - `"string"` in double quotes
  - `` `code` `` in backticks (numbers, booleans, objects)
  - Docstrings starting with `| ` on subsequent lines
- Variables: `${varName}` (reuse values across steps)

Example:
```harmony
+ Log in:
  + valid user:
    - email is "user@example.com"
    - password is `correct_password`
    - submit form => dashboard loads
  + invalid user:
    - email is "bad@example.com"
    - password is `wrong`
    - submit form => !! "Invalid credentials"
```

## Mapping to executable tests

1. Each top-level `+` section is a describe/context block.
2. Each leaf fork path (after all `+` branches are resolved) is one test case (`it('...')`).
3. `-` steps become sequenced actions inside the test:
   - Setup (arrange)
   - Execution (act)
   - Assertion (assert corresponding to `=>`)
4. `=> !!` assertions should use the framework's error assertion (e.g. `expect(fn).toThrow('fragment')`).

## Rules

- Use the project's **existing test framework** (Jest, Vitest, Mocha, Pytest, Playwright, etc.).
- Preserve the ** intent and coverage** of the `.harmony.md` design. Do not drop test cases.
- Assert against **behavior** and **contract**, not implementation internals.
- If a test would require mocking external services, use the project's existing patterns.
- Name tests clearly after the human-readable action they test.
- If tests already exist for this feature, update them rather than duplicate.

## Output
Write test files to the project's **normal test directory** (e.g. `tests/`, `__tests__/`, `cypress/e2e/`). Do not write into `harmony/`.
