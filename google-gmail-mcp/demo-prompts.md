# Gmail MCP — Copy-Paste Demo Prompts

These all work within the official server's 10 tools (search, read, label, draft). None of them require a send tool.

## 1. Inbox triage + auto-labeling

```
Search my inbox for unread emails from the last 3 days. Classify each thread as
"Action Needed" (someone is waiting on me), "FYI" (informational, no reply needed),
or "Newsletter". Create those three labels if they don't exist, then apply them.
Give me a table of what you labeled and why.
```

## 2. Draft replies for review

```
Find threads from the last week where the last message is addressed to me and I
haven't replied. For each one, draft a short reply in my normal tone: acknowledge,
answer what you can from the thread, and flag anything you'd need me to fill in
with [BRACKETS]. Leave everything in Drafts — do not assume anything you can't
see in the thread.
```

## 3. Weekly thread digest

```
Search my inbox for everything from the last 7 days, excluding newsletters and
notifications. Group threads by sender or project, and give me a digest: what
happened, what's unresolved, and which threads need a reply from me first.
```

## 4. Follow-up detection

```
Search my sent mail for threads from 4-14 days ago where I asked a question or
made a request and nobody replied. List them, and draft a short, polite follow-up
for each. Keep the drafts under 60 words.
```

## 5. Smart spam rescue

```
Search my Spam folder (in:spam) from the last 14 days. Read each thread. For each
one, tell me keep-as-spam or rescue, with a one-line reason. For the ones that are
clearly legitimate (a recruiter, an invoice, a support reply, a booking), rescue
them by removing the SPAM label and adding INBOX. Leave anything that is actually
junk — prize-bait, gift-card scams, fake urgency — exactly where it is. Give me a
table of what you moved and what you left.
```

Pair this with a cautious-reply rule when drafting for anything sensitive:

```
When you draft replies, do not draft anything that sends money, credentials, or
bank-transfer details. If an email asks for those, draft a reply that verifies the
request through another channel first, and flag it for me instead of answering it.
```

## 6. Label cleanup audit

```
List all my labels. Search for how many threads from the last 30 days actually
use each one. Tell me which labels are dead weight and propose a simpler set —
but don't change anything until I confirm.
```

## Tips

- Gmail search syntax works inside `search_threads` — `from:`, `newer_than:7d`, `is:unread`, `has:attachment`, `-category:promotions` all behave like the Gmail search bar.
- For draft replies, tell the model to mark unknowns with `[BRACKETS]` instead of guessing. You're the send button; make review fast.
- Run triage on a schedule from an agent client and the labels become your morning queue.
