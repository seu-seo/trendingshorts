#!/usr/bin/env bash
# Shortform Pulse — API Smoke Test
# Usage: bash scripts/test-service.sh [base_url]
# Default base_url: http://localhost:3000

BASE="${1:-http://localhost:3000}"
PASS=0
FAIL=0
SKIP=0

GRN='\033[0;32m'; RED='\033[0;31m'; YEL='\033[0;33m'
CYN='\033[0;36m'; DIM='\033[2m'; NC='\033[0m'

pass() { echo -e "  ${GRN}✓${NC} $1${DIM}${2:+ — $2}${NC}"; PASS=$((PASS+1)); }
fail() { echo -e "  ${RED}✗${NC} $1${DIM}${2:+ — $2}${NC}"; FAIL=$((FAIL+1)); }
skip() { echo -e "  ${YEL}–${NC} $1${DIM} (skip)${NC}"; SKIP=$((SKIP+1)); }
info() { echo -e "    ${DIM}→ $1${NC}"; }

echo ""
echo -e "${CYN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYN}  Shortform Pulse — Service Test Loop${NC}"
echo -e "${CYN}  ${DIM}${BASE}${NC}"
echo -e "${CYN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ── 0. Server health check ──────────────────────────────
echo -e "${DIM}[0] Server${NC}"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$BASE" 2>/dev/null)
if [ "$STATUS" = "000" ] || [ -z "$STATUS" ]; then
  echo -e "  ${RED}✗${NC} Dev server not running at $BASE"
  echo -e "    Run: ${CYN}cd app && npm run dev${NC}"
  exit 1
fi
pass "Server up" "HTTP $STATUS"
echo ""

# ── 1. GET /api/trends ──────────────────────────────────
echo -e "${DIM}[1] GET /api/trends${NC}"
RES=$(curl -s -w "\n%{http_code}" --max-time 15 "$BASE/api/trends")
BODY=$(echo "$RES" | sed '$d')
STATUS=$(echo "$RES" | tail -1)
if [ "$STATUS" = "200" ]; then
  COUNT=$(echo "$BODY" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('data',[])))" 2>/dev/null || echo "?")
  SOURCE=$(echo "$BODY" | python3 -c "import json,sys; d=json.load(sys.stdin); items=d.get('data',[]); print(items[0].get('source','?') if items else '?')" 2>/dev/null || echo "?")
  pass "trends list" "${COUNT} items, source=${SOURCE}"
  # Validate schema of first item
  FIELDS=$(echo "$BODY" | python3 -c "
import json,sys
d=json.load(sys.stdin)
items=d.get('data',[])
if not items: print('EMPTY'); exit()
first=items[0]
required=['id','title','platform','category','heatLevel','views','engagementRate']
missing=[k for k in required if k not in first]
print('MISSING:'+','.join(missing) if missing else 'OK')
" 2>/dev/null)
  if [ "$FIELDS" = "OK" ]; then
    info "schema OK (id·title·platform·category·heatLevel·views·engagementRate)"
  else
    info "${RED}schema issue: $FIELDS${NC}"
    FAIL=$((FAIL+1))
  fi
else
  fail "trends list" "HTTP $STATUS"
  echo "$BODY" | head -2 | sed 's/^/    /'
fi
echo ""

# ── 2. POST /api/persona ────────────────────────────────
echo -e "${DIM}[2] POST /api/persona${NC}"
PERSONA_INPUT='{"platform":"multi","category":"food","experience":1,"goal":"growth","styles":["먹방","일상"],"pain":"idea","uploadFreq":"mid"}'
RES=$(curl -s -w "\n%{http_code}" --max-time 30 \
  -X POST "$BASE/api/persona" \
  -H "Content-Type: application/json" -d "$PERSONA_INPUT")
BODY=$(echo "$RES" | sed '$d')
STATUS=$(echo "$RES" | tail -1)
if [ "$STATUS" = "200" ]; then
  TYPE=$(echo "$BODY" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('personaType','?'))" 2>/dev/null)
  TRENDS_CNT=$(echo "$BODY" | python3 -c "import json,sys; d=json.load(sys.stdin); print(len(d.get('topTrends',[])))" 2>/dev/null)
  pass "persona card" "type=$TYPE, topTrends=${TRENDS_CNT}개"
else
  fail "persona card" "HTTP $STATUS"
  echo "$BODY" | head -2 | sed 's/^/    /'
fi
echo ""

# ── 3. POST /api/generate ───────────────────────────────
echo -e "${DIM}[3] POST /api/generate${NC}"
GEN_INPUT='{"trend":{"id":1,"title":"편의점 리뷰 챌린지","platform":"youtube","category":"food","views":2500000,"engagementRate":6.2,"heatLevel":"HOT","hashtags":"#편의점 #리뷰","videoUrl":"","thumb":"","description":"","postedAt":""}}'
RES=$(curl -s -w "\n%{http_code}" --max-time 45 \
  -X POST "$BASE/api/generate" \
  -H "Content-Type: application/json" -d "$GEN_INPUT")
BODY=$(echo "$RES" | sed '$d')
STATUS=$(echo "$RES" | tail -1)
if [ "$STATUS" = "200" ]; then
  # scripts is a dict: {informative, story, hooking}
  CNT=$(echo "$BODY" | python3 -c "import json,sys; d=json.load(sys.stdin); s=d.get('scripts',{}); print(len(s) if isinstance(s,dict) else len(s))" 2>/dev/null)
  SRC=$(echo "$BODY" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('meta',{}).get('source','?'))" 2>/dev/null)
  pass "script generation" "${CNT} scripts, source=${SRC}"
  HAS_HOOK=$(echo "$BODY" | python3 -c "
import json,sys
d=json.load(sys.stdin)
scripts=d.get('scripts',{})
if not scripts: print('NO_SCRIPTS'); exit()
# scripts is a dict {informative, story, hooking}
first = list(scripts.values())[0] if isinstance(scripts,dict) else scripts[0]
missing=[k for k in ['hook','body','cta'] if not first.get(k)]
print('MISSING:'+','.join(missing) if missing else 'OK')
" 2>/dev/null)
  [ "$HAS_HOOK" = "OK" ] && info "hook·body·cta present" || info "schema check: ${HAS_HOOK:-unknown}"
else
  fail "script generation" "HTTP $STATUS"
  echo "$BODY" | head -2 | sed 's/^/    /'
fi
echo ""

# ── 4. POST /api/rival (SSE) ────────────────────────────
echo -e "${DIM}[4] POST /api/rival (SSE)${NC}"
RIVAL_INPUT='{"topics":["먹방","편의점"],"channelSize":"micro","uploadFreq":"weekly-mid","contentTone":"info","gender":"any","lang":"ko"}'
# Capture first ~200 bytes of SSE stream
CHUNK=$(curl -s --max-time 10 -N \
  -X POST "$BASE/api/rival" \
  -H "Content-Type: application/json" -d "$RIVAL_INPUT" 2>/dev/null | head -c 200)
if echo "$CHUNK" | grep -q '"stage":1'; then
  pass "rival SSE stream" "stage1 received"
elif echo "$CHUNK" | grep -q 'data:'; then
  pass "rival SSE stream" "stream started"
else
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 \
    -X POST "$BASE/api/rival" \
    -H "Content-Type: application/json" -d "$RIVAL_INPUT" 2>/dev/null)
  fail "rival SSE stream" "no SSE data (HTTP $STATUS)"
fi
echo ""

# ── 5. Typecheck ─────────────────────────────────────────
echo -e "${DIM}[5] TypeScript${NC}"
if npx tsc --noEmit --project . 2>/dev/null; then
  pass "tsc --noEmit" ""
else
  ERRS=$(npx tsc --noEmit --project . 2>&1 | grep "error TS" | wc -l | tr -d ' ')
  fail "tsc --noEmit" "${ERRS} error(s)"
fi
echo ""

# ── Summary ──────────────────────────────────────────────
echo -e "${CYN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
TOTAL=$((PASS+FAIL+SKIP))
echo -e "  ${GRN}PASS ${PASS}${NC}  ${RED}FAIL ${FAIL}${NC}  ${YEL}SKIP ${SKIP}${NC}  ${DIM}/ ${TOTAL}${NC}"
echo -e "${CYN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
[ $FAIL -gt 0 ] && exit 1 || exit 0
