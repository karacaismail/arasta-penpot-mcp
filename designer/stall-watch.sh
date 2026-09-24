#!/bin/bash
# exits with STALL when build log has not changed for 150 s while build-all is running; DONE when build finished
L=~/penpot/mcp-client/v2/build-all.log
while true; do
  grep -q "ALL DONE" $L && { echo DONE; exit 0; }
  pgrep -f "v2/build-all.sh" >/dev/null || { echo "BUILD NOT RUNNING"; exit 0; }
  age=$(( $(date +%s) - $(stat -f %m $L) ))
  [ $age -gt 150 ] && { echo "STALL age=${age}s last: $(tail -1 $L | cut -c1-120)"; exit 0; }
  sleep 20
done
