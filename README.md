# CMP Garage Frontend

Vue 3 + Vite frontend for the CMP Garage workflow app. This project handles customer, vessel, ticket, reminder, and internal messaging experiences.

## Stack

- Vue 3
- TypeScript
- Pinia
- Vue Router
- Socket.IO client
- Vitest

## Getting Started

Install dependencies:

npm install

Run development server:

npm run dev

Run API proxy target separately from the CMP server project if needed.

## Scripts

- npm run dev: start Vite dev server
- npm run build: type-check and build production bundle
- npm run type-check: run vue-tsc
- npm run lint: run configured linters
- npm run test: run unit tests once
- npm run test:watch: run tests in watch mode

## Source Layout

The app now follows a service/domain/shared split to keep responsibilities clear.

- src/services
  - Infrastructure and IO boundaries
  - Example: HTTP client, realtime socket integration
- src/domain
  - Business/data shaping logic tied to app domains
  - Example: conversation normalization, ticket display helpers, note history helpers
- src/shared
  - Cross-domain utilities with broad reuse
  - Example: local date formatting and date key helpers
- src/stores
  - Pinia stores and store-level action/state modules
- src/views and src/components
  - UI composition and page-level behavior

## Refactor Conventions

- Keep network logic in src/services, not in view files.
- Keep data normalization close to its domain in src/domain.
- Keep generic formatting/parsing helpers in src/shared.
- Prefer small, explicit functions with clear naming over large multi-purpose utilities.
- For Vue single-file components, prefer a container/presentational split: keep views focused on data loading and navigation while moving reusable UI into focused child components.
- Add unit tests for all new helper modules, meaningful store action behavior, and refactored SFC surfaces.

## Testing

Run all tests:

npm run test

Current tests cover:

- Store shared record helpers
- Auth session and auth action flows
- Ticket and reminder store normalization behavior
- HTTP service behavior
- Realtime messaging behavior
- Conversation domain utilities
- Date formatting helpers
- Notes history splitting
- Ticket display helper logic

## Notes

- Type-check and tests are expected to pass before merge.
- If you add a new wrapper module temporarily, create a follow-up task to migrate imports and remove the wrapper.
