#!/bin/bash
# Test script for attestation features
# Tests signup, sign, and verify operations with attestation generation

set -e

API_URL="${API_URL:-http://localhost:3000}"
USER_ID="test-user-$(date +%s)"
MESSAGE="Test message for attestation"

echo "🧪 Testing Attestation Features v1.4.0"
echo "======================================"
echo "API URL: $API_URL"
echo "User ID: $USER_ID"
echo ""

# Test 1: Signup with attestation
echo "1️⃣ Testing Signup with Attestation..."
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/api/users" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_ID\"}")

echo "Response: $SIGNUP_RESPONSE" | jq '.'

if echo "$SIGNUP_RESPONSE" | jq -e '.t16zVerificationUrl' > /dev/null; then
  echo "✅ Signup: t16z verification URL present"
  echo "   URL: $(echo "$SIGNUP_RESPONSE" | jq -r '.t16zVerificationUrl')"
else
  echo "❌ Signup: Missing t16z verification URL"
fi

echo ""

# Test 2: Sign message with attestation
echo "2️⃣ Testing Sign with Attestation..."
SIGN_RESPONSE=$(curl -s -X POST "$API_URL/api/users/$USER_ID/sign" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"$MESSAGE\"}")

echo "Response: $SIGN_RESPONSE" | jq '.'

if echo "$SIGN_RESPONSE" | jq -e '.t16zVerificationUrl' > /dev/null; then
  echo "✅ Sign: t16z verification URL present"
  echo "   URL: $(echo "$SIGN_RESPONSE" | jq -r '.t16zVerificationUrl')"
else
  echo "❌ Sign: Missing t16z verification URL"
fi

# Extract signature for verification test
SIGNATURE=$(echo "$SIGN_RESPONSE" | jq -r '.signature')
ADDRESS=$(echo "$SIGN_RESPONSE" | jq -r '.address')

echo ""

# Test 3: Verify signature with attestation
echo "3️⃣ Testing Verify with Attestation..."
VERIFY_RESPONSE=$(curl -s -X POST "$API_URL/api/verify" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"$MESSAGE\", \"signature\": \"$SIGNATURE\", \"address\": \"$ADDRESS\"}")

echo "Response: $VERIFY_RESPONSE" | jq '.'

if echo "$VERIFY_RESPONSE" | jq -e '.t16zVerificationUrl' > /dev/null; then
  echo "✅ Verify: t16z verification URL present"
  echo "   URL: $(echo "$VERIFY_RESPONSE" | jq -r '.t16zVerificationUrl')"
else
  echo "❌ Verify: Missing t16z verification URL"
fi

if echo "$VERIFY_RESPONSE" | jq -e '.valid' | grep -q true; then
  echo "✅ Verify: Signature validation successful"
else
  echo "❌ Verify: Signature validation failed"
fi

echo ""

# Test 4: Check audit logs
echo "4️⃣ Checking Audit Logs..."
AUDIT_RESPONSE=$(curl -s "$API_URL/api/audit-logs?userId=$USER_ID")

AUDIT_COUNT=$(echo "$AUDIT_RESPONSE" | jq '.logs | length')
echo "Found $AUDIT_COUNT audit log entries for user $USER_ID"

if [ "$AUDIT_COUNT" -ge 3 ]; then
  echo "✅ Audit logs: All operations logged"
  echo "$AUDIT_RESPONSE" | jq '.logs[] | {action: .action, hasAttestation: (.attestation != null), hasT16zUrl: (.attestation.t16zVerificationUrl != null)}'
else
  echo "⚠️ Audit logs: Expected 3 entries, found $AUDIT_COUNT"
fi

echo ""
echo "======================================"
echo "🎯 Test Summary:"
echo "- Signup attestation: $(echo "$SIGNUP_RESPONSE" | jq -e '.t16zVerificationUrl' > /dev/null 2>&1 && echo "✅ PASS" || echo "❌ FAIL")"
echo "- Sign attestation: $(echo "$SIGN_RESPONSE" | jq -e '.t16zVerificationUrl' > /dev/null 2>&1 && echo "✅ PASS" || echo "❌ FAIL")"
echo "- Verify attestation: $(echo "$VERIFY_RESPONSE" | jq -e '.t16zVerificationUrl' > /dev/null 2>&1 && echo "✅ PASS" || echo "❌ FAIL")"
echo "- Signature validation: $(echo "$VERIFY_RESPONSE" | jq -e '.valid' | grep -q true 2>&1 && echo "✅ PASS" || echo "❌ FAIL")"
echo "- Audit logging: $([ "$AUDIT_COUNT" -ge 3 ] && echo "✅ PASS" || echo "⚠️ WARN")"
echo ""
echo "Note: This test requires a running instance with TEE support."
echo "Run with: API_URL=http://your-server:3000 ./scripts/test-attestation.sh"