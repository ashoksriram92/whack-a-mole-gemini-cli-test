#!/usr/bin/env bash
set -e

GITLEAKS_VERSION="v8.18.4"

echo "=== Whack-a-Mole: Secret Scanning Setup ==="
echo ""

# --- Check for pre-commit ---
if ! command -v pre-commit &> /dev/null; then
    echo "ERROR: pre-commit is not installed."
    echo "Install it with: pip3 install pre-commit"
    exit 1
fi
echo "[OK] pre-commit found: $(pre-commit --version)"

# --- Check for / install gitleaks ---
if command -v gitleaks &> /dev/null; then
    echo "[OK] gitleaks found: $(gitleaks version)"
else
    echo "gitleaks not found in PATH. Downloading ${GITLEAKS_VERSION}..."

    OS="$(uname -s)"
    ARCH="$(uname -m)"

    case "${OS}" in
        Linux)
            case "${ARCH}" in
                x86_64)  PLATFORM="linux_x64" ;;
                aarch64) PLATFORM="linux_arm64" ;;
                *)       echo "ERROR: Unsupported Linux architecture: ${ARCH}"; exit 1 ;;
            esac
            ;;
        Darwin)
            case "${ARCH}" in
                x86_64)      PLATFORM="darwin_x64" ;;
                arm64)       PLATFORM="darwin_arm64" ;;
                *)           echo "ERROR: Unsupported macOS architecture: ${ARCH}"; exit 1 ;;
            esac
            ;;
        *)
            echo "ERROR: Unsupported operating system: ${OS}"
            exit 1
            ;;
    esac

    TARBALL="gitleaks_8.18.4_${PLATFORM}.tar.gz"
    URL="https://github.com/gitleaks/gitleaks/releases/download/${GITLEAKS_VERSION}/${TARBALL}"

    INSTALL_DIR="${HOME}/.local/bin"
    mkdir -p "${INSTALL_DIR}"

    echo "Downloading from: ${URL}"
    curl -sSL "${URL}" -o "/tmp/${TARBALL}"
    tar -xzf "/tmp/${TARBALL}" -C /tmp gitleaks
    mv /tmp/gitleaks "${INSTALL_DIR}/gitleaks"
    chmod +x "${INSTALL_DIR}/gitleaks"
    rm -f "/tmp/${TARBALL}"

    if ! echo "${PATH}" | grep -q "${INSTALL_DIR}"; then
        echo ""
        echo "NOTE: Add ${INSTALL_DIR} to your PATH:"
        echo "  export PATH=\"${INSTALL_DIR}:\${PATH}\""
        echo ""
    fi

    echo "[OK] gitleaks installed to ${INSTALL_DIR}/gitleaks"
fi

# --- Install pre-commit hooks ---
echo ""
echo "Installing pre-commit hooks..."
pre-commit install

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  - Gitleaks will now run automatically on every commit"
echo "  - To scan the full repo manually: gitleaks detect --source . --config .gitleaks.toml -v"
echo "  - To run all hooks on existing files: pre-commit run --all-files"
