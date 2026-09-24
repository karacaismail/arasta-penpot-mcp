#!/bin/bash
# Drop-in for mcp-client/v2/boot.sh: boot.sh module.js [...]
# Differences: modules > 90 KB are chunked, unchanged modules are skipped (hash in plugin storage),
# data tables can be added with --data KEY=file (e.g. --data PH=js/icons.js). --force reloads all.
exec node "$(dirname "$0")/../pp.mjs" boot "$@"
