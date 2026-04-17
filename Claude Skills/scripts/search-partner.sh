#!/bin/bash
# Search partners by name, store name, email, username, or phone
# Usage: ./search-partner.sh <search_term>
source "/home/abhin/Cloud Skills/credentials.env"

SEARCH="${1:?Usage: $0 <search_term>}"

# Escape single quotes for SQL
SEARCH_ESCAPED=$(echo "$SEARCH" | sed "s/'/''/g")

RESULT=$(curl -s -X POST \
  "${HASURA_GRAPHQL_ENDPOINT_HASURA}/v2/query" \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: $HASURA_GRAPHQL_ADMIN_SECRET" \
  -d "{
    \"type\": \"run_sql\",
    \"args\": {
      \"sql\": \"SELECT id, name, store_name, email, username, phone, status, business_type FROM partners WHERE name ILIKE '%${SEARCH_ESCAPED}%' OR store_name ILIKE '%${SEARCH_ESCAPED}%' OR email ILIKE '%${SEARCH_ESCAPED}%' OR username ILIKE '%${SEARCH_ESCAPED}%' OR phone ILIKE '%${SEARCH_ESCAPED}%' ORDER BY name LIMIT 20;\"
    }
  }")

echo "$RESULT" | python3 -c "
import sys, json

data = json.load(sys.stdin)
if 'error' in data:
    print(f'Error: {data[\"error\"]}')
    sys.exit(1)

rows = data.get('result', [])
if len(rows) <= 1:
    print('No matching partners found.')
    sys.exit(0)

headers = rows[0]
print(f'Found {len(rows)-1} result(s):\n')
for row in rows[1:]:
    record = dict(zip(headers, row))
    name = record.get('name', '-')
    store = record.get('store_name', '-') or '-'
    email = record.get('email', '-')
    username = record.get('username', '-') or '-'
    phone = record.get('phone', '-') or '-'
    status = record.get('status', '-')
    btype = record.get('business_type', '-') or '-'
    pid = record.get('id', '-')
    print(f'Name: {name}')
    print(f'  Store: {store}')
    print(f'  Email: {email}')
    print(f'  Username: {username}')
    print(f'  Phone: {phone}')
    print(f'  Status: {status} | Type: {btype}')
    print(f'  ID: {pid}')
    print()
"
