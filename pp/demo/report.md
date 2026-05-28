# Product Predict / run-demo / Experience Notes
# target: https://cadence.app
# generated: 2026-05-25T03:19:08.000Z · schema: pp.experience.v1

> This is NOT a bug list. It's how a population of AI agents *felt*
> about your product. Treat the items below as experience observations:
> some are bugs, but more are design/fit/rhythm issues you can only see
> when someone unlike you uses your product.

## SUMMARY
- 9 experience observations across 6 agents · 37 events
- Predicted NPS: 14 (achievable: 58)
- Task success: 33% · Rage clicks: 3 · Delights: 6
- Sessions: 2 accomplished, 1 explored, 3 frustrated
- Cost: $0.00 (218,430 in / 8,920 out)

## OBSERVATIONS

### [i01] HIGH · learning curve — Onboarding has too many concepts for a 4-person team
SCALE: 1/6 agents felt this · 3 events · where: onboarding flow / signup to first standup
QUOTE (Lars Hjelm, Founder): "7 steps in and nobody on the team has answered a single question yet. Concepts on top of concepts — not built for a 4-person team"

### [i02] HIGH · information architecture — PDF export missing + entry buried three levels deep
SCALE: 1/6 agents felt this · 2 events · where: trying to export the weekly report for the boss
QUOTE (Lei Wang, Project Manager): "Export button is buried three levels deep under Settings → Reports → Weekly Digest, and there's no PDF option. Is my boss expecting me to convert it myself?"

### [i03] HIGH · feature fit — Template editor edits question text only — no field types
SCALE: 1/6 agents felt this · 1 events · where: PM configuring the team standup template
QUOTE (Maya Chen, Product Manager): "Wanted to make 'any blockers?' a required field, but the template editor only lets me edit the question text — no field-type options"

### [i04] HIGH · feature fit — Slack integration doesn't support multiple workspaces
SCALE: 1/6 agents felt this · 1 events · where: onboarding a team that spans multiple Slack workspaces
QUOTE (Aiko Tanaka, Operations Manager): "Slack integration is one Cadence ↔ one workspace; my team uses channels across two workspaces and I can't connect both"

### [i05] MED · vs competitors — No webhook to receive standup answers — blocks CI integration
SCALE: 1/6 agents felt this · 1 events · where: eng lead evaluating automation depth
QUOTE (Kenji Okada, Engineering Lead): "API docs only cover REST calls — couldn't find a webhook to receive standup answers. Missing the key piece for wiring into CI"

### [i06] MED · copy — Japanese UI only 60% translated, key terms still English
SCALE: 1/6 agents felt this · 1 events · where: multilingual team switching UI language
QUOTE (Aiko Tanaka, Operations Manager): "Japanese is only ~60% translated — key terms like 'answer template' / 'reminder rules' are still English. My Japanese colleagues won't follow"

### [i07] MED · accessibility — Unread red dot only 2:1 contrast in dark mode
SCALE: 1/6 agents felt this · 1 events · where: noticed notification styling after switching theme
QUOTE (Sofia Reyes, Designer): "Dark mode is nice overall, but the 'unread' red dot only has 2:1 contrast on the dark background — nearly invisible"

### [i08] LOW · visual pacing — Landing page too information-dense for small teams
SCALE: 1/6 agents felt this · 2 events · where: scanning the landing page's first screen
QUOTE (Lars Hjelm, Founder): "First screen lists 11 features — that's a lot, doesn't feel designed for small teams"

### [i09] LOW · learning curve — 'team' + 'cadence' double concept trips up newcomers
SCALE: 1/6 agents felt this · 1 events · where: creating the first standup for the first time
QUOTE (Lars Hjelm, Founder): "I have to create a 'team' first, then a 'cadence' (what even is that?), then add questions, then invite people"

## DELIGHTS
- **Cadence chart spots the disengaged at a glance** (1× · Maya Chen): "The cadence chart shows at a glance who hasn't responded in 3 days — this is what a PM actually needs"
- **Per-person timezone + working hours, reminders in local time** (1× · Aiko Tanaka): "Each person sets their own timezone + working hours, reminders fire in local time — this saves my 4-timezone team"
- **Cmd+K command palette + live Markdown rendering** (2× · Kenji Okada): "Markdown in answers renders live — > blockquote / **bold** / `code` all work"
- **Micro-interactions use spring animation, not a lazy fade** (1× · Sofia Reyes): "Every hover state has a spring animation, not a lazy 0.2s fade"
- **Landing page makes the value prop clear in 3 seconds** (1× · Maya Chen): "Clean landing page — in 3 seconds I can tell it's an async standup tool"

## FEATURE USAGE
Functions actually invoked during the sessions. Hit rate = fraction of agents who touched it; completion = of those, fraction who got what they wanted; sentiment = average feel after using.

| feature | hit rate | completion | sentiment | attempts |
|---|---|---|---|---|
| View landing demo | 100% (6/6) | 100% | +0.8 | 6 |
| Create team & cadence | 33% (2/6) | 50% | -1.5 | 4 |
| Edit question template | 17% (1/6) | 0% | -1.0 | 2 |
| Command palette (Cmd+K) | 17% (1/6) | 100% | +2.0 | 1 |
| Timezone / working-hours setup | 17% (1/6) | 100% | +3.0 | 1 |
| Switch theme / language | 33% (2/6) | 100% | +0.5 | 2 |
| Integrations (Slack/GitHub) | 33% (2/6) | 0% | -2.0 | 3 |
| Export report | 17% (1/6) | 0% | -2.0 | 2 |

## EXIT REASONS
- Maya Chen: accomplished (135s)
- Kenji Okada: explored (204s)
- Lei Wang: frustrated (189s)
- Sofia Reyes: accomplished (185s)
- Aiko Tanaka: frustrated (308s)
- Lars Hjelm: frustrated (178s)

## VERIFICATION
After applying fixes, re-run:
```
pp run https://cadence.app --agents 6 --compare run-demo
```
Pass criteria: NPS ≥ 34, Rage clicks ≤ 1.

## DROP-IN PROMPT FOR YOUR CODING AGENT
```
I ran product-predict on this codebase (run-demo) — 1,000,000 AI agents tried it for real.
4 high-severity issues found. Read report.md for full details.

Apply fixes for high-severity issues in order. For each:
  1. Read the issue title + quote.
  2. Locate the relevant component in the codebase.
  3. Apply a fix, then add a test that would have caught it.
  4. After each fix, run `pp run https://cadence.app --compare run-demo` and stop if it regresses.
```