# Security

This repository uses automated secret scanning to prevent credentials and other sensitive data from being committed to version control.

## Overview

Two layers of protection are in place:

1. **Pre-commit hook (local)** - Gitleaks scans staged files before each commit. If a secret is detected, the commit is blocked.
2. **CI workflow (remote)** - A GitHub Actions workflow runs Gitleaks on every push to `main` and on every pull request. If a secret is detected, the check fails.

## Setting Up Local Hooks

Run the setup script to install the pre-commit hook and download the Gitleaks binary:

```bash
bash scripts/setup-hooks.sh
```

This will:
- Verify that `pre-commit` is installed (install with `pip3 install pre-commit` if needed)
- Download the Gitleaks binary for your platform if it is not already available
- Run `pre-commit install` to register the hook in your local `.git/hooks/`

## How Pre-commit Hooks Work

When you run `git commit`, the pre-commit framework intercepts the commit and runs Gitleaks against your staged files. If Gitleaks finds anything that looks like a secret (API keys, tokens, passwords, private keys, etc.), the commit is rejected with a description of the finding.

You can also scan all files manually:

```bash
pre-commit run --all-files
```

Or run Gitleaks directly:

```bash
gitleaks detect --source . --config .gitleaks.toml -v
```

## How CI Scanning Works

The GitHub Actions workflow at `.github/workflows/secret-scan.yml` runs on:
- Every push to the `main` branch
- Every pull request

It uses the official `gitleaks/gitleaks-action@v2` action. If secrets are detected, the workflow fails and the findings appear in the Actions log.

## Handling False Positives

If Gitleaks flags something that is not actually a secret:

1. Run Gitleaks with JSON output to get the fingerprint:
   ```bash
   gitleaks detect --source . --config .gitleaks.toml --report-format json --report-path report.json
   ```
2. Open `report.json` and copy the `Fingerprint` value for the false positive.
3. Add the fingerprint to `.gitleaksignore` (one per line).
4. Delete the `report.json` file.

For path-based exclusions (e.g., generated files), add a path regex to the `[[allowlist]]` in `.gitleaks.toml`.

## What to Do If a Secret Is Committed

If a real secret (AWS credentials, API tokens, passwords, private keys) is accidentally committed:

1. **Rotate the credential immediately.** Assume it has been compromised. Generate a new key/token/password in the relevant service (AWS Console, API provider dashboard, etc.).
2. **Remove the secret from Git history.** Use a tool like [git-filter-repo](https://github.com/newren/git-filter-repo) or [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) to rewrite history.
3. **Force-push the cleaned history** and notify all contributors to re-clone or rebase.
4. **Verify** the secret no longer appears by running `gitleaks detect` on the full repo.

Do not simply delete the secret in a new commit. Git history preserves all previous versions, so the secret remains accessible until history is rewritten.

## Best Practices for This Repository

- **Never hardcode AWS credentials.** Use environment variables, IAM roles, or AWS profiles instead.
- **Use environment variables** for any sensitive configuration (database passwords, API tokens, signing keys).
- **Do not disable the pre-commit hook.** If you need to bypass it for a specific commit, understand the risk and ensure no secrets are included.
- **Keep `.gitleaks.toml` updated** if new file patterns need to be excluded (e.g., new lock files or generated test fixtures).
- **Review CI scan results** on pull requests before merging.
