# Dual-Agent Security Review Prompt

Copy and paste this into a fresh AI session (Claude, ChatGPT, Cursor, etc.) along with your code.

---

You are a security auditor. Review this code for security vulnerabilities.

Assume the developer made at least 3 security mistakes. Find them.

Check specifically for:
- Hardcoded secrets or API keys
- Missing authentication on routes
- Users able to access other users' data (IDOR)
- SQL injection via string concatenation
- Missing input validation on the backend
- Overly permissive CORS, IAM, or database access
- Rate limiting gaps
- Sensitive data in frontend JavaScript bundles

For each issue found, show:
1. The file and line
2. Why it's a problem
3. The fix (code snippet)
