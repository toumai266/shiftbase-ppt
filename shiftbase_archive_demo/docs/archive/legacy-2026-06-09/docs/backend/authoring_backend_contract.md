# Authoring Backend Contract

Shiftbase authoring uses a trusted operator backend boundary for CMS workflows. It is not yet the public learning runtime database.

Current implemented provider:

- `local-file`: stores `content/containers/{slug}/container.json` and file backups.

Planned providers:

- `sqlite`: stores authoring data in `SHIFTBASE_LOCAL_DB_PATH`, defaulting to `.shiftbase/authoring.sqlite`.
- `postgres`: stores authoring data behind the same `ContainerRepository` contract.

Current code enables authoring when `SHIFTBASE_AUTHORING_BACKEND=local-file`, or implicitly in non-production through the local-file provider. Any other value keeps authoring disabled in production.

## Provider Contract

Any `ContainerRepository` implementation must provide:

- `list()`: return validated container specs sorted for stable operator display.
- `read(slug)`: return one validated container spec or `NOT_FOUND`.
- `create({ slug, title })`: create a draft container exactly once or return `CONFLICT`.
- `update(slug, spec)`: replace the stored version for the route slug or return `NOT_FOUND`.
- `delete(slug)`: remove one existing container or return `NOT_FOUND`.

All providers must reject path traversal or invalid slugs before storage access.

## Error Contract

API handlers return structured errors:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "..."
  }
}
```

Known codes are `BAD_REQUEST`, `NOT_FOUND`, `CONFLICT`, `DISABLED`, `VALIDATION_FAILED`, and `INTERNAL`.

## Shared Reliability Requirements

Every production-ready provider must:

- validate the complete container spec before write;
- reject invalid slugs before storage access;
- keep `slug` as the stable URL and storage identifier;
- preserve the structured API error contract;
- avoid changing `/api/local-cms/*` and CMS callers when the provider changes;
- keep writes inside trusted operator environments only.

Current local-file behavior differs from the production-ready target: `LocalFileContainerRepository.update()` prepares the route slug and `updatedAt`, writes a backup, atomically replaces `container.json`, and syncs the generated registry, but it intentionally does not run full `validateContainerSpec` before save. This is covered by `tests/backend/localFileContainerRepository.test.ts`. Treat local-file as a trusted operator authoring convenience, not a publish gate.

The `local-file` provider must:

- serialize writes per container slug inside the process;
- write through a temporary file and atomic rename;
- keep a timestamped backup before replacing an existing `container.json`;
- remove temporary files when a write fails;
- preserve the route slug on update.

The `sqlite` provider must:

- initialize its schema before use;
- seed from `content/containers` only when the DB is empty;
- keep immutable previous specs in `container_versions` before update and delete;
- run update and delete changes inside SQLite transactions.

## Current Limits

The current backend does not provide user authentication, review approvals, publish events, object storage, full pre-write spec validation, or public learner progress persistence. It is suitable for trusted solo operator authoring and local production-readiness work.

## PostgreSQL Migration Path

See [PostgreSQL Transition Notes](./postgres_transition.md).

The short rule is: add a PostgreSQL repository behind the same `ContainerRepository` contract first, then decide whether public learning reads stay static/exported or move to runtime DB reads.
