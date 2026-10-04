#!/bin/bash
set -eu
node apps/api/dist/infrastructure/db/migrate.js
node apps/api/dist/infrastructure/db/seed.js
/usr/local/bin/docker-entrypoint.sh supertokens start --foreground &
core_pid=$!
node apps/api/dist/main.js &
api_pid=$!
trap 'kill -TERM "$core_pid" "$api_pid" 2>/dev/null; wait' TERM INT
wait -n "$core_pid" "$api_pid"
status=$?
kill -TERM "$core_pid" "$api_pid" 2>/dev/null || true
wait || true
exit "$status"
