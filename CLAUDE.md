# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server on http://localhost:5173
npm run build      # Type-check (tsc -b) then Vite build
npm run lint       # ESLint
npm run preview    # Preview production build
```

There are no tests configured in this project.

## Architecture

### Data flow

```
API response (BaseResponse<T>)
  → axios service (src/services/)
    → useAuth hook (src/hooks/)
      → Zustand store (src/store/)
        → React components / pages
```

### API contract

All API responses follow `BaseResponse<T>` from `src/types/api.types.ts`:

```ts
{ finalizado: boolean, mensaje: string, datos: T }
```

Always check `data.finalizado` (not HTTP status) to determine success. For paginated endpoints use `PaginatedResponse<T>` which wraps `{ filas: T[], totalFilas: number }`.

### Authentication

- `useAuthStore` (Zustand + persist) holds `token`, `usuario`, `isAuthenticated`. Persisted to `localStorage` as `auth-storage`.
- `useAuth` hook wraps store + `authService` calls. Use this hook in components, not the store directly.
- `AuthGuard` reads `isAuthenticated` from the store to protect private routes.
- The Axios instance (`src/services/axios.ts`) automatically injects `Authorization: Bearer <token>` and handles `401` by calling `POST /token` (refresh via HttpOnly cookie). On refresh failure it clears the store and redirects to `/login`.

### Routing

Two layout branches in `AppRouter`:
- **Public** → `AuthLayout` (centered card, no sidebar)
- **Private** → `AuthGuard` → `MainLayout` (sidebar + header shell)

Add new private pages inside the `AuthGuard > MainLayout` route group and register them in `navItems` inside `MainLayout.tsx`.

### Adding a new feature module

1. Create `src/pages/<module>/` with the page component.
2. Create `src/services/<module>.service.ts` using the shared `api` Axios instance.
3. Add types to `src/types/`.
4. Register the route in `src/routes/AppRouter.tsx` and add a nav entry in `src/layouts/MainLayout.tsx`.

### UI components

Primitives live in `src/components/ui/` (shadcn/ui pattern — Radix UI + Tailwind). Use the `cn()` helper from `src/lib/utils.ts` for conditional class merging. Do not modify files under `src/components/ui/` for business logic; extend them from page/feature components.

### Environment

`VITE_API_URL` is the only required env variable. Copy `.env.example` → `.env` before running locally.
