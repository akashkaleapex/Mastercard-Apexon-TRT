
# Project Implementation Instructions

## Before implementing any feature

1. Read the relevant requirements in `docs/requirements/`.
2. Review the internal call transcript for business rules and decisions.
3. Review the flow diagrams in `docs/diagrams/`.
4. Inspect the existing source code and follow the current architecture.
5. Identify impacted files and dependencies before making changes.

## Implementation rules

- Follow the existing coding standards and project patterns.
- Do not invent requirements that are not documented.
- If the transcript and requirements conflict, identify the conflict
  and ask for clarification.
- Use the flow diagrams to understand the expected process.
- Preserve existing functionality unless a change is explicitly required.
- Add or update tests for the implemented behavior.
- Do not modify unrelated files.

## React and UI implementation

- Before building UI, inspect the existing framework, component library,
  styling setup, and package dependencies. Extend the established stack
  instead of introducing a competing one.
- For React, use functional components and hooks, keep components focused,
  and follow the project's JavaScript or TypeScript conventions.
- Use Tailwind CSS for common layout, spacing, responsive behavior, and
  state-based styling when it is already configured. Use custom CSS for
  reusable theme tokens, complex visual treatments, and styles that are
  clearer outside utility classes. Avoid duplicating styles across both.
- For new React UI, use shadcn/ui components with their Radix UI primitives
  and Tailwind CSS as the default component system. If the project already
  has an established UI library, stay consistent with it unless a migration
  is explicitly requested. Add only the shadcn/ui components the feature
  needs.
- Use Lucide React as the default icon library for React interfaces. Use
  recognizable icons, provide accessible names or tooltips for icon-only
  controls, and avoid emoji or hand-drawn icons.
- For complex forms, consider React Hook Form with Zod validation; for
  advanced data tables, consider TanStack Table; and for charts, consider
  Recharts. Use these only when the feature needs them and they fit the
  existing dependency and architecture choices.
- Build responsive layouts and accessible interactions, including keyboard
  support, visible focus states, semantic HTML, and appropriate labels.
- Keep visual design consistent across the feature: reuse design tokens,
  typography, colors, and component patterns rather than adding one-off
  styles or unnecessary dependencies.
- Give each screen a clear visual hierarchy with readable typography,
  consistent spacing, restrained color use, and purposeful layout. Avoid
  generic card-heavy compositions and decorative UI that competes with the
  user's primary task.
- Implement complete interaction states, including loading, empty, error,
  disabled, and success states where applicable. Check narrow and wide
  layouts so content remains readable and controls remain usable.
- Verify UI changes at relevant viewport sizes and run the project's
  available lint, type-check, and test commands.

## Validation

- Verify the implementation against the documented requirements.
- Run relevant tests and report their results.
- List the files changed and explain the implementation.
- Document any assumptions or unresolved questions.
