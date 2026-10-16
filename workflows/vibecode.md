# Workflow: Vibecode

## When to use
The user is coding live in conversation without an external ticket or prior specification. This is the default workflow.

## Source of requirements
Derive requirements directly from the user's request in the current conversation.

## Process

1. Infer the intent from the user's message(s).
2. If the request is vague or high-level, draft requirements that capture the obvious user-facing behavior.
3. State any assumptions you make explicitly in the requirements.
4. Proceed to Step 1 (Specify).

## Conventions (autopilot vs blocking)
For MVP, **all** anomalies are blocking. Ask the user.

In future versions, the following may become autopilot (agent decides without asking):
- String fields default to empty string, not null.
- Missing error messages default to generic HTTP status messages.
- IDs are UUIDs unless specified otherwise.
- Timestamps use ISO-8601 UTC.

## Speed
Move fast. Keep requirement text concise. Do not write a novel.
