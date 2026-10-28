#!/bin/bash
# Recycled Records — Nightly Discogs Inventory Sync
# Runs full Discogs scan, writes ONLY changed/new/removed listings to Supabase.
# No AI credits used. Pure API + Supabase free tier.

LOG="/tmp/rr-nightly-sync.log"
echo "========================================" >> "$LOG"
echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] Starting nightly sync" >> "$LOG"

cd /root/builds/recycled-records

# Run the sync script with diff mode enabled
npx tsx scripts/sync-inventory.ts --diff-only >> "$LOG" 2>&1
EXIT_CODE=$?

echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] Sync finished (exit $EXIT_CODE)" >> "$LOG"
echo "========================================" >> "$LOG"

exit $EXIT_CODE
