> **⚠️ Important Security Notice**
>
> Never report security vulnerabilities through public GitHub issues, discussions, or pull requests.

## Reporting a Vulnerability

If you believe you've found a security vulnerability in Schema Sentry, please follow these steps:

### 1. Private Disclosure (Preferred)

**GitHub Private Vulnerability Reporting:**
- Go to [Security Advisories](https://github.com/arindamdawn/schema-sentry/security/advisories)
- Click "New draft security advisory"
- Provide details about the vulnerability

**Email (Alternative):**
- Send an email to: `security@schema-sentry.dev` (if available) or reach out via GitHub Discussions requesting a private contact method
- Include:
  - Type of vulnerability
  - Steps to reproduce
  - Potential impact
  - Suggested fix (if any)

### 2. What to Expect

- **Acknowledgment:** Within 48 hours
- **Assessment:** Within 7 days
- **Resolution:** Depends on severity
  - Critical: 7-14 days
  - High: 14-30 days
  - Medium/Low: 30-90 days

### 3. Disclosure Timeline

We follow responsible disclosure:
1. Fix developed and tested
2. Patch released
3. Public disclosure after 30 days or sooner if actively exploited

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

## Security Best Practices

When using Schema Sentry:

- Keep packages updated to latest version
- Validate all user-generated content before passing to builders
- Use strict TypeScript settings
- Review CLI output in CI logs for sensitive data

## Acknowledgments

We appreciate the security researchers and community members who help keep Schema Sentry secure. Contributors will be acknowledged in release notes (with permission).

---

Thank you for helping keep Schema Sentry and its users safe! 🔒
