#!/bin/bash
set -euo pipefail
BASE_PATH="${BASE_PATH:-/cli}"
TARGET_DEPLOY="${TARGET_DEPLOY:-openclaw}"
TARGET_CONTAINER="${TARGET_CONTAINER:-openclaw}"
exec ttyd -W -b "${BASE_PATH}" -p 7681 -i 0.0.0.0 \
  kubectl exec -i -t "deploy/${TARGET_DEPLOY}" -c "${TARGET_CONTAINER}" -- \
  sh -lc 'cd /home/node 2>/dev/null || cd /; printf "\n  MeinAppNest OpenCLI\n  Beispiel: openclaw models auth login --provider openai-codex\n\n"; exec sh'
