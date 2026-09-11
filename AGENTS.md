<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# MatureX LMS Development Guidelines

> ⚠️ **MANDATORY**: All AI agents and developers working on this project **MUST** read and strictly follow the project rules defined at:
> 
> 👉 **[.agents/rules/maturex-rules.md](.agents/rules/maturex-rules.md)**

### Core Principles Summary:
1. **Type Safety**: Strictly prohibit `any` or `as any`. Always define explicit types and interfaces.
2. **Path Aliases**: Enforce `@/*` alias imports (`@/components/*`, `@/features/*`, `@/lib/*`, `@/types/*`, etc.). Ban deep relative imports.
3. **File Size Limit**: Adhere to the **250 - 300 lines/file** limit, modularizing code by feature domains.
4. **Prisma & DB Migrations**: Every database schema change **MUST** include an official migration file (`prisma migrate dev`). Ban raw `db push`.
5. **Prefer MCP Tools**: Prioritize Neon MCP, Shadcn MCP, Prisma MCP, and Codebase Graph MCP when performing tasks.
6. **Quality Gate**: Ensure zero errors with `biome check` and `pnpm tsc --noEmit` before finishing any task.
