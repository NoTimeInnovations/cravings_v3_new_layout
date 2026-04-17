#!/bin/bash
# List all tables in the Hasura public schema
source "/home/abhin/Cloud Skills/credentials.env"

curl -s -X POST \
  "${HASURA_GRAPHQL_ENDPOINT_HASURA}/v2/query" \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: $HASURA_GRAPHQL_ADMIN_SECRET" \
  -d '{"type": "run_sql", "args": {"sql": "SELECT table_name FROM information_schema.tables WHERE table_schema = '\''public'\'' ORDER BY table_name;"}}' | python3 -m json.tool
