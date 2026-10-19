#!/usr/bin/env bash
# PostToolUse: eslint --fix on the edited JS/TS file only (enforces the no-semicolon rule).
# Prettier is not run: most files predate .prettierrc and would be reformatted wholesale.
# Silent when dependencies are not installed.
set -u
command -v jq >/dev/null 2>&1 || exit 0
f=$(jq -r '.tool_input.file_path // empty')
case "$f" in *.ts|*.tsx|*.js|*.jsx|*.mjs) ;; *) exit 0 ;; esac
case "$f" in */node_modules/*|*/.next/*) exit 0 ;; esac
[ -f "$f" ] || exit 0
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0
[ -x node_modules/.bin/eslint ] || exit 0
if ! out=$(node_modules/.bin/eslint --fix --quiet "$f" 2>&1); then
  echo "eslint errors in $f after auto-fix (fix them, or say why they are pre-existing):" >&2
  echo "$out" | tail -n 30 >&2
  exit 2
fi
exit 0
