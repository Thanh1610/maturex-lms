# MatureX LMS Development Guidelines & Rules

All AI agents and developers working on the MatureX LMS project **MUST STRICTLY COMPLY 100%** with the guidelines below:

---

## 1. Type Safety & Ban on `any`
- ❌ **STRICTLY FORBIDDEN**: Using the `any` type (`lint/suspicious/noExplicitAny`) or unsafe type assertions (`as any`).
- ✅ Always declare explicit `type` or `interface` definitions. Use `unknown` with type guards or generics `<T>` when handling variable data.
- ✅ For complex action or event payloads, define explicit union types or validated schemas (Zod).
- ⚠️ The only acceptable exception is third-party libraries lacking typings, which requires an explicit comment explaining the reason alongside a targeted lint suppression comment.

---

## 2. Import Conventions & Path Aliases
- ✅ **Mandatory Path Alias `@/*`** for all internal project imports:
  - `@/components/*`: UI components, shared layouts, icons.
  - `@/features/*`: Feature domain modules.
  - `@/lib/*`: Utilities, API clients, Prisma client.
  - `@/types/*`: TypeScript type definitions.
  - `@/hooks/*`: Custom React hooks.
- ❌ **Strictly ban deep relative imports** (e.g., `../../../../components/ui/button` or `../../lib/prisma`).
- 📁 Standard import ordering:
  1. Core React & Next.js libraries.
  2. Third-party packages (npm dependencies).
  3. UI Components & Layouts (`@/components/*`).
  4. Features & Business Logic (`@/features/*`).
  5. Libs, Services, Hooks & Configs (`@/lib/*`, `@/hooks/*`).
  6. Types & Interfaces (`@/types/*`).
  7. Styles & Static Assets (`@/app/globals.css`, assets).

---

## 3. Component Architecture & File Size Limits
- 📏 **250 - 300 Lines per File Rule**: Every component, route, or store file **must not exceed 250 - 300 lines**.
- 🧩 **Single Responsibility Principle (SRP)**:
  - Avoid bundling entire views, lists, detail modals, and forms into a single monolithic file.
  - Structure directories by feature domain:
    ```text
    src/features/[feature-name]/
    ├── [feature]-app.tsx            # Main coordinator / routing
    ├── [feature]-store.ts          # State management & Reducer
    ├── components/
    │   ├── learning/               # Learning sub-views
    │   ├── management/             # Management sub-views
    │   └── shared/                 # Feature-level shared components
    ```
  - When a sub-view exceeds 250 lines, immediately break it down into modular child components, items, forms, and dialogs.

---

## 4. Database & Mandatory Migrations (Prisma + Neon)
- 🔒 **MIGRATIONS ARE MANDATORY**: When creating tables, adding columns, modifying data types, or changing relations in [prisma/schema.prisma](prisma/schema.prisma):
  - **ALWAYS** generate and save an official migration file through Prisma:
    ```bash
    npx prisma migrate dev --name <descriptive_migration_name>
    ```
  - ❌ **NEVER** rely solely on `prisma db push` on development or production without generating tracked migration files in `prisma/migrations/`.
  - ✅ Every migration file must be committed alongside the corresponding schema and application code changes.
  - 🔄 Always execute `npx prisma generate` after migrations to keep Prisma Client types synchronized.

---

## 5. Prioritize MCP Tools (Model Context Protocol)
When performing development tasks, AI agents **MUST PRIORITIZE** using available MCP tools over raw CLI commands or plain text grepping:
- 🗄️ **Neon MCP**:
  - Inspect table structures (`describe_table_schema`, `get_database_tables`).
  - Execute queries and explain plans (`run_sql`, `explain_sql_statement`).
  - Manage database branches and migrations (`prepare_database_migration`, `list_branches`).
- 🎨 **Shadcn MCP**:
  - Discover, preview, and add UI components (`search_items_in_registries`, `view_items_in_registries`, `get_add_command_for_items`).
- 🧠 **Codebase Graph MCP** (`codebase-memory-mcp`):
  - Use `search_graph`, `trace_path`, and `get_code_snippet` to discover functions, classes, and routes before falling back to grep/glob.
- 🌐 **Prisma MCP**:
  - Leverage `prisma` / `prisma-remote` MCP to inspect schemas and manage models.

---

## 6. Code Quality & Quality Gate
Before completing any task or making a commit:
1. **Lint & Format**: Run `npx biome check .` (or `pnpm lint`) — ensure zero warnings or formatting violations.
2. **Typecheck**: Run `pnpm tsc --noEmit` — ensure 0 TypeScript compiler errors.
3. **Build Verification**: Run `pnpm build` (`next build`) on routing or config changes to verify SSR/SSG compilation succeeds.
