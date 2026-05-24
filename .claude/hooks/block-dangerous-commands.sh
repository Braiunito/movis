#!/bin/bash
# Hook: pre-tool-use for Bash
# Blocks commands that could cause irreversible damage.
# Configured in .claude/settings.json

COMMAND="$1"

# Block destructive commands
BLOCKED_PATTERNS=(
    "rm -rf /"
    "rm -rf /*"
    "rm -rf ."
    "drop database"
    "DROP DATABASE"
    "doctrine:schema:update --force"
    "doctrine:schema:drop"
    "truncate table"
    "TRUNCATE TABLE"
    "git push --force"
    "git push -f"
    ":migrations:migrate --no-interaction"
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
    if echo "$COMMAND" | grep -qF "$pattern"; then
        echo "BLOCKED: Command contains dangerous pattern: '$pattern'"
        echo "This command requires manual execution by a human."
        exit 1
    fi
done

exit 0
