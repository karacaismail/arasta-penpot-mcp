#!/bin/bash
cd ~/penpot/mcp-client; for i in $(seq 1 40); do node call.mjs exec /tmp/p0.js 2>/dev/null | grep -q '"file"' && { echo "alive after $((i-1)) waits"; exit 0; }; sleep 15; done; echo "still busy"; exit 1
