const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

describe('.pre-commit-config.yaml', () => {
    const filePath = path.join(repoRoot, '.pre-commit-config.yaml');

    it('should exist', () => {
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should contain the gitleaks hook reference', () => {
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('gitleaks');
    });

    it('should contain the gitleaks repo URL', () => {
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('https://github.com/gitleaks/gitleaks');
    });
});

describe('.gitleaks.toml', () => {
    const filePath = path.join(repoRoot, '.gitleaks.toml');

    it('should exist', () => {
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should contain an [allowlist] section', () => {
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('[allowlist]');
    });

    it('should contain a package-lock.json path pattern', () => {
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('package-lock');
    });
});

describe('.gitleaksignore', () => {
    const filePath = path.join(repoRoot, '.gitleaksignore');

    it('should exist', () => {
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should contain usage instructions as comments', () => {
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toMatch(/^#/m);
    });
});

describe('.github/workflows/secret-scan.yml', () => {
    const filePath = path.join(repoRoot, '.github', 'workflows', 'secret-scan.yml');

    it('should exist', () => {
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should contain the gitleaks-action reference', () => {
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('gitleaks/gitleaks-action');
    });

    it('should trigger on push', () => {
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('push');
    });

    it('should trigger on pull_request', () => {
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('pull_request');
    });

    it('should reference GITHUB_TOKEN', () => {
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('GITHUB_TOKEN');
    });
});

describe('scripts/setup-hooks.sh', () => {
    const filePath = path.join(repoRoot, 'scripts', 'setup-hooks.sh');

    it('should exist', () => {
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should be executable', () => {
        const stats = fs.statSync(filePath);
        // Check that at least one execute bit is set
        expect(stats.mode & 0o111).toBeGreaterThan(0);
    });

    it('should contain the pre-commit install command', () => {
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('pre-commit install');
    });

    it('should contain gitleaks download logic with curl', () => {
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('curl');
    });
});

describe('SECURITY.md', () => {
    const filePath = path.join(repoRoot, 'SECURITY.md');

    it('should exist', () => {
        expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should contain the Setting Up Local Hooks section', () => {
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('Setting Up Local Hooks');
    });

    it('should contain the Handling False Positives section', () => {
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('Handling False Positives');
    });

    it('should contain the What to Do If a Secret Is Committed section', () => {
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('What to Do If a Secret Is Committed');
    });

    it('should contain the Best Practices section', () => {
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('Best Practices');
    });
});

describe('.gitignore', () => {
    const filePath = path.join(repoRoot, '.gitignore');

    it('should contain the gitleaks-report pattern', () => {
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).toContain('gitleaks-report');
    });
});
