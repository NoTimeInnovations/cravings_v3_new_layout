#!/bin/bash
# Set or update a partner's username
# Usage: ./set-username.sh <partner_id> <new_username>
source "/home/abhin/Cloud Skills/credentials.env"

PARTNER_ID="${1:?Usage: $0 <partner_id> <new_username>}"
NEW_USERNAME="${2:?Usage: $0 <partner_id> <new_username>}"

# Validate username format (lowercase alphanumeric + hyphens)
if ! echo "$NEW_USERNAME" | grep -qP '^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$'; then
    echo "ERROR: Username must be lowercase, alphanumeric, with hyphens only (no spaces or special characters)."
    exit 1
fi

# Step 1: Check if username is already taken
echo "Checking if username '$NEW_USERNAME' is available..."
CHECK_RESULT=$(curl -s -X POST \
  "${HASURA_GRAPHQL_ENDPOINT_HASURA}/v2/query" \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: $HASURA_GRAPHQL_ADMIN_SECRET" \
  -d "{
    \"type\": \"run_sql\",
    \"args\": {
      \"sql\": \"SELECT id, name, email FROM partners WHERE username = '${NEW_USERNAME}' AND id != '${PARTNER_ID}' LIMIT 1;\"
    }
  }")

TAKEN=$(echo "$CHECK_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('result',[])) > 1)" 2>/dev/null)

if [ "$TAKEN" = "True" ]; then
    echo "ERROR: Username '$NEW_USERNAME' is already taken by another partner!"
    echo "$CHECK_RESULT" | python3 -m json.tool
    exit 1
fi

# Step 2: Update the username
echo "Setting username to '$NEW_USERNAME'..."
UPDATE_RESULT=$(curl -s -X POST \
  "${HASURA_GRAPHQL_ENDPOINT_HASURA}/v2/query" \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: $HASURA_GRAPHQL_ADMIN_SECRET" \
  -d "{
    \"type\": \"run_sql\",
    \"args\": {
      \"sql\": \"UPDATE partners SET username = '${NEW_USERNAME}', updated_at = NOW() WHERE id = '${PARTNER_ID}' RETURNING id, name, email, username;\"
    }
  }")

HAS_ERROR=$(echo "$UPDATE_RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if 'error' in d else 'no')" 2>/dev/null)

if [ "$HAS_ERROR" = "yes" ]; then
    echo "ERROR: Failed to update username!"
    echo "$UPDATE_RESULT" | python3 -m json.tool
    exit 1
fi

echo "Username updated successfully!"
echo "$UPDATE_RESULT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
rows = data.get('result', [])
if len(rows) > 1:
    headers = rows[0]
    record = dict(zip(headers, rows[1]))
    print(f'  Partner: {record.get(\"name\", \"-\")}')
    print(f'  Email: {record.get(\"email\", \"-\")}')
    print(f'  Username: {record.get(\"username\", \"-\")}')
else:
    print('  No rows returned — partner ID may be incorrect.')
"
