#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const matrixPath = path.join(repoRoot, "matrix", "agent-memory-eval-matrix.v1.json");

function parseArgs(argv) {
  const args = { input: null, output: null };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--input") {
      args.input = argv[++i];
    } else if (arg === "--output") {
      args.output = argv[++i];
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function usage() {
  return `Usage:
  node tools/generate-audit-plan.mjs --input examples/sample-intake.json --output examples/generated-starter-plan.md

Input JSON fields:
  stack: string
  memoryGoal: string
  forbiddenMemory: string
  primaryFailure: string
  package: "starter" | "deep"
  availableMaterials: string[]
`;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizePackage(value) {
  const raw = String(value || "starter").toLowerCase();
  return raw.includes("deep") ? "deep" : "starter";
}

function scenarioBudget(pkg) {
  return pkg === "deep" ? 20 : 12;
}

function rankScenarios(matrix, intake, pkg) {
  const risk = `${intake.primaryFailure || ""} ${intake.memoryGoal || ""} ${intake.forbiddenMemory || ""}`.toLowerCase();
  const categoryWeights = new Map();

  const add = (category, weight) => {
    categoryWeights.set(category, (categoryWeights.get(category) || 0) + weight);
  };

  add("fact", 3);
  add("episodic", 2);
  add("procedural", 3);
  add("dedupe", 2);
  add("stale_correction", 2);
  add("scope_isolation", 3);
  add("fault_tolerance", 2);

  if (risk.includes("duplicate") || risk.includes("dedupe")) add("dedupe", 5);
  if (risk.includes("stale") || risk.includes("old") || risk.includes("wrong")) add("stale_correction", 5);
  if (risk.includes("leak") || risk.includes("scope") || risk.includes("private") || risk.includes("tenant")) add("scope_isolation", 6);
  if (risk.includes("bad write") || risk.includes("malformed") || risk.includes("poison")) add("fault_tolerance", 5);
  if (risk.includes("approval") || risk.includes("review")) add("candidate_review", 4);
  if (risk.includes("workflow")) add("workflow", 4);
  if (risk.includes("agent")) add("agent", 3);
  if (risk.includes("skill")) add("skill", 3);
  if (risk.includes("learn") || risk.includes("failure") || risk.includes("success")) add("self_update", 4);

  if (pkg === "deep") {
    for (const category of matrix.categories) add(category, 1);
  }

  return [...matrix.scenarios]
    .map((scenario, index) => ({
      ...scenario,
      score: (categoryWeights.get(scenario.category) || 0) * 100 - index,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(scenarioBudget(pkg), matrix.scenarios.length));
}

function renderPlan(matrix, intake) {
  const pkg = normalizePackage(intake.package);
  const scenarios = rankScenarios(matrix, intake, pkg);
  const packageLabel = pkg === "deep" ? "Deep Agent Memory Evaluation" : "Starter Audit";
  const price = pkg === "deep" ? "USD 499" : "USD 99";
  const delivery = pkg === "deep" ? "7 business days" : "3 business days";

  const materials = Array.isArray(intake.availableMaterials) && intake.availableMaterials.length
    ? intake.availableMaterials.map((item) => `- ${item}`).join("\n")
    : "- Architecture docs, sample prompts, logs, traces, or staging access can be added later.";

  const scenarioRows = scenarios.map((scenario) =>
    `| ${scenario.id} | ${scenario.category} | ${scenario.title} | ${scenario.expected} |`
  ).join("\n");

  return `# Agent Memory Audit Starter Plan

## Buyer Context

| Field | Value |
| --- | --- |
| Stack | ${intake.stack || "Not specified"} |
| Package | ${packageLabel} |
| Price | ${price} |
| Delivery | ${delivery} |
| Memory goal | ${intake.memoryGoal || "Not specified"} |
| Must not remember | ${intake.forbiddenMemory || "Not specified"} |
| Primary failure to avoid | ${intake.primaryFailure || "Not specified"} |

## Available Materials

${materials}

## Recommended Scenario Set

| Scenario | Category | Test | Expected Result |
| --- | --- | --- | --- |
${scenarioRows}

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
`;
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help || !args.input || !args.output) {
    console.log(usage());
    process.exit(args.help ? 0 : 1);
  }

  const inputPath = path.resolve(args.input);
  const outputPath = path.resolve(args.output);
  const matrix = readJson(matrixPath);
  const intake = readJson(inputPath);
  const plan = renderPlan(matrix, intake);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, plan);
  console.log(`Wrote ${outputPath}`);
}

main();

