#!/bin/bash
# Hook: post-tool-use for Write on src/ files
# Reminds the agent to update the relevant manifest after creating/editing source files.

FILE="$1"

# Only check files inside src/
if [[ "$FILE" != src/* ]]; then
    exit 0
fi

REMINDER=""

if [[ "$FILE" == *Controller.php ]]; then
    REMINDER="MANIFEST REMINDER: Update docs/manifests/routes.md with this controller's routes."
elif [[ "$FILE" == *Service.php ]]; then
    REMINDER="MANIFEST REMINDER: Update docs/manifests/services.md with this service entry."
elif [[ "$FILE" == *DataProviderInterface.php ]] || [[ "$FILE" == *Provider.php ]]; then
    REMINDER="MANIFEST REMINDER: Update docs/manifests/providers.md with this provider entry."
elif [[ "$FILE" == *DTO.php ]]; then
    REMINDER="MANIFEST REMINDER: Update docs/manifests/dtos.md with this DTO entry."
elif [[ "$FILE" == *Type.php ]] && [[ "$FILE" == *Form/* ]]; then
    REMINDER="MANIFEST REMINDER: Update docs/manifests/forms.md with this FormType entry."
fi

if [ -n "$REMINDER" ]; then
    echo "$REMINDER"
fi

# This hook always exits 0 — it's a reminder, not a blocker
exit 0
