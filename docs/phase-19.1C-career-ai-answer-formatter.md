# Phase 19.1C - Career AI Answer Formatter

## Scope and guardrails followed
- Formatter-only refinement for career answers.
- No astrology engine/calculation changes.
- No UI, route, auth, payment, SEO, tools, reports, database, or pricing changes.
- Existing safety and free/premium gating behavior preserved.

## 1) Files changed
- `src/modules/ask-chart/jyotish-answer-formatter.ts`

## 2) Final career answer structure
Career/job/business questions now render with a dedicated structure:

1. `Career Summary`
- 2-3 direct lines from the generated answer.

2. `Job / Business Tendency`
- chart-aware tendency framing (service/job vs business/partnership vs balanced path) using house/timing context.

3. `Timing Insight`
- Dasha/transit-aware timing interpretation with conservative wording (growth/discipline/mixed/pressure).

4. `Growth Opportunities`
- strengths and opportunity areas (skills, communication, networks, responsibility, learning, creativity) based on context.

5. `Caution Areas`
- non-fear-based caution signals (pressure, transition pacing, over-risk, uncertainty where confidence is low).

6. `Practical Guidance`
- realistic action steps (skill-building, planning, communication, phased transition/business discipline).

7. `Soft Next Step`
- contextual continuation only when relevant (Career Report/deeper question/consultation/Kundli refresh).

Then existing confidence + disclaimer lines remain appended.

## 3) When career formatter applies
- Applies only when the question is career-related, detected through career/job/profession/business/reputation/income-oriented terms and domain signals.
- Non-career questions continue through the existing 19.0C generic formatter path unchanged.
- Short career queries still use concise content inside the same career structure.

## 4) Safety behavior
- No guarantee language introduced for job/promotion/income outcomes.
- No fear-based caution language introduced.
- No exact-date promise logic added.
- Existing health/finance/marriage safety note logic is still reused where overlap exists.
- Low-confidence context explicitly keeps wording tentative.

## 5) Premium behavior
- No gating bypass; plan limits remain unchanged.
- Soft next-step phrasing is contextual and non-aggressive.
- Free-plan flow still favors follow-up questions without forcing premium routes.

## 6) Next recommended phase
- **Phase 19.1D - Career AI QA Testing**
  - validate response quality across job, business, promotion, transition, pressure, and income/gains scenarios.

