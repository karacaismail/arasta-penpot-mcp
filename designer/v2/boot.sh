#!/bin/bash
# boot.sh module.js [...] : loads modules into Penpot plugin globals (each < 90 KB).
# When core.js is booted, the Phosphor icon table (storage.PH) is reloaded too (lost on plugin reconnect).
cd ~/penpot/mcp-client
for m in "$@"; do
  if [ "$(basename $m)" = "core.js" ]; then
    for c in v2/data/ph-*.js; do LABEL="boot icons $(basename $c)" node call.mjs exec $c | grep -E '"result"|rror' | head -1; done
  fi
  names=$(grep -oE '^(async function|function|const|let) [A-Za-z_$][A-Za-z0-9_$]*' "$m" | awk '{print $NF}' | grep -v '^__' | sort -u | paste -sd, -)
  out=/tmp/boot-$(basename $m)
  { cat "$m"; echo; echo "Object.assign(globalThis, { $names }); return '$(basename $m) ok (' + [$(echo $names | sed 's/[^,]*/1/g')].length + ' exports)';"; } > $out
  sz=$(wc -c < $out); [ $sz -gt 95000 ] && { echo "$m too big: $sz"; exit 1; }
  LABEL="boot $(basename $m)" node call.mjs exec $out | grep -E '"result"|rror' | head -2
done
