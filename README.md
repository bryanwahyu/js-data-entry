# js-data-entry

[![CI](https://github.com/bryanwahyu/js-data-entry/actions/workflows/ci.yml/badge.svg)](https://github.com/bryanwahyu/js-data-entry/actions/workflows/ci.yml)

A multi-tenant API that stores arbitrary JSON documents in Cassandra and reads them back by client, category or type. Node.js and Express, organised in DDD layers.

## Data model

Cassandra serves a query well only when the query names a full partition key. So instead of one table with secondary indexes, there is one table per read path (`schema/001_entries.cql`):

| Table | Partition key | Clustering | Serves |
|---|---|---|---|
| `entries_by_id` | `id` | | `GET /api/entries/:id`, full listing |
| `entries_by_client` | `client_id` | `id DESC` | `GET /api/entries/client/:clientId` |
| `entries_by_client_category` | `(client_id, category)` | `id DESC` | `GET /api/entries/client/:clientId/category/:category` |
| `entries_by_category` | `category` | `id DESC` | `GET /api/entries/category/:category` |
| `entries_by_type` | `data_type` | `id DESC` | `GET /api/entries/type/:type` |

- `id` is a `timeuuid`. Clustering on it descending returns newest entries first with no sort step, and the creation time is read from the id, so there is no separate `created_at` column to keep in sync.
- A write goes to all five tables in one logged batch. Cassandra guarantees the batch is eventually applied in full, so the tables do not drift apart after a partial failure.
- Every query is a single-partition read with `LIMIT`. No `ALLOW FILTERING`, no secondary indexes.
- Reads and writes use `LOCAL_QUORUM`.
- The schema files use `IF NOT EXISTS` and run on every start, in file-name order.

Trade-offs worth knowing:

- Each entry is stored five times. Writes cost more so that reads stay cheap.
- `entries_by_category` and `entries_by_type` put every client's rows for one category or type in one partition. Fine for a demo; for real volume, add a time bucket (for example `(category, month)`) to the partition key.
- The full listing (`GET /api/entries`) walks `entries_by_id` in token order, paged with `pageState`. It is for exports and admin use, not for "latest entries".

## Run it

```bash
docker compose up --build
```

Cassandra takes about a minute to become healthy; the API then listens on `http://localhost:3000`.

```bash
curl -X POST localhost:3000/api/entries -H 'Content-Type: application/json' \
  -d '{"client_id":"acme","category":"orders","data_type":"order","data":{"sku":"A-1","qty":2}}'

curl 'localhost:3000/api/entries/client/acme/category/orders?limit=20'
```

`client_id` and an object `data` are required. `category` defaults to `uncategorized` and `data_type` to `general`. `limit` is 1 to 1000, default 100.

To run against your own Cassandra, copy `.env.example` to `.env`, adjust it, then `npm install && npm start`.

## API

| Method | Path | |
|---|---|---|
| `POST` | `/api/entries` | Create an entry |
| `GET` | `/api/entries/:id` | One entry |
| `GET` | `/api/entries?limit=&pageState=` | All entries, paged |
| `GET` | `/api/entries/client/:clientId` | A client's entries, newest first |
| `GET` | `/api/entries/client/:clientId/category/:category` | A client's entries in one category |
| `GET` | `/api/entries/category/:category` | All entries in a category |
| `GET` | `/api/entries/type/:type` | All entries of a type |
| `GET` | `/health` | Liveness |

## Layout

```
src/domain           DataEntry entity, value objects, repository port
src/application      one use case per endpoint, DTOs
src/infrastructure   Cassandra client (keyspace + schema migration) and repository
src/interfaces/api   Express routes, controller, middleware
schema/              CQL, applied at startup
```

## Tests

```bash
npm test                      # domain and HTTP tests against an in-memory repository

docker compose up -d cassandra
CASSANDRA_CONTACT_POINTS=127.0.0.1 CASSANDRA_LOCAL_DATA_CENTER=datacenter1 npm test
```

With `CASSANDRA_CONTACT_POINTS` set, the Cassandra tests also run: they write through the real repository and check ordering, per-partition limits and paging. CI runs both, the second against a Cassandra 4.1 service container.
