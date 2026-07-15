#!/usr/bin/env bash
# Zero-leak gate: fails if any secret or private identifier pattern appears in the tree.
# Run via `npm run check:leaks`. Extend PATTERNS when new private identifiers exist.
set -euo pipefail

cd "$(dirname "$0")/.."

# Generic secret shapes + identifiers tied to the original private deployment.
PATTERNS=(
  'ntn_[A-Za-z0-9]{20,}'          # Notion internal integration token
  'secret_[A-Za-z0-9]{20,}'       # legacy Notion token
  'sk-[A-Za-z0-9_-]{20,}'         # OpenAI-style API key
  'eyJ[A-Za-z0-9_-]{40,}'         # JWT
  'VERCEL_OIDC'
  'prj_[A-Za-z0-9]{8,}'           # Vercel project ID
  'team_[A-Za-z0-9]{8,}'          # Vercel org ID
  'yuipan\.app\.n8n\.cloud'       # original n8n Cloud workspace
  '來來青果|青果行|來來國小'
  'fruit-line-liff'
  '2010526581'                    # original LIFF IDs
  'C3908d24'                      # original work-group ID
  '38e44549|3b5d7703|7dc5bf4e|8817e53b|e1561428|9fdeb65b|e508e160|0bd9456e' # original Notion DB IDs
  'wkN31X7X|LbwHVEFA|hkpe3suL|kpr9xMSA|YwswWoBv'                            # original n8n workflow IDs
)

EXCLUDES=(--exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git
          --exclude-dir=_incoming --exclude-dir=tmp --exclude=check-leaks.sh)

status=0
for p in "${PATTERNS[@]}"; do
  if grep -rInE "${EXCLUDES[@]}" -- "$p" . 2>/dev/null; then
    echo "✗ leak pattern matched: $p" >&2
    status=1
  fi
done

# Any real n8n Cloud workspace URL other than an obvious placeholder.
if grep -rInE "${EXCLUDES[@]}" -- '[a-z0-9-]+\.app\.n8n\.cloud' . 2>/dev/null | grep -vE 'your-|<your'; then
  echo "✗ leak pattern matched: non-placeholder *.app.n8n.cloud URL" >&2
  status=1
fi

if [ "$status" -ne 0 ]; then
  echo "" >&2
  echo "check-leaks: FAILED — remove the matches above before committing." >&2
  exit 1
fi
echo "check-leaks: clean"
