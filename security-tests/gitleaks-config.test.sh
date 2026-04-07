#!/usr/bin/env bash
set -e

GITLEAKS="/tmp/gitleaks"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMPDIR_BASE="$(mktemp -d)"
TESTS_RUN=0
TESTS_FAILED=0

cleanup() {
    rm -rf "${TMPDIR_BASE}"
}
trap cleanup EXIT

pass() {
    TESTS_RUN=$((TESTS_RUN + 1))
    echo "ok ${TESTS_RUN} - $1"
}

fail() {
    TESTS_RUN=$((TESTS_RUN + 1))
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo "not ok ${TESTS_RUN} - $1"
}

echo "1..4"

# ---------- Test 1: .gitleaks.toml is valid ----------
set +e
"${GITLEAKS}" detect --source "${REPO_ROOT}" --config "${REPO_ROOT}/.gitleaks.toml" -v > /dev/null 2>&1
EXIT_CODE=$?
set -e

if [ "${EXIT_CODE}" -eq 0 ]; then
    pass ".gitleaks.toml is valid and repo has no leaks"
else
    fail ".gitleaks.toml validation failed (exit code ${EXIT_CODE})"
fi

# ---------- Test 2: Detect fake AWS access key ----------
TMPDIR2="${TMPDIR_BASE}/test2"
mkdir -p "${TMPDIR2}"
cat > "${TMPDIR2}/secrets.txt" <<'EOF'
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
EOF
(
    cd "${TMPDIR2}"
    git init -q
    git config user.email "test@test.com"
    git config user.name "Test"
    git add .
    git commit -q -m "add secrets"
) > /dev/null 2>&1

set +e
"${GITLEAKS}" detect --source "${TMPDIR2}" -v > /dev/null 2>&1
EXIT_CODE=$?
set -e

if [ "${EXIT_CODE}" -eq 1 ]; then
    pass "gitleaks detects fake AWS access key"
else
    fail "gitleaks did not detect fake AWS access key (exit code ${EXIT_CODE})"
fi

# ---------- Test 3: Detect fake generic API key ----------
TMPDIR3="${TMPDIR_BASE}/test3"
mkdir -p "${TMPDIR3}"
cat > "${TMPDIR3}/config.txt" <<'EOF'
api_key = "sk-1234567890abcdef1234567890abcdef1234567890abcdef"
EOF
(
    cd "${TMPDIR3}"
    git init -q
    git config user.email "test@test.com"
    git config user.name "Test"
    git add .
    git commit -q -m "add api key"
) > /dev/null 2>&1

set +e
"${GITLEAKS}" detect --source "${TMPDIR3}" -v > /dev/null 2>&1
EXIT_CODE=$?
set -e

if [ "${EXIT_CODE}" -eq 1 ]; then
    pass "gitleaks detects fake generic API key"
else
    fail "gitleaks did not detect fake generic API key (exit code ${EXIT_CODE})"
fi

# ---------- Test 4: Safe patterns are not flagged ----------
TMPDIR4="${TMPDIR_BASE}/test4"
mkdir -p "${TMPDIR4}"
cat > "${TMPDIR4}/safe.txt" <<'EOF'
API_URL=https://example.com/api/v1
REGION=us-east-1
EOF
(
    cd "${TMPDIR4}"
    git init -q
    git config user.email "test@test.com"
    git config user.name "Test"
    git add .
    git commit -q -m "add safe config"
) > /dev/null 2>&1

set +e
"${GITLEAKS}" detect --source "${TMPDIR4}" -v > /dev/null 2>&1
EXIT_CODE=$?
set -e

if [ "${EXIT_CODE}" -eq 0 ]; then
    pass "safe patterns are not flagged"
else
    fail "safe patterns were incorrectly flagged (exit code ${EXIT_CODE})"
fi

# ---------- Summary ----------
echo ""
if [ "${TESTS_FAILED}" -eq 0 ]; then
    echo "All ${TESTS_RUN} tests passed"
    exit 0
else
    echo "${TESTS_FAILED} of ${TESTS_RUN} tests failed"
    exit 1
fi
