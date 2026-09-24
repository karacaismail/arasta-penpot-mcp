#!/bin/bash
# exp.sh "<page>" <devId> <out.png> [sliceH]
cd ~/penpot/mcp-client
printf 'const pn = %s; if (penpot.currentPage.name !== pn) { await penpot.openPage(penpotUtils.getPageByName(pn)); await new Promise(r => setTimeout(r, 300)); }\nconst f = penpot.root.children.find(s => s.getPluginData && s.getPluginData("dev") === "%s"); return f ? f.id : null;\n' "$(node -e "console.log(JSON.stringify(process.argv[1]))" "$1")" "$2" > /tmp/e2.js
id=$(node call.mjs exec /tmp/e2.js | node fmt.mjs | tr -d '"')
IMG_OUT=$3 LABEL="export $2" node call.mjs export_shape "{\"shapeId\":\"$id\"}" >/dev/null || { echo "export failed $2"; exit 1; }
[ -n "$4" ] && node slice.mjs $3 $4 || echo $3
