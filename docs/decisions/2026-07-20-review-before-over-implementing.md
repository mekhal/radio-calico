# Decision: "Ask when in doubt" extended to cover over-implementing, not just gate approvals

**Issue:** [#99](https://github.com/mekhal/aidlc-radio-calico/issues/99)
**Decided by:** @mekhal, 2026-07-20

## Decision

`CLAUDE.md`'s "Ask when in doubt" rule previously only covered doubt at a gate ("before a human
approves at any gate, if you have any doubt, ask first"). It is extended to also cover doubt
about *scope*: when the agent is not fully sure what an instruction means, or is tempted to add
something beyond what was literally asked (an unrequested accessibility fallback, a defensive
edge case, a "nice to have" convention change), it must stop and review that with the human
first — not implement it and find out afterward whether it was wanted.

Synced into `README.md`'s and `README.th.md`'s "Rules of Engagement" section (Thai canonical),
mirroring `CLAUDE.md` per the existing doc-sync rule.

## Why

Recorded directly from the human's review of issue #99 at close (Instruction Fidelity 3/5, Result
Satisfaction 3/5):

> AI ไม่ค่อยทำงานตามที่สั่ง ในเรื่องกรอบการทำงานบางส่วนก็โอเคอยู่ แต่ หลายครั้งก็ยัง over
> requirement ไปเยอะ ทำให้งานช้าลง จะดีกว่าถ้า AI ยังไม่เข้าใจ หรือไม่มั่นใจ ควรจะ Review
> กลับมาก่อนที่จะลงมือทำอะไร ตรงไปตรงมา

Across issue #99's history the agent repeatedly added things beyond the literal instruction (an
`aria-label` fallback, a documented-but-unasked-for judgment call to skip a `resize` handler) and
that pattern read as not following instructions even where each addition was individually
well-reasoned — it also cost review cycles and slowed delivery, which is the opposite of the
intended effect. The existing "ask when in doubt" rule only fired at gates; this closes the gap by
making the same standard apply to any point where the agent is uncertain about scope, not just
approval gates.

## Impact

- `CLAUDE.md`'s "Ask when in doubt" section gains one paragraph extending the rule to
  over-implementation.
- `README.md` / `README.th.md`'s "Rules of Engagement" bullet for "AI asks when in doubt" is
  extended to match.
- No test/code changes — this is a process-only decision.
