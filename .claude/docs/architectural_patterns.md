# Architectural Patterns

## Data Fetching Hook Pattern

Every data domain (entries, team, leave) follows the same hook structure:

1. State: `useState` for data array, `loading` (boolean), `error` (string | null)
2. Fetch function wrapped in `useCallback` with loading/error lifecycle
3. Auto-fetch on mount via `useEffect`
4. Return object: `{ data, loading, error, refresh, ...mutations }`

Reference implementations:
- `src/hooks/useEntries.ts:4-78` (full CRUD with optimistic updates)
- `src/hooks/useTeam.ts:4-43` (read + status update)
- `src/hooks/useLeave.ts:4-27` (read-only)

When adding a new data domain, follow `useEntries` as the template.

## Optimistic Update Pattern

All mutations apply changes to local state before the API call, then either replace with server response on success or rollback on failure:

```
1. Save original state
2. Apply optimistic change to local state via setState
3. try: call API, replace optimistic data with server response
4. catch: restore original state
```

- Add: uses `temp-${Date.now()}` ID for placeholder (`src/hooks/useEntries.ts:28`), replaced on success, removed on failure
- Update: spreads partial data onto existing item (`src/hooks/useEntries.ts:54`), reverts to original on failure
- Delete: filters item out immediately (`src/hooks/useEntries.ts:68`), re-inserts on failure

## API Service Layer

`src/services/NotionService.ts` is a plain object of static methods wrapping a generic `request<T>()` function (`src/services/NotionService.ts:37-47`).

Pattern for adding new endpoints:
1. Define TypeScript interface for the response shape (top of file)
2. Add method to `NotionService` object calling `request<T>(path, options)`
3. All requests go through the same fetch wrapper which handles JSON parsing and error extraction

The service uses relative paths (`/api/...`) which Vite proxies to Express in dev.

## Server-Side Notion Mapping

Express routes in `server.js` follow a consistent pattern:
1. Call Notion SDK (`notion.dataSources.query` or `notion.pages.create/update`)
2. Map response through a transform function (`mapPage`, `mapTeamMember`, `mapLeaveRecord`)
3. Transform extracts properties using optional chaining with fallback defaults: `props.Name?.title?.[0]?.plain_text || ''`

Soft deletes: entries are archived via `notion.pages.update({ archived: true })` (`server.js:100`)

## Component Patterns

### Status/Priority Style Maps
Components define static `Record<string, StyleObject>` maps for visual variants:
- `src/components/DataTable.tsx:12-35` — entry status + priority styles
- `src/components/TeamTable.tsx:5-30` — team status styles + department styles
- `src/components/CalendarView.tsx:7-13` — leave type styles

Each map provides at minimum `{ bg, text }` Tailwind classes. Some add `dot`, `bar`, or `glow`.

### Loading/Empty/Error States
Every data-driven component handles three states in this order:
1. **Error**: banner with retry button at top (always visible)
2. **Loading**: centered spinner with description text
3. **Empty**: icon + message + action hint
4. **Data**: the actual content

See `src/components/DataTable.tsx:38-63` for the canonical example.

### Card Container Pattern
Cards use the `glow-card` CSS class with `relative z-10` on inner content. Animation is applied via `animate-fade-up` with `stagger-N` classes (N = 1-8) for sequential reveal.

Example: `src/components/StatsCards.tsx:57-59`

## Navigation

Client-side routing is manual via `activePage` state in `App.tsx:19`. The `Page` type union (`'dashboard' | 'team' | 'calendar' | 'login'`) is defined in both `App.tsx:13` and `Sidebar.tsx:13`. Pages are rendered conditionally in `App.tsx:61-105`.

## Styling Conventions

- Dark theme: base background `#0a0a0a`, sidebar `#0d0d0d`, modals `#111111`
- Opacity-based white text: `text-white/90` (primary), `text-white/40` (secondary), `text-white/30` (tertiary)
- Borders use `border-white/[0.08]` to `border-white/[0.12]`
- Interactive states: hover increases opacity, adds subtle glow via `shadow-[0_0_Npx_rgba(...)]`
- Label style: `text-[10px] or text-[11px] font-medium uppercase tracking-[0.15em] text-white/30`
