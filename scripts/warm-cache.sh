#!/usr/bin/env bash

set -euo pipefail

if ! command -v curl >/dev/null 2>&1; then
  echo "Error: curl is required but not installed." >&2
  exit 1
fi

parse_duration() {
  # Accepts values like 900, 30s, 15m, 2h, 1d
  local input="$1"
  if [[ -z "$input" ]]; then
    echo 0
    return 0
  fi
  if [[ "$input" =~ ^[0-9]+$ ]]; then
    echo "$input"
    return 0
  fi
  if [[ "$input" =~ ^([0-9]+)([smhd])$ ]]; then
    local value="${BASH_REMATCH[1]}"
    local unit="${BASH_REMATCH[2]}"
    case "$unit" in
      s) echo "$value" ;;
      m) echo $(( value * 60 )) ;;
      h) echo $(( value * 3600 )) ;;
      d) echo $(( value * 86400 )) ;;
    esac
    return 0
  fi
  echo "Error: Invalid duration '$input'. Use forms like 300, 30s, 15m, 2h, 1d" >&2
  return 1
}

read -rp "Enter duration to warm (e.g., 15m, 1h, 300s): " DURATION_INPUT
DURATION_SECONDS=$(parse_duration "$DURATION_INPUT") || exit 1
if [[ "$DURATION_SECONDS" -le 0 ]]; then
  echo "Error: Duration must be > 0" >&2
  exit 1
fi

read -rp "Endpoint path [/api/warm-cache]: " ENDPOINT_PATH
ENDPOINT_PATH=${ENDPOINT_PATH:-/api/warm-cache}
if [[ "${ENDPOINT_PATH}" != /* ]]; then
  ENDPOINT_PATH="/${ENDPOINT_PATH}"
fi

read -rp "Enter base URL (e.g., https://your-app.vercel.app): " BASE_URL
if [[ -z "${BASE_URL}" ]]; then
  echo "Error: Base URL is required" >&2
  exit 1
fi
# Strip trailing slash
BASE_URL=${BASE_URL%/}

read -rp "Request interval seconds [default 60]: " INTERVAL_INPUT || true
INTERVAL_SECONDS=${INTERVAL_INPUT:-60}
if ! [[ "$INTERVAL_SECONDS" =~ ^[0-9]+$ ]] || [[ "$INTERVAL_SECONDS" -le 0 ]]; then
  echo "Invalid interval, defaulting to 60s"
  INTERVAL_SECONDS=60
fi

read -rp "HTTP method [GET]: " METHOD || true
METHOD=${METHOD:-GET}

read -rp "Optional x-warm-key header (leave blank if none): " WARM_KEY || true

URL="${BASE_URL}${ENDPOINT_PATH}"

echo ""
echo "Warming ${URL} for ${DURATION_SECONDS}s (interval ${INTERVAL_SECONDS}s, method ${METHOD})"
START_TS=$(date +%s)
END_TS=$(( START_TS + DURATION_SECONDS ))

COUNT=0
trap 'echo "\nInterrupted. Exiting."; exit 130' INT

while :; do
  NOW=$(date +%s)
  if [[ $NOW -ge $END_TS ]]; then
    break
  fi
  ((COUNT++)) || true
  TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  if [[ -n "${WARM_KEY}" ]]; then
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X "$METHOD" -H "x-warm-key: ${WARM_KEY}" "$URL") || STATUS="ERR"
  else
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X "$METHOD" "$URL") || STATUS="ERR"
  fi
  echo "[$TS] #$COUNT -> ${STATUS}"
  sleep "$INTERVAL_SECONDS"
done

ELAPSED=$(( $(date +%s) - START_TS ))
echo "Done. Sent ${COUNT} requests over ${ELAPSED}s to ${URL}."


