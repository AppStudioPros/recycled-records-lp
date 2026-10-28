#!/bin/bash
# Recycled Records — Discogs Inventory Sync
# Runs on cron every 2 minutes. No AI credits used.
# Features: lock file (no overlapping syncs), smart diff (only changed rows),
# safe deletion (only removes stale listings if full sync succeeded),
# on-demand Next.js cache revalidation after each successful sync.

LOG="/tmp/rr-sync.log"
LOCK="/tmp/rr-sync.lock"
SITE_URL="https://recycledrecordslps.com"
REVALIDATE_SECRET="rr-revalidate-2026"

# ── Lock: prevent overlapping syncs ──────────────────────────────────────────
if [ -f "$LOCK" ]; then
  LOCK_AGE=$(( $(date +%s) - $(stat -c %Y "$LOCK" 2>/dev/null || echo 0) ))
  if [ "$LOCK_AGE" -lt 1800 ]; then
    echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] Sync already running (lock age: ${LOCK_AGE}s). Skipping." >> "$LOG"
    exit 0
  else
    echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] Stale lock found (${LOCK_AGE}s old). Removing." >> "$LOG"
    rm -f "$LOCK"
  fi
fi

touch "$LOCK"
trap "rm -f '$LOCK'" EXIT

echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] Starting sync..." >> "$LOG"

cd /root/builds/recycled-records

# ── Run sync ──────────────────────────────────────────────────────────────────
npx tsx scripts/sync-inventory.ts >> "$LOG" 2>&1
EXIT_CODE=$?

# ── On success: trigger Next.js on-demand revalidation ───────────────────────
if [ $EXIT_CODE -eq 0 ]; then
  REVAL=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
    "${SITE_URL}/api/revalidate?secret=${REVALIDATE_SECRET}")
  echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] Cache revalidated (HTTP $REVAL)" >> "$LOG"
else
  echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] Sync FAILED (exit $EXIT_CODE) — skipping revalidation" >> "$LOG"
fi

# ── Keep log from growing forever (last 500 lines) ───────────────────────────
tail -500 "$LOG" > "${LOG}.tmp" && mv "${LOG}.tmp" "$LOG"

exit $EXIT_CODE
