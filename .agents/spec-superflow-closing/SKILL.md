---
name: spec-superflow-closing
description: Use when a repository change is entering spec-superflow closing, when the user asks to close/archive/audit a change, or when tasks/state/audit may have drifted after implementation. Apply this skill to enforce the repository closing SOP, sync tasks.md with execution reality, rebuild state, run state check, and refresh decision-point audit before declaring the change complete.
---

# spec-superflow Closing

Use this skill whenever a `changes/<change-name>` task is ready to move from implementation into the final `executing -> closing` handoff.

## Workflow

1. Read [references/closing-sop.md](./references/closing-sop.md) before changing closing artifacts.
2. Confirm the persisted state is still `executing`. If the change is already `closing`, stop: `closing` is terminal in spec-superflow `0.12.1`.
3. Confirm verification has already been rerun for the change. If verification is missing, run it first and do not close early.
4. Detect the active workflow path before validating:
   - `Full` / `Legacy Hotfix`: require `tasks.md`, `test_result: pass`, `dp_4_result`, `dp_6_result` starting with `pass:`, `dp_7_result` starting with `confirmed:`, and synced delta specs when present.
   - `Quick` / `Direct Hotfix` / `Tweak`: require bounded verification evidence and `test_result: pass`; do not require DP-4 / DP-6 / DP-7 or audit.
5. Run the skill script instead of manually stitching the closing commands:

```powershell
node ".agents\spec-superflow-closing\scripts\close-change.mjs" "changes\<change-name>"
```

6. Read the script output. If it fails, report the exact missing prerequisite instead of hand-waving the close.
7. Only after the script succeeds, treat the change as ready for the final `ssf state transition <change-dir> closing`. For Full / legacy Hotfix, `decision-point-audit.md` and `.spec-superflow.yaml` must already be in sync before that final transition.

## Project Rules

1. Prefer repository-relative paths such as `changes\<change-name>` or normalized absolute paths that resolve inside the current repo.
2. Prefer the skill script [`scripts/close-change.mjs`](./scripts/close-change.mjs) over ad hoc commands.
3. If `DP-5` was never used because there was no debug escalation, leaving it unrecorded is acceptable; do not invent a fake debug record.
4. Do not run this wrapper after the persisted state has already become `closing`; route back through `workflow-start` for any post-close inspection.
5. If `audit` disagrees with `.spec-superflow.yaml`, refresh `audit` after rebuild/check before claiming the change is inconsistent.
6. If the script succeeds but `tasks.md` or audit artifacts changed, include those updated files in Git so the closing state is reproducible.

## Output Expectations

1. State whether closing is blocked or ready for the final `executing -> closing` transition.
2. Cite which file or prerequisite caused the block when the wrapper fails.
3. Do not say a change is fully closed until the final `ssf state transition <change-dir> closing` has actually succeeded.
