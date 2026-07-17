# Decision: Out-of-scope findings that belong to a related ticket get commented there, untagged

**Issue:** [#98](https://github.com/mekhal/aidlc-radio-calico/issues/98) (Ticket A, #99, Code PR [#102](https://github.com/mekhal/aidlc-radio-calico/pull/102))
**Decided by:** @mekhal, 2026-07-17

## Decision

When work on one sub-ticket surfaces something out of scope that a **related, already-sequenced** ticket will own (e.g. Ticket A → B → C under the same parent story), the agent posts a plain comment documenting the finding **on that downstream ticket** instead of opening a brand-new issue.

- The comment must **not tag `@claude`** — the human tags the agent themselves when they actually start work on that ticket.
- This is an exception to, not a replacement for, the existing "missed functionality → new issue" rule: a new issue is still the right move when no related ticket already exists to receive the finding.

## Why

During review of PR #102 (Ticket A / #99), the agent flagged that the fixed `body { padding-bottom: 5.5rem; }` value could fall short of AC2 ("padding equal to the footer's rendered height") once the footer wraps to 3+ lines on narrow viewports — a responsive-layout concern explicitly sequenced into Ticket B (#100), not Ticket A. Rather than opening a disconnected new issue or expanding Ticket A's scope, the human asked that this kind of finding be left as a comment directly on the ticket that will actually pick it up (#100), without an `@claude` tag, so the tag only fires when the human is ready to start that ticket's loop.

## Impact

- `CLAUDE.md` Hard rules and Core principles now carry this exception alongside the "missed functionality → new issue" rule.
- `README.md` / `README.th.md` Rules of Engagement sections synced with the same note.
- Applied immediately: the padding-bottom/responsive finding was posted as an untagged comment on #100.
