# Codex handoff: Barawell Dashboard

## Goal
Continue editing the Barawell growth dashboard using the uploaded design source as the visual and functional reference.

## Source artifact
The original source is `Barawell Dashboard.dc.html` from the ChatGPT handoff. It is a 104,961-byte Design Canvas HTML export with SHA-256:

`72397366028759f4b19e4644111392de7592efae764040b4607a7109528cfb00`

The source contains five dashboard areas: Overview, Revenue, Marketing, CRM, and Customers. It uses Design Canvas bindings such as `{{ variable }}`, `<sc-if>`, and `<sc-for>`, so do not treat it as production-ready static HTML.

## Editing approach
1. Inspect the current application architecture before changing files.
2. Rebuild the dashboard as maintainable React/Next.js components rather than pasting the monolithic export into production.
3. Preserve the visual direction: dark green sidebar, warm white content canvas, Space Grotesk for numeric display, compact KPI cards, and Indonesian rupiah formatting.
4. Preserve existing application routes, authentication, data integrations, and deployment configuration unless a change is necessary.
5. Use reusable components for navigation, date-range controls, KPI cards, chart cards, data tables, and role switching.
6. Keep the UI responsive. The exported source is desktop-first and needs explicit tablet/mobile behavior.
7. Replace inline styles with the repository's existing styling system. If none exists, use scoped CSS or Tailwind consistently.
8. Do not invent live business data. Keep mock data clearly separated until real data sources are connected.

## Initial tasks
- Identify the correct route for this dashboard.
- Create a component map and migration plan from the Design Canvas export.
- Implement the shell and Overview page first.
- Verify locally and capture screenshots before expanding to Revenue, Marketing, CRM, and Customers.
- Keep changes on this branch and open/update a draft PR with screenshots and validation notes.

## Acceptance criteria
- App builds and starts successfully.
- Existing routes remain functional.
- Dashboard shell and Overview closely match the design source.
- No monolithic 100k-line JSX component.
- Responsive behavior is documented and tested.
- PR explains what is implemented, what remains mocked, and the next recommended steps.
