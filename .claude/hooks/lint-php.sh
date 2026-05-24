#!/bin/bash
# Hook: post-tool-use for Write/Edit on PHP files
# Runs php -l syntax check after any PHP file is created or edited.

FILE="$1"

# Only check PHP files
if [[ "$FILE" != *.php ]]; then
    exit 0
fi

# Check if file exists
if [ ! -f "$FILE" ]; then
    exit 0
fi

# Run PHP syntax check via lando if available, fallback to local php
if command -v lando &> /dev/null && lando list 2>/dev/null | grep -q "php"; then
    OUTPUT=$(lando php -l "$FILE" 2>&1)
else
    OUTPUT=$(php -l "$FILE" 2>&1)
fi

if [ $? -ne 0 ]; then
    echo "PHP SYNTAX ERROR in $FILE:"
    echo "$OUTPUT"
    exit 1
fi

exit 0
