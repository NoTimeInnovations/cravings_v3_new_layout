#!/bin/bash
# Run a raw SQL query against the Hasura database
# Usage: ./run-sql.sh "SELECT * FROM users LIMIT 5;"
source "/home/abhin/Cloud Skills/credentials.env"

SQL_QUERY="${1:?Usage: $0 \"SQL_QUERY\"}"

curl -s -X POST \
  "${HASURA_GRAPHQL_ENDPOINT_HASURA}/v2/query" \
  -H "Content-Type: application/json" \
  -H "x-hasura-admin-secret: $HASURA_GRAPHQL_ADMIN_SECRET" \
  -d "{\"type\": \"run_sql\", \"args\": {\"sql\": \"${SQL_QUERY}\"}}" | python3 -m json.tool
