#!/bin/bash
# Drop-in for mcp-client/v2/run.sh: run.sh "<page>" <key> id,id ...
# Same guard as v2/run.sh (RUN must exist and storage.PH must be set). If PP_MODULES is set
# (comma-separated module paths) a BOOT_REQUIRED is answered by rebooting those modules automatically.
# PP_REQUIRE_STORAGE (default PH; set to "" to drop the storage check).
page=$1; key=$2; shift 2
st=${PP_REQUIRE_STORAGE-PH}
exec node "$(dirname "$0")/../pp.mjs" run "$page" "$key" "$@" --require RUN ${st:+--storage "$st"} ${PP_MODULES:+--modules "$PP_MODULES"} ${PP_FAIL_PATTERN:+--fail-pattern "$PP_FAIL_PATTERN"}
