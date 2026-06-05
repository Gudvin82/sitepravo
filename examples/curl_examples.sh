#!/usr/bin/env bash
# SitePravo — примеры curl
# https://sitepravo.ru

BASE="https://sitepravo.ru/api"

# ──────────────────────────────────────────────
# 1. Запустить аудит
# ──────────────────────────────────────────────
echo "=== Запуск аудита ==="
RESPONSE=$(curl -s -X POST "$BASE/audits" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "consentAccepted": true, "legalBasisConfirmed": true}')

echo "$RESPONSE"
AUDIT_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Audit ID: $AUDIT_ID"


# ──────────────────────────────────────────────
# 2. Получить результат (polling)
# ──────────────────────────────────────────────
echo -e "\n=== Ожидание результата ==="
for i in $(seq 1 60); do
  sleep 5
  RESULT=$(curl -s "$BASE/audits/$AUDIT_ID")
  STATUS=$(echo "$RESULT" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
  echo "  ($i) status: $STATUS"
  if [ "$STATUS" = "completed" ] || [ "$STATUS" = "failed" ]; then
    break
  fi
done


# ──────────────────────────────────────────────
# 3. Вывести grade и количество находок
# ──────────────────────────────────────────────
echo -e "\n=== Результат ==="
echo "$RESULT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f'Grade: {d.get(\"grade\",\"?\")}  Score: {d.get(\"score\",0)}')
s = d.get('summary', {})
print(f'Findings: critical={s.get(\"critical\",0)}, high={s.get(\"high\",0)}, medium={s.get(\"medium\",0)}, low={s.get(\"low\",0)}')
for f in d.get('findings',[])[:5]:
    print(f'  [{f[\"severity\"]}] {f[\"category\"]}: {f[\"title\"]}')
"


# ──────────────────────────────────────────────
# 4. Запустить и дождаться — однострочник jq
# (требует jq: brew install jq / apt install jq)
# ──────────────────────────────────────────────
# AUDIT_ID=$(curl -s -X POST "$BASE/audits" -H "Content-Type: application/json" \
#   -d '{"url":"https://example.com"}' | jq -r '.id')
#
# while true; do
#   R=$(curl -s "$BASE/audits/$AUDIT_ID")
#   S=$(echo "$R" | jq -r '.status')
#   [ "$S" = "completed" ] && echo "$R" | jq '{grade:.grade,score:.score,summary:.summary}' && break
#   sleep 5
# done
