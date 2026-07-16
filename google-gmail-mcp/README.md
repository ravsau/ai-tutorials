# Google's Official Gmail MCP Server — Setup + Automation Guide

Google now runs an **official, hosted MCP server for Gmail** (`gmailmcp.googleapis.com`), part of its Workspace MCP servers suite (Gmail, Drive, Calendar, Chat, People). You connect an AI client like Claude to it over OAuth and automate your inbox in plain English: triage, labels, thread summaries, draft replies.

Two things most coverage gets wrong, so let's say them up front:

1. **It cannot send email.** The server exposes `gmail.readonly` + `gmail.compose` scopes — it can search, read, label, and create drafts, but there is no send tool. You review drafts in Gmail and hit send yourself. This is deliberate (and honestly, the safe design).
2. **This is a remote server run by Google, in Developer Preview.** There's no GitHub repo to clone and no local process to run. Don't confuse it with the many community `gmail-mcp` servers on GitHub — those are third-party.

Status as of July 2026: Developer Preview (early-access program signup required). Google has not published pricing, a GA date, or rate limits.

## What you need

- A Google account with Gmail
- A Google Cloud project (free to create)
- The [gcloud CLI](https://cloud.google.com/sdk/docs/install) — optional; everything below can also be done in the Cloud Console UI
- Enrollment in the [Google Workspace Developer Preview Program](https://developers.google.com/workspace/preview)
- An MCP client — Google's docs cover **Claude** (claude.ai custom connector) and **Antigravity**; other clients can be wired manually if they support remote MCP with OAuth

## Step 0 — Install the gcloud CLI (or skip and use the Console)

If you don't have `gcloud` yet:

```bash
# macOS
brew install --cask gcloud-cli

# then authenticate and pick your project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

Other platforms: https://cloud.google.com/sdk/docs/install. If you'd rather not install anything, every `gcloud` step below has a Cloud Console equivalent — just search the API name in the [API Library](https://console.cloud.google.com/apis/library).

## Step 1 — Enable the APIs

In your Google Cloud project, enable the Gmail API and the Gmail MCP API:

```bash
gcloud services enable gmail.googleapis.com --project=YOUR_PROJECT_ID
gcloud services enable gmailmcp.googleapis.com --project=YOUR_PROJECT_ID
```

(Or search for both in the Cloud Console API Library and click Enable.)

## Step 2 — Create OAuth credentials

1. In the Cloud Console, go to **APIs & Services → OAuth consent screen** and configure it (External is fine for testing; add your own Gmail address as a test user).
2. Add these scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/gmail.compose`
3. Go to **Credentials → Create Credentials → OAuth client ID** (Web application).
4. Add the redirect URI for your client:
   - Claude: `https://claude.ai/api/mcp/auth_callback`
   - Antigravity: `https://antigravity.google/oauth-callback`
5. Save the **client ID** and **client secret**.

## Step 3 — Connect your client

### Claude (custom connector)

1. In Claude, go to **Settings → Connectors → Add custom connector**.
2. Server URL: `https://gmailmcp.googleapis.com/mcp/v1`
3. Under Advanced, paste your OAuth client ID and client secret.
4. Complete the Google sign-in when prompted.

### Antigravity

Add to `~/.gemini/antigravity/mcp_config.json`:

```json
{
  "mcpServers": {
    "gmail": {
      "serverUrl": "https://gmailmcp.googleapis.com/mcp/v1",
      "oauth": {
        "clientId": "YOUR_CLIENT_ID",
        "clientSecret": "YOUR_CLIENT_SECRET"
      }
    }
  }
}
```

Heads up: multiple community reports say the OAuth flow fails in some clients right now (see Gotchas below). If auth loops, you're not doing it wrong — it's preview software.

## The 10 tools you get

| Tool | What it does |
|------|-------------|
| `search_threads` | Search your mailbox with Gmail query syntax |
| `get_thread` | Read a full email thread |
| `create_draft` | Write a draft (new email or reply) — **not send** |
| `list_drafts` | List existing drafts |
| `list_labels` | List your labels |
| `create_label` | Create a new label |
| `label_message` / `unlabel_message` | Add/remove a label on one message |
| `label_thread` / `unlabel_thread` | Add/remove a label on a whole thread |

That's it. No send, no delete, no archive-as-such (labels can get you close), no attachments upload.

## Automations that actually work (demo prompts)

See [demo-prompts.md](demo-prompts.md) for the full copy-paste set. The five patterns that map cleanly onto the 10 tools:

1. **Inbox triage + auto-labeling** — search unread mail, classify, apply labels like `Action Needed` / `FYI` / `Newsletter`.
2. **Draft replies for review** — find threads waiting on your reply, draft a response for each, leave them in Drafts for you to review and send.
3. **Thread digests** — summarize everything that happened in your inbox this week, grouped by project or sender.
4. **Follow-up detection** — find sent threads with no reply after N days and draft polite nudges.
5. **Smart spam rescue** — read what's sitting in Spam, decide keep-or-rescue per message with a reason, and pull the false positives back to the inbox by removing the `SPAM` label. The recruiter and the invoice get rescued; the "you won a gift card" scam stays put. This is the strongest live demo beat because it shows judgment, not a blanket rule.

## Seed a demo inbox (for testing or recording)

To show triage or spam-rescue convincingly, you need a demo inbox that actually looks lived-in: receipts, a recruiter, an invoice, newsletters, a real calendar invite, and a couple of obvious scams. A fresh empty inbox demos nothing.

The official server can't send, so you seed the inbox from a **separate** path — a community server or a small local script using the send-only `gmail.send` scope. A repeatable setup that works well:

- Send **12–17 messages** across distinct categories (actionable, finance, receipt, travel, newsletter, recruiter, support, personal, promo). Variety is what makes triage look smart.
- Use **free-form display names** ("Acme Store", "SkyRoute Airlines") so the inbox looks multi-sender even though the envelope address is one account.
- Include one **real calendar invite** (an `.ics` part with `METHOD:REQUEST`) so Gmail renders Accept/Decline.
- Include one **obvious scam** ("you won a $1,000 gift card") so the spam-rescue demo has something it should correctly *keep* in Spam.
- Keep everything **clearly fictional**: made-up brands, `example.com` links, no real-bank impersonation, no phishing, low volume. That stays inside Gmail's terms.

Safety for the sending account:

- The `gmail.send` scope is **send-only**. It cannot read the sender's inbox, so it never touches your access codes.
- Send from a demo or throwaway account, not your main.
- **Revoke when done:** delete the local token file, then revoke the grant at `https://oauth2.googleapis.com/revoke?token=<refresh_token>` or remove the app at [myaccount.google.com/permissions](https://myaccount.google.com/permissions).

## Gotchas (as of July 2026)

- **Draft-only is a hard limit.** People have asked for a send tool ([claude-code#32266](https://github.com/anthropics/claude-code/issues/32266)); the hosted server doesn't have one. The safe pattern is draft → human review → send.
- **Claude Code's built-in Gmail MCP has a known OAuth bug** where it routes through the "Claude for Google Drive" OAuth client, so Gmail permissions can't be granted ([claude-code#51326](https://github.com/anthropics/claude-code/issues/51326)). The custom-connector path above with your own OAuth client avoids that client entirely.
- **Antigravity OAuth reportedly fails** for some users despite being Google's own tool; Cursor users report "connected" status but Unauthorized tool calls.
- **Token refresh:** preview users report needing to re-auth roughly every 7 days. Expect to redo the Google sign-in periodically.
- **Docs and Sheets are not in the official suite.** Only Gmail, Drive, Calendar, Chat, and People have official servers; anything offering Docs/Sheets MCP is community-built.

## Three ways to connect Claude to Gmail

There are actually three paths, and it's easy to mix them up:

| | Google official | claude.ai built-in connector | Community (e.g. Python gmail-mcp) |
|---|---|---|---|
| Who runs it | Google (remote) | Anthropic (remote) | Your machine |
| Setup | OAuth + your own Cloud project + preview enrollment | One toggle in claude.ai settings | Clone, configure, run |
| Auth | OAuth, your own Cloud project | OAuth handled by Anthropic | Usually your own OAuth credentials |
| Can send email | **No** | **No** (read, label, draft) | Usually yes |
| Maintenance | Google | Anthropic | Repo owner |
| Trust surface | Google-hosted, scoped read+compose | Anthropic-hosted, read+label+draft | Full API access you grant it |

- **Fastest to demo:** the claude.ai built-in connector. Zero Cloud setup, and it's already MCP under the hood.
- **Best "it's Google's own standard" story:** the official server (this guide).
- **Only path that can auto-send:** a community server, and you accept the risk.

### Safety: connect to a demo account, not your main

Every read-capable connector can see **everything** in the mailbox it's linked to, including one-time codes and password resets. When you're recording or testing, link the connector to a throwaway demo inbox, never your primary account. If you already connected your main and want out: disconnect it in the client, then remove the app at [myaccount.google.com/permissions](https://myaccount.google.com/permissions).

## FAQ

Top questions are answered in [FAQ.md](FAQ.md) — if I got something wrong, open a PR or an issue.

---

Part of [CloudYeti AI tutorials](https://github.com/ravsau/ai-tutorials) · [YouTube](https://www.youtube.com/@CloudYeti) · [1:1 help](https://cloudyeti.io/meet)
