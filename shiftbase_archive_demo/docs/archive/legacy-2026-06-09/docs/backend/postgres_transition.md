# PostgreSQL Transition Notes

This note describes what must stay stable when the current authoring backend is moved to PostgreSQL. It is based on the live backend code, not on archived planning documents.

## Current State

Authoring is provider-shaped, but the current implemented provider switch only enables local-file:

- `SHIFTBASE_AUTHORING_BACKEND=local-file` writes `content/containers/{slug}/container.json`.
- `SHIFTBASE_AUTHORING_BACKEND=sqlite` is a documented transition target, not currently wired in `containerService`.
- `/api/local-cms/*` and the CMS UI talk through `containerService`.
- `containerService` talks through `ContainerRepository`.

The first PostgreSQL version should preserve that shape. The CMS should not know whether the backing store is local files or PostgreSQL.

## Contract That Must Not Change

Keep these behaviors stable across local-file and PostgreSQL:

- `slug` is the stable primary identifier and URL key.
- Slugs are URL-safe kebab-case and are rejected before storage access.
- `create` rejects duplicates as `CONFLICT`.
- `read`, `update`, and `delete` return `NOT_FOUND` for missing containers.
- `update` keeps route slug and spec slug aligned before replacing stored data.
- Route slug and spec slug must match on update.
- API errors keep the existing structured shape and error codes.
- CMS API routes stay provider-agnostic.

If these behaviors drift, PostgreSQL becomes a second product path instead of a storage adapter.

Full pre-write `validateContainerSpec` is a production-readiness target, not current local-file behavior. If PostgreSQL adds full validation, update the local-file contract or document the provider difference explicitly before treating tests as mirrored.

## Suggested PostgreSQL Schema

Use `jsonb` for the full container spec and scalar columns for the fields needed for sorting, filtering, and status display.

```sql
create table containers (
  slug text primary key,
  title text not null,
  status text not null check (status in ('draft', 'published')),
  updated_at date,
  spec_json jsonb not null,
  created_at timestamptz not null default now(),
  saved_at timestamptz not null default now()
);

create table container_versions (
  id bigint generated always as identity primary key,
  slug text not null,
  reason text not null check (reason in ('update', 'delete')),
  spec_json jsonb not null,
  created_at timestamptz not null default now()
);

create index container_versions_slug_id_idx
  on container_versions (slug, id desc);

create index containers_title_sort_idx
  on containers (lower(title), slug);
```

Do not add `jsonb` GIN indexes until there is a real query that reads inside `spec_json`. The current app reads and writes whole specs.

## Local-file To PostgreSQL Differences

Local-file uses filesystem reads/writes. PostgreSQL access will be async and should use a connection pool.

Local-file stores `container.json` as formatted JSON. PostgreSQL should store it as `jsonb`, but the repository should still return a `ContainerSpec`, not raw DB JSON.

PostgreSQL should use `now()` and `timestamptz` for storage timestamps. Keep `updatedAt` as the content-level date from the spec unless the content model changes.

PostgreSQL must map unique violations to `CONFLICT`, missing rows to `NOT_FOUND`, bad inputs to `BAD_REQUEST`, and validation failures to the existing validation error shape.

Local-file serializes writes per slug in-process. PostgreSQL updates and deletes should wrap version insert plus row mutation in one transaction. If concurrent editing becomes real, use row-level locking inside that transaction instead of adding CMS-side locks first.

## Seeding And Migration

The first valid migration input is:

- Content JSON: `content/containers/*/container.json`.

Local SQLite import can be added later if a SQLite provider is implemented and worth preserving.

For the first PostgreSQL adapter, prefer one explicit import command or script. Do not silently reseed PostgreSQL during normal app boot. Silent seeding is acceptable for the local SQLite developer DB because it is a convenience store; PostgreSQL should behave like an owned database.

Recommended import rules:

- Fail if the target `containers` table is not empty, unless an explicit `--replace` mode exists.
- Validate every imported spec with `validateContainerSpec`.
- Stop the import on the first invalid spec.
- Preserve the current `slug`, `title`, `status`, `updatedAt`, and full `spec_json`.
- Import previous local edit history only if preserving backup/version history is worth the complexity at that point.

## Asset Boundary

PostgreSQL will not solve asset storage by itself.

The current asset route writes uploaded images to:

```text
public/assets/cms/{slug}/{timestamp}-{sanitized-name}
```

and returns a public path like:

```text
/assets/cms/{slug}/{file}
```

Before PostgreSQL is treated as production authoring storage, decide whether assets stay as local public files or get a separate storage provider. If asset management matters, add an `AssetRepository` or storage provider boundary separately from `ContainerRepository`.

Minimum future asset records would be:

- `id`
- `container_slug`
- `public_path`
- `storage_key`
- `mime_type`
- `byte_size`
- `created_at`

## Publish Model Decision

The authoring DB and public learning surface are still separate concerns.

There are two clean paths:

- Keep authoring in DB, then export/publish to generated static content for the public learning surface.
- Move public learning reads to PostgreSQL runtime queries.

For the current solo-development stage, keep the first path. Add explicit CMS states first: save, preview, review, publish. A runtime DB public surface should wait until content publishing and rollback rules are clearer.

## First Adapter Checklist

Implement PostgreSQL in this order:

1. Add `PostgresContainerRepository` implementing `ContainerRepository`.
2. Add `SHIFTBASE_AUTHORING_BACKEND=postgres`.
3. Add `DATABASE_URL` or a clearly named authoring DB URL.
4. Add SQL migrations for `containers` and `container_versions`.
5. Keep `containerService` as the only provider switch.
6. Mirror the current repository contract tests against a disposable PostgreSQL database or schema.
7. Smoke test `/api/health`, `/api/local-cms/containers`, create, update, delete, and CMS page load.

Do not include auth, multi-user approval, analytics, payments, or enterprise administration in the first PostgreSQL adapter. Those are product decisions, not requirements for replacing SQLite.

## Practical Stop Point

PostgreSQL migration is ready when the CMS can run with:

```text
SHIFTBASE_AUTHORING_BACKEND=postgres
DATABASE_URL=...
```

and the same CMS workflows pass without UI or API route changes.
