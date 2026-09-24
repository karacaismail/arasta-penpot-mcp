#!/bin/bash
# Drop-in for mcp-client/wait-alive.sh: exponential-backoff probe until the plugin is idle.
exec node "$(dirname "$0")/../pp.mjs" wait "$@"
