# Repository Overview

This document was generated to help tooling quickly understand the project layout, tech stack, and common tasks.

## Tech Stack

- **Build tool**: Vite ^5
- **Language**: TypeScript ^5
- **Framework**: React ^19
- **Styling**: Tailwind CSS ^3 with tailwindcss-animate and @tailwindcss/aspect-ratio
- **UI**: shadcn/ui (Radix primitives) under `src/components/ui`
- **Routing**: react-router-dom ^6
- **State / Data**: @tanstack/react-query, zustand
- **3D (optional)**: three, @react-three/fiber, @react-three/drei
- **Form & Schema**: react-hook-form, zod

## Package Manager

- **Preferred**: pnpm (declared via `packageManager: pnpm@8.10.0`)

## Node Version

- Recommended: Node.js 18+ (Vite 5 requires Node 18+)

## NPM Scripts

- **dev**: `vite` – start dev server (default http://localhost:5173)
- **build**: `vite build` – production build to `dist/`
- **preview**: `vite preview` – preview the production build
- **lint**: `eslint --quiet ./src`

## Entry Points

- **HTML**: `index.html`
- **App bootstrap**: `src/main.tsx`
- **Root component**: `src/App.tsx`
- **Pages**: `src/pages` (e.g., `Index.tsx`, `NotFound.tsx`)

## Path Aliases

Defined in Vite and components.json:
- `@` → `./src`
- **Additional aliases** (from `components.json`):
  - `components` → `@/components`
  - `utils` → `@/lib/utils`
  - `ui` → `@/components/ui`
  - `lib` → `@/lib`
  - `hooks` → `@/hooks`

Example imports:
```ts
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
```

## Tailwind CSS

- **Config**: `tailwind.config.ts`
- **CSS entry**: `src/index.css`
- **Content globs**: `./pages/**/*.{ts,tsx}`, `./components/**/*.{ts,tsx}`, `./app/**/*.{ts,tsx}`, `./src/**/*.{ts,tsx}`
- **Dark mode**: class-based (`dark` class)

## Vite Configuration

- **File**: `vite.config.ts`
- **Aliases**: `@` → `./src`
- **Plugins**: `@metagptx/vite-plugin-source-locator` (prefix: `mgx`), `@vitejs/plugin-react-swc`

## Linting

- **Config**: `eslint.config.js` (flat config with typescript-eslint, react-hooks, react-refresh)
- **Ignored**: `dist`

## Build Output

- Directory: `dist/` (contains `index.html`, assets, images)

## Quickstart

1. Install: `pnpm i`
2. Develop: `pnpm dev` → open http://localhost:5173
3. Lint: `pnpm run lint`
4. Build: `pnpm run build`
5. Preview build: `pnpm run preview`

## Notes

- All shadcn/ui components are located under `src/components/ui`.
- Keep imports using the `@` alias to avoid long relative paths.
- If you prefer npm/yarn, you can translate commands, but pnpm is recommended since it is declared in `package.json`.