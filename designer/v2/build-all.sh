#!/bin/bash
# Builds every page × device via Penpot MCP. Reboots modules if plugin state was lost.
cd ~/penpot/mcp-client
boot() { v2/boot.sh v2/core.js v2/ui-base.js v2/ui-nav.js v2/ui-commerce.js v2/shell.js v2/pages-a.js v2/pages-b.js v2/pages-c.js >/dev/null; }
BATCHES=${BATCHES:-"P320,P360 P390,P430 L480,L844 L932,T600 T768,T1024P T960,T1024L T1366,K1280 K1440,K1728 D1920 W2560 TV U8K"}
while IFS='|' read p k; do
  [ -n "$ONLY" ] && ! echo ",$ONLY," | grep -q ",$k," && continue
  for b in $BATCHES; do
    for attempt in 1 2 3; do
      out=$(v2/run.sh "$p" $k $b 2>&1); echo "$out"
      if echo "$out" | grep -q BOOT_REQUIRED; then boot; continue; fi
      echo "$out" | grep -qE "timed out|suspended| ERR " && { ./wait-alive.sh >/dev/null; continue; }
      break
    done
  done
  printf 'if (typeof ARRANGE !== "function") throw new Error("BOOT_REQUIRED");\nreturn await ARRANGE(%s, %s);\n' "$(node -e "console.log(JSON.stringify(process.argv[1]))" "$p")" "$(node -e "console.log(JSON.stringify(process.argv[1].replace(/^\d+ · /,'')))" "$p")" > /tmp/ar2.js
  echo "[$(date +%H:%M:%S)] arrange $k :: $(LABEL="arrange $k" node call.mjs exec /tmp/ar2.js 2>&1 | node fmt.mjs)"; ./wait-alive.sh >/dev/null
done < v2/pages.txt
echo "ALL DONE $(date +%H:%M:%S)"
