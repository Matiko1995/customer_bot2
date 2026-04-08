#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BRANCH_NAME="${BRANCH_NAME:-main}"
REMOTE_NAME="${REMOTE_NAME:-origin}"
SERVICE_NAME="${SERVICE_NAME:-customer-bot}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-https://bot.aifactory.website/admin/login}"
HEALTHCHECK_RETRIES="${HEALTHCHECK_RETRIES:-12}"
HEALTHCHECK_INTERVAL="${HEALTHCHECK_INTERVAL:-5}"
RUN_GIT_PULL="${RUN_GIT_PULL:-1}"
RUN_INSTALL="${RUN_INSTALL:-1}"
RUN_TESTS="${RUN_TESTS:-1}"
RUN_BUILD="${RUN_BUILD:-1}"
ENV_FILE="${ENV_FILE:-/srv/customer-bot/shared/.env}"
SHARED_DIR="${SHARED_DIR:-/srv/customer-bot/shared}"

cd "$ROOT_DIR"

echo "==> Customer Bot deploy start"
echo "ROOT_DIR=$ROOT_DIR"
echo "BRANCH_NAME=$BRANCH_NAME"
echo "REMOTE_NAME=$REMOTE_NAME"
echo "SERVICE_NAME=$SERVICE_NAME"
echo "HEALTHCHECK_URL=$HEALTHCHECK_URL"

if [ "$RUN_GIT_PULL" = "1" ]; then
  echo "==> git fetch $REMOTE_NAME"
  git fetch "$REMOTE_NAME"
  echo "==> git pull $REMOTE_NAME $BRANCH_NAME"
  git pull "$REMOTE_NAME" "$BRANCH_NAME"
else
  echo "==> Skip git pull"
fi

echo "==> Run release script"
RUN_INSTALL="$RUN_INSTALL" \
RUN_TESTS="$RUN_TESTS" \
RUN_BUILD="$RUN_BUILD" \
RUN_RESTART=1 \
SERVICE_NAME="$SERVICE_NAME" \
ENV_FILE="$ENV_FILE" \
SHARED_DIR="$SHARED_DIR" \
bash "$ROOT_DIR/scripts/release-current.sh"

echo "==> Health check"
attempt=1
while [ "$attempt" -le "$HEALTHCHECK_RETRIES" ]; do
  code="$(curl -s -o /tmp/customer-bot-health.out -w '%{http_code}' "$HEALTHCHECK_URL" || true)"
  if [ "$code" = "200" ] || [ "$code" = "304" ]; then
    echo "==> Health check passed with HTTP $code"
    exit 0
  fi

  echo "==> Health check attempt $attempt/$HEALTHCHECK_RETRIES failed with HTTP $code"
  attempt=$((attempt + 1))
  sleep "$HEALTHCHECK_INTERVAL"
done

echo "==> Health check failed: $HEALTHCHECK_URL"
echo "==> Last response body:"
cat /tmp/customer-bot-health.out 2>/dev/null || true
exit 1
