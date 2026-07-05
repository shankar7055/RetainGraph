# Armory AI Agency

## Mission
Create implementation-ready, token-driven UI guidance for Armory AI Agency that is optimized for consistency, accessibility, and fast delivery across marketing site.

## Brand
- Product/brand: Armory AI Agency
- URL: https://armory.framer.ai/
- Audience: developers and technical teams
- Product surface: marketing site

## Style Foundations
- Visual style: clean, functional, implementation-oriented
- Main font style: `font.family.primary=Inter Display`, `font.family.stack=Inter Display, Inter Display Placeholder, sans-serif`, `font.size.base=15px`, `font.weight.base=300`, `font.lineHeight.base=25.5px`
- Typography scale: `font.size.xs=9px`, `font.size.sm=10px`, `font.size.md=11px`, `font.size.lg=12px`, `font.size.xl=13px`, `font.size.2xl=14px`, `font.size.3xl=15px`, `font.size.4xl=16px`
- Color palette: `color.text.primary=#ffffff`, `color.text.secondary=#060606`, `color.text.tertiary=#0000ee`, `color.surface.base=#000000`, `color.surface.raised=#0d0d0d`
- Spacing scale: `space.1=2px`, `space.2=4px`, `space.3=7px`, `space.4=8px`, `space.5=10px`, `space.6=30px`, `space.7=60px`
- Radius/shadow/motion tokens: `radius.xs=6px`, `radius.sm=10px`, `radius.md=20px`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: links (44), inputs (12), lists (2), buttons (1).

- Extraction diagnostics: Audience and product surface inference confidence is low; verify generated brand context.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.
