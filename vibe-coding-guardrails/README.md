# Vibe Coding Guardrails

**Check these before you ship. Most fixes take minutes.**

Companion repo for the CloudYeti video: [8 Security Holes in Every Vibe-Coded App](https://youtu.be/A1rzbFsyu0w)

---

## Quick Start

Install a pre-commit hook that blocks secrets before they reach GitHub:

```bash
pip install pre-commit
cp starters/.pre-commit-config.yaml .pre-commit-config.yaml
pre-commit install
```

That's it. Every `git commit` now scans for leaked keys automatically.

---

## The 8 Holes

| # | Hole | What Happens | Fix | Tool |
|---|------|-------------|-----|------|
| 1 | **Secrets in Code** | API keys in source code and git history | `.env` + `.gitignore` | [gitleaks](https://github.com/gitleaks/gitleaks) |
| 2 | **Tokens in Frontend** | AI keys visible in browser JS bundle | Move to server-side route | -- |
| 3 | **Auth Missing** | Some routes have no login check | Router-level middleware | -- |
| 4 | **Users See Others' Data** | Change user ID in URL = full access (IDOR) | Ownership check per route | -- |
| 5 | **Database Wide Open** | Supabase RLS disabled = anyone reads anything | Enable RLS + policies | -- |
| 6 | **No Rate Limiting** | Bots hit your AI endpoint ($40/min in API costs) | Add rate limiter | [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) |
| 7 | **SQL Injection** | AI writes `f"SELECT * WHERE id={input}"` | Parameterized queries / ORM | -- |
| 8 | **Frontend-Only Validation** | Backend accepts anything the browser sends | Pydantic (Python) / Zod (TS) | -- |

---

## Bonus Checks

- [ ] CORS not set to `*` in production
- [ ] Verbose error messages turned off (no stack traces to users)
- [ ] Security headers added ([helmet](https://github.com/helmetjs/helmet))
- [ ] Cookies set to `HttpOnly`, `Secure`, `SameSite`
- [ ] Prompt injection protection if your app has AI features

---

## The Dual-Agent Security Review

Your coding AI has a blind spot: it wrote the code, so it thinks the code is fine.

Send your code to a **different** AI session with this prompt:

> *"You are a security auditor. Review this code for security vulnerabilities. Assume the developer made at least 3 mistakes. Find them."*

Keep going back and forth until both agents stop finding new issues.

The full prompt is in [`starters/dual-agent-prompt.md`](starters/dual-agent-prompt.md) -- copy and paste it.

---

## Starter Files

| File | What It Does |
|------|-------------|
| [`starters/.pre-commit-config.yaml`](starters/.pre-commit-config.yaml) | Gitleaks pre-commit hook config |
| [`starters/dual-agent-prompt.md`](starters/dual-agent-prompt.md) | Security audit prompt to paste into any AI |
| [`starters/supabase-rls-example.sql`](starters/supabase-rls-example.sql) | Copy-paste RLS policies for Supabase |
| [`starters/express-security.js`](starters/express-security.js) | Helmet + rate limiting setup for Express |
| [`checklist.md`](checklist.md) | Plain text checklist to run before every deploy |

---

## Tools

| Tool | What It Does | Link |
|------|-------------|------|
| gitleaks | Blocks secrets in commits | https://github.com/gitleaks/gitleaks |
| TruffleHog | Deep secret scanning in CI | https://github.com/trufflesecurity/trufflehog |
| helmet | Security headers for Express | https://github.com/helmetjs/helmet |
| express-rate-limit | Rate limiting | https://github.com/express-rate-limit/express-rate-limit |
| OWASP ZAP | Free DAST scanner | https://www.zaproxy.org/ |
| Pydantic | Python validation | https://docs.pydantic.dev/ |
| Zod | TypeScript validation | https://zod.dev/ |

---

## Sources

- [RedHunt Labs](https://redhuntlabs.com/) -- secret exposure research
- [Escape.tech](https://escape.tech/) -- API security scanning
- [Wiz / Moltbook](https://www.wiz.io/) -- cloud security research
- [The Register / Lovable disclosure](https://www.theregister.com/) -- vibe coding vulnerability reporting
- [TechCrunch / Mercor](https://techcrunch.com/) -- AI-generated code security coverage
- [Checkmarx](https://checkmarx.com/) -- SAST/DAST research

---

Built by [CloudYeti](https://cloudyeti.io)
