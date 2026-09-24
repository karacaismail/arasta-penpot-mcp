#!/bin/bash
# run.sh "<page>" <key> id,id ...  (modules must be booted)
cd ~/penpot/mcp-client; page=$1; key=$2; shift 2
for batch in "$@"; do
  ids=$(node -e "console.log(JSON.stringify(process.argv[1].split(',')))" "$batch")
  printf 'if (typeof RUN !== "function" || !storage.PH) throw new Error("BOOT_REQUIRED");\nreturn await RUN(%s, %s, %s);\n' "$(node -e "console.log(JSON.stringify(process.argv[1]))" "$page")" "'$key'" "$ids" > /tmp/r2-$key.js
  out=$(LABEL="$key $batch" node call.mjs exec /tmp/r2-$key.js 2>&1)
  echo "[$(date +%H:%M:%S)] $key $batch :: $(echo "$out" | node fmt.mjs)"
  echo "$out" | grep -qE "timed out|suspended" && ./wait-alive.sh >/dev/null
done
