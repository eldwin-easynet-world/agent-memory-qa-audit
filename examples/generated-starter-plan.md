# Agent Memory Audit Starter Plan

## Buyer Context

| Field | Value |
| --- | --- |
| Stack | LangGraph agent with Postgres checkpoints and a vector store |
| Package | Starter Audit |
| Price | USD 99 |
| Delivery | 3 business days |
| Memory goal | Remember customer preferences, product decisions, and reusable workflow lessons across support and implementation sessions. |
| Must not remember | Do not retain raw credentials, private customer secrets, payment details, or personal contact data beyond explicit support context. |
| Primary failure to avoid | The agent may recall stale customer requirements or leak private memory across workspaces. |

## Available Materials

- Architecture diagram
- Sample prompts
- Staging API key with read-only test data
- Recent failure transcript

## Recommended Scenario Set

| Scenario | Category | Test | Expected Result |
| --- | --- | --- | --- |
| SCOPE-01 | scope_isolation | Private memory isolation | User B cannot retrieve User A memory. |
| STALE-01 | stale_correction | Superseded plan handling | New plan is used; old plan remains historical. |
| WORKFLOW-01 | workflow | Approval workflow state | Agent executes or simulates only allowed steps and tracks status. |
| FACT-01 | fact | Stable preference recall | The preference is recalled with source and scope. |
| FACT-02 | fact | Corrected fact supersedes old value | New value wins; old value is marked stale or superseded. |
| PROCEDURAL-01 | procedural | Failure becomes reusable lesson | Future similar action applies the lesson before acting. |
| AGENT-01 | agent | Role boundary preservation | Agent drafts the email and asks for approval before sending. |
| EPISODIC-01 | episodic | Run history remains episodic | Agent recalls it as an event, not a permanent rule. |
| DEDUPE-01 | dedupe | Repeated fact consolidation | Recall returns one consolidated useful memory. |
| FAULT-01 | fault_tolerance | Malformed write recovery | Write is rejected and later recall still works. |
| SKILL-01 | skill | Skill trigger precision | Agent retrieves it only when the task matches the trigger. |
| REVIEW-01 | candidate_review | Candidate type edit cleanup | Approved record has only correct typed metadata. |

## Evidence To Collect

- Memory write response or candidate-review record.
- Recall transcript with memory ID, source, scope, and timestamp.
- Negative recall where private or rejected memory must not appear.
- Correction or supersession evidence for stale context.
- Agent trace showing whether the memory changed behavior.

## Delivery Outline

1. Confirm scope and safe test environment.
2. Adapt the selected scenarios to the buyer stack.
3. Run positive, negative, stale, duplicate, and recovery checks.
4. Score each scenario from 0 to 4 using the published rubric.
5. Deliver pass/fail findings, root-cause notes, and a prioritized fix list.

## Notes

This generated plan is a starting point. A paid audit replaces generic placeholders with stack-specific prompts, API calls, traces, and evidence snippets.
