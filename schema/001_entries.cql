-- One table per read path. Every write goes to all of them in one logged batch,
-- so no query needs a secondary index or ALLOW FILTERING.
-- id is a timeuuid: clustering on it DESC returns newest first, and the
-- creation time is read back from the id itself.

CREATE TABLE IF NOT EXISTS entries_by_id (
    id        timeuuid PRIMARY KEY,
    client_id text,
    category  text,
    data_type text,
    json_data text
);

CREATE TABLE IF NOT EXISTS entries_by_client (
    client_id text,
    id        timeuuid,
    category  text,
    data_type text,
    json_data text,
    PRIMARY KEY ((client_id), id)
) WITH CLUSTERING ORDER BY (id DESC);

CREATE TABLE IF NOT EXISTS entries_by_client_category (
    client_id text,
    category  text,
    id        timeuuid,
    data_type text,
    json_data text,
    PRIMARY KEY ((client_id, category), id)
) WITH CLUSTERING ORDER BY (id DESC);

CREATE TABLE IF NOT EXISTS entries_by_category (
    category  text,
    id        timeuuid,
    client_id text,
    data_type text,
    json_data text,
    PRIMARY KEY ((category), id)
) WITH CLUSTERING ORDER BY (id DESC);

CREATE TABLE IF NOT EXISTS entries_by_type (
    data_type text,
    id        timeuuid,
    client_id text,
    category  text,
    json_data text,
    PRIMARY KEY ((data_type), id)
) WITH CLUSTERING ORDER BY (id DESC);
