#!/bin/bash
# Describe a specific table's schema
# Usage: ./describe-table.sh <table_name>
source "/home/abhin/Cloud Skills/credentials.env"

TABLE_NAME="${1:?Usage: $0 <table_name>}"

curl -s -X POST \
  "${HASURA_GRAPHQL_ENDPOINT_HASURA}/v2/query" \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: $HASURA_GRAPHQL_ADMIN_SECRET" \
  -d "{\"type\": \"run_sql\", \"args\": {\"sql\": \"SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = '${TABLE_NAME}' ORDER BY ordinal_position;\"}}" | python3 -m json.tool
