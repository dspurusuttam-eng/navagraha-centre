# NAVAGRAHA CENTRE - Codex Operating Guide

## Product goal

Build a luxury astrology platform called NAVAGRAHA CENTRE with:

- premium brand website
- deterministic astrology calculation layer
- AI interpretation layer
- remedies module
- manual consultation workflow for Joy Prakash Sarmah
- e-commerce for spiritual products
- admin dashboard
- SEO-first public pages
- secure production-ready architecture

## Brand direction

- Feel: luxury, calm, editorial, premium, modern spiritual
- Avoid: flashy mystic cliches, clutter, neon effects, template-like UI
- Visual direction: dark premium palette, refined typography, subtle gold accents, restrained motion
- UX direction: Apple-like clarity, spacing, smoothness, simplicity, polish

## Engineering direction

- Use a modular architecture
- Prefer server-rendered public pages and clean metadata
- Keep code strongly typed
- Build reusable UI primitives before page sprawl
- Use domain modules, not one giant utils folder
- Create clear interfaces for AI, astrology engine, billing, CMS, and notifications
- AI must never calculate chart math directly
- Astrology calculations must stay behind a deterministic service/provider interface
- Use safe placeholders/adapters where a live external integration is not yet ready

## Working mode

- Implement only the requested phase
- Do not debug unrelated issues
- Do not run broad bug-fixing sweeps
- Do not refactor outside the requested scope
- Do not change architecture unless required for the current phase
- Make the smallest production-ready change set that completes the phase
- If blocked, stop and report the blocker instead of entering a debugging loop

## Validation mode

- After implementation, run one validation pass only
- Prefer: lint, typecheck, build
- If validation fails, stop after the first failure and report it clearly
- Do not begin unrequested debugging

## Output format for every task

1. Short plan
2. Files changed
3. Commands run
4. Result summary
5. Any new env vars
6. Any manual follow-up steps

## Initial technical preference

- Next.js App Router
- TypeScript
- Tailwind CSS
- Component-driven design system
- PostgreSQL
- Prisma or equivalent ORM
- Redis for caching/queues when needed
- Stripe for payments
- OpenAI integration behind a provider interface
- Headless CMS or CMS adapter later
- Route groups for marketing, app, and admin areas

## Folder direction

- src/app for routes
- src/modules for domain modules
- src/components for shared UI
- src/lib for framework-level helpers
- src/config for app config
- src/styles for tokens/theme
- prisma for schema
- public for static assets

## Content and safety rules

- No guaranteed life outcomes
- No fear-based remedy copy
- No medical/legal/financial claims
- Remedies should be framed carefully and transparently
- Keep the astrologer authority visible where relevant
