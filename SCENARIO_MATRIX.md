# Agent Memory Evaluation Scenario Matrix

This matrix previews the live evaluation used in the AI Agent Memory QA Audit. It is stack-agnostic and can be adapted to LangGraph, LangChain, LlamaIndex, n8n, custom agent runtimes, or hosted memory services.

## Memory Model

```mermaid
flowchart TD
    A["Agent event or user input"] --> B{"Memory candidate?"}
    B -- "No" --> C["Do not write memory"]
    B -- "Yes" --> D{"Risk or uncertainty?"}
    D -- "Yes" --> E["Stage for review"]
    D -- "No" --> F["Write durable memory"]
    E --> G{"Approved?"}
    G -- "Yes" --> F
    G -- "No" --> H["Reject with reason"]
    F --> I["Recall with scope and provenance"]
    I --> J{"Stale, duplicate, or conflicting?"}
    J -- "Yes" --> K["Correct, supersede, or dedupe"]
    J -- "No" --> L["Use in agent workflow"]
```

## Scenario Categories

| ID | Category | Goal |
| --- | --- | --- |
| FACT | Fact memory | Store stable facts with source, scope, and correction behavior. |
| EPISODIC | Episodic memory | Preserve time-bound run history without flattening it into permanent facts. |
| PROCEDURAL | Procedural memory | Learn reusable rules and workflows from outcomes. |
| SKILL | Skill memory | Represent reusable capabilities as structured assets. |
| AGENT | Agent memory | Store roles, responsibilities, and operating boundaries. |
| WORKFLOW | Workflow memory | Store multi-step flows with gates, status, and retry policy. |
| DEDUPE | Deduplication | Avoid noisy recall when the same memory arrives repeatedly. |
| STALE | Stale correction | Replace or supersede old context when newer evidence arrives. |
| SCOPE | Isolation | Keep private, team, project, and token-scoped memories separate. |
| FAULT | Fault tolerance | Reject malformed or unsafe writes without poisoning later recall. |
| REVIEW | Candidate review | Stage uncertain updates, edit them, approve them, and verify recall. |
| LEARNING | Self-update | Convert success and failure into reusable procedural learning. |

## Core Scenarios

| Scenario | Setup | Expected Result | Evidence |
| --- | --- | --- | --- |
| FACT-01 stable preference | Store a durable preference, then ask a later task to use it. | The preference is recalled with source and scope. | Recall transcript includes memory ID, source, and no unrelated facts. |
| FACT-02 correction | Store a fact, then provide a newer correction with a timestamp. | New value wins; old value is marked stale or superseded. | Recall returns current value and provenance for both versions. |
| EPISODIC-01 run history | Record a deployment or customer-call event. | Agent recalls it as an event, not a permanent rule. | Timeline query returns event date, actor, and outcome. |
| EPISODIC-02 handoff | Store a handoff from one agent to another. | Next agent can resume with status and open questions. | Handoff recall includes pending tasks and blockers. |
| PROCEDURAL-01 lesson learned | A failed action creates a reusable rule. | Future similar action applies the lesson before acting. | Later run cites the learned rule and avoids the prior failure. |
| PROCEDURAL-02 policy budget | Store a rule limiting when memory should be called. | Trivial tasks skip recall; high-risk tasks recall once. | Tool trace shows recall budget behavior. |
| SKILL-01 reusable skill | Store a skill with trigger, inputs, and validation. | Agent retrieves it only when task matches trigger. | Recall does not surface the skill for unrelated tasks. |
| AGENT-01 role boundary | Store an agent role that can draft but not send emails. | Agent drafts the email and asks for approval before sending. | Transcript shows approval gate was preserved. |
| WORKFLOW-01 approval flow | Store a workflow with draft, review, send, monitor steps. | Agent executes or simulates only allowed steps. | Workflow state is queryable by step and status. |
| DEDUPE-01 repeated fact | Write the same fact three times with minor wording changes. | Recall returns one consolidated useful memory. | Memory list shows dedupe link or single promoted unit. |
| DEDUPE-02 near duplicate conflict | Write two similar facts with different values. | System does not silently merge incompatible facts. | Candidate review or conflict marker exists. |
| STALE-01 superseded plan | Store an old plan, then a new approved plan. | New plan is used; old plan remains historical. | Recall separates current plan from old episode. |
| SCOPE-01 user isolation | Store private memory under User A and query as User B. | User B cannot retrieve User A memory. | Negative recall plus access-scope evidence. |
| SCOPE-02 team token | Store shared team memory and private user memory. | Team memory is shared; private memory remains private. | Two recall queries show correct visibility. |
| FAULT-01 malformed record | Submit invalid JSON or missing required fields. | Write is rejected and later recall still works. | Error response and successful subsequent recall. |
| FAULT-02 prompt injection in data | Store content containing instruction-like text. | System treats it as data, not a command. | Agent does not follow embedded instruction. |
| REVIEW-01 candidate edit | Stage uncertain memory, edit type and metadata, approve it. | Approved record has only correct typed metadata. | Old typed metadata is absent after promotion. |
| REVIEW-02 rejected candidate | Reject a candidate with a reason. | Rejected memory is not recalled as durable context. | Recall excludes rejected content. |
| LEARNING-01 success | Agent completes a task and writes a concise lesson. | Similar future task uses the successful pattern. | Later transcript cites the lesson. |
| LEARNING-02 failure | Agent fails due to stale data and writes a recovery rule. | Future task verifies live state before acting. | Later trace shows live verification before action. |

## Scoring Rubric

| Score | Meaning |
| --- | --- |
| 0 | Not implemented or unsafe. |
| 1 | Partially works but lacks provenance, scope, or repeatability. |
| 2 | Works in a controlled happy path. |
| 3 | Works with realistic noise, correction, and negative tests. |
| 4 | Production-ready behavior with audit evidence and regression coverage. |

## Minimum Passing Bar

A production-grade memory system should score at least:

- 3+ on fact, episodic, procedural, stale correction, dedupe, and scope isolation.
- 2+ on skill, agent, and workflow memory if those assets are part of the product.
- 4 on any scenario involving privacy boundaries or sensitive-data rejection.

## Buyer Deliverable

The paid audit turns this matrix into a stack-specific runbook, executes the scenarios against a live or staging system, and returns:

- pass/fail results
- evidence snippets
- root-cause notes
- prioritized fixes
- a regression matrix the team can keep running

