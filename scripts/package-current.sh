#!/usr/bin/env bash

set -Eeuo pipefail

APP_ROOT="${APP_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
OUTPUT_DIR="${OUTPUT_DIR:-${APP_ROOT}/releases}"
ARCHIVE_PREFIX="${ARCHIVE_PREFIX:-customer-bot}"
RUN_TESTS="${RUN_TESTS:-1}"
RUN_BUILD="${RUN_BUILD:-1}"

timestamp="$(date +%Y%m%d-%H%M%S)"
archive_name="${ARCHIVE_PREFIX}-${timestamp}.tar.gz"
archive_path="${OUTPUT_DIR}/${archive_name}"

echo "[1/5] Enter project root: ${APP_ROOT}"
cd "${APP_ROOT}"

mkdir -p "${OUTPUT_DIR}"

if [[ "${RUN_TESTS}" == "1" ]]; then
  echo "[2/5] Run tests"
  npm test
else
  echo "[2/5] Skip tests"
fi

if [[ "${RUN_BUILD}" == "1" ]]; then
  echo "[3/5] Build production artifacts"
  npm run build
else
  echo "[3/5] Skip build"
fi

echo "[4/5] Create release archive"
COPYFILE_DISABLE=1 tar -czf "${archive_path}" \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.nuxt' \
  --exclude='.output/public/_nuxt/builds' \
  --exclude='.DS_Store' \
  --exclude='._*' \
  --exclude='__MACOSX' \
  --exclude='*.log' \
  --exclude='releases' \
  .

echo "[5/5] Package ready"
echo "${archive_path}"
