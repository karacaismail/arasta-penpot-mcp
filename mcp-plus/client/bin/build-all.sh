#!/bin/bash
# Drop-in for mcp-client/v2/build-all.sh. Honours the same env vars:
#   ONLY=home,pdp   BATCHES="P320,P360 D1920"
# plus MANIFEST=<yaml> (default examples/arasta-v2.yaml) and FRESH=1 (ignore checkpoint).
# Resumable: re-running continues from state/<name>.checkpoint.json.
here="$(cd "$(dirname "$0")/.." && pwd)"
exec node "$here/pp.mjs" job "${MANIFEST:-$here/examples/arasta-v2.yaml}" ${ONLY:+--only "$ONLY"} ${BATCHES:+--batches "$BATCHES"} ${FRESH:+--fresh}
