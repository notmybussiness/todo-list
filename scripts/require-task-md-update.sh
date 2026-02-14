#!/usr/bin/env bash

set -euo pipefail

if [[ "${SKIP_TASK_MD_GUARD:-}" == "1" ]]; then
  exit 0
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  exit 0
fi

staged_files=()
while IFS= read -r file; do
  staged_files+=("$file")
done < <(git diff --cached --name-only --diff-filter=ACMR)

if [[ ${#staged_files[@]} -eq 0 ]]; then
  exit 0
fi

task_md_staged="false"
non_task_changes="false"

for file in "${staged_files[@]}"; do
  if [[ "$file" == "Task.md" ]]; then
    task_md_staged="true"
  else
    non_task_changes="true"
  fi
done

if [[ "$non_task_changes" == "true" && "$task_md_staged" != "true" ]]; then
  cat <<'MSG'
[task-md-guard] Commit blocked.
Reason: non-Task changes are staged but Task.md is not updated.

Required:
1) update Task.md to reflect this task progress
2) stage Task.md
3) commit again

Temporary bypass (not recommended):
  SKIP_TASK_MD_GUARD=1 git commit ...
MSG
  exit 1
fi
