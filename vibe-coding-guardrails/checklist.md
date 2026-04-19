VIBE CODING SECURITY CHECKLIST
Run before every deploy.

[ ] No secrets in code or git history
[ ] No API keys in frontend JavaScript
[ ] Auth on every sensitive route
[ ] Ownership checks on user data
[ ] Database RLS enabled (or API layer in front)
[ ] Rate limiting on all endpoints
[ ] Parameterized queries only
[ ] Backend validation matches frontend

BONUS:
[ ] CORS not set to * in production
[ ] Debug mode off
[ ] Security headers (helmet)
[ ] Cookies: HttpOnly, Secure, SameSite
[ ] Prompt injection protection (if AI features)
