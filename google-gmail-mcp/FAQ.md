# FAQ — Google's Official Gmail MCP Server

**Can it send email?**
No. The server's scopes are `gmail.readonly` + `gmail.compose` — it can create drafts but there is no send tool. You review drafts in Gmail and send them yourself. If a tutorial shows an MCP auto-sending Gmail, it's a community server, not Google's.

**Is there a GitHub repo I can clone?**
No. This is a remote server hosted by Google at `https://gmailmcp.googleapis.com/mcp/v1`. Nothing runs on your machine.

**Is it free?**
Google hasn't published pricing for the MCP servers. Creating the Cloud project, enabling the APIs, and the OAuth setup cost nothing during the Developer Preview.

**Does it work with a personal @gmail.com account?**
Google's docs don't state a consumer-vs-Workspace restriction explicitly. Setup assumes you bring your own Google Cloud project and OAuth client either way; adding your own address as a test user on the consent screen is the path most people use.

**Which AI clients are supported?**
Google's docs cover Claude (custom connector) and Antigravity. Other clients that support remote MCP servers with OAuth can be configured manually, with mixed results reported.

**Why does auth keep failing / looping?**
Known preview pain. Claude Code's built-in Gmail integration has an OAuth-client bug ([#51326](https://github.com/anthropics/claude-code/issues/51326)); Antigravity and Cursor users also report failed or half-connected auth. Using a Claude custom connector with your own OAuth client ID/secret is the most reliable documented path right now.

**Why do I have to re-authenticate every week?**
Preview users report tokens needing a refresh roughly every 7 days. Expect it until GA.

**Can it access Google Docs or Sheets?**
Not in the official suite. Official servers exist for Gmail, Drive, Calendar, Chat, and People only. Docs/Sheets MCP servers you see elsewhere are community-built.

**Can it delete or archive email?**
No delete tool. Labels are the only mutation besides drafts, so you can approximate workflows (e.g. a "Processed" label) but not destructive actions.

**Official docs:**
- Configure MCP servers: https://developers.google.com/workspace/guides/configure-mcp-servers
- Gmail MCP guide: https://developers.google.com/workspace/gmail/api/guides/configure-mcp-server
- Tool reference: https://developers.google.com/workspace/gmail/api/reference/mcp

Got a question that isn't here, or spotted a mistake? Open an issue or PR.
