// Infrastructure: Cassandra Data Entry Repository Implementation
const cassandra = require('cassandra-driver');
const IDataEntryRepository = require('../../domain/repositories/IDataEntryRepository');
const DataEntry = require('../../domain/entities/DataEntry');

const { TimeUuid } = cassandra.types;
const COLUMNS = 'id, client_id, category, data_type, json_data';

class CassandraDataEntryRepository extends IDataEntryRepository {
  constructor(cassandraClient) {
    super();
    this.client = cassandraClient;
  }

  // Writes the entry to every query table in one logged batch: either all
  // tables get the row or, after a failure, the batch log replays it.
  async save(dataEntry) {
    const id = TimeUuid.now();
    const json = JSON.stringify(dataEntry.data);
    const { clientId, category, dataType } = dataEntry;

    await this.client.getClient().batch([
      {
        query: 'INSERT INTO entries_by_id (id, client_id, category, data_type, json_data) VALUES (?, ?, ?, ?, ?)',
        params: [id, clientId, category, dataType, json]
      },
      {
        query: 'INSERT INTO entries_by_client (client_id, id, category, data_type, json_data) VALUES (?, ?, ?, ?, ?)',
        params: [clientId, id, category, dataType, json]
      },
      {
        query: 'INSERT INTO entries_by_client_category (client_id, category, id, data_type, json_data) VALUES (?, ?, ?, ?, ?)',
        params: [clientId, category, id, dataType, json]
      },
      {
        query: 'INSERT INTO entries_by_category (category, id, client_id, data_type, json_data) VALUES (?, ?, ?, ?, ?)',
        params: [category, id, clientId, dataType, json]
      },
      {
        query: 'INSERT INTO entries_by_type (data_type, id, client_id, category, json_data) VALUES (?, ?, ?, ?, ?)',
        params: [dataType, id, clientId, category, json]
      }
    ], { prepare: true, logged: true });

    return new DataEntry(id.toString(), dataType, category, clientId, dataEntry.data, id.getDate());
  }

  async findById(id) {
    let timeUuid;
    try {
      timeUuid = TimeUuid.fromString(id);
    } catch {
      return null;
    }
    const result = await this.client.getClient().execute(
      `SELECT ${COLUMNS} FROM entries_by_id WHERE id = ?`,
      [timeUuid],
      { prepare: true }
    );
    return result.rows.length ? toEntity(result.rows[0]) : null;
  }

  // Full listing, paged with the driver's pageState. Rows come back in token
  // order, not by time; use the per-client or per-category reads for that.
  async findAll(limit = 100, pageState = null) {
    const result = await this.client.getClient().execute(
      `SELECT ${COLUMNS} FROM entries_by_id`,
      [],
      { prepare: true, fetchSize: limit, pageState: pageState || undefined }
    );
    return {
      entries: result.rows.map(toEntity),
      pageState: result.pageState || null,
      hasMore: Boolean(result.pageState)
    };
  }

  async findByType(dataType, limit = 100) {
    return this.query('SELECT %s FROM entries_by_type WHERE data_type = ? LIMIT ?', [dataType, limit]);
  }

  async findByCategory(category, limit = 100) {
    return this.query('SELECT %s FROM entries_by_category WHERE category = ? LIMIT ?', [category, limit]);
  }

  async findByClient(clientId, limit = 100) {
    return this.query('SELECT %s FROM entries_by_client WHERE client_id = ? LIMIT ?', [clientId, limit]);
  }

  async findByClientAndCategory(clientId, category, limit = 100) {
    return this.query(
      'SELECT %s FROM entries_by_client_category WHERE client_id = ? AND category = ? LIMIT ?',
      [clientId, category, limit]
    );
  }

  async query(template, params) {
    const result = await this.client.getClient().execute(template.replace('%s', COLUMNS), params, { prepare: true });
    return result.rows.map(toEntity);
  }
}

function toEntity(row) {
  return new DataEntry(
    row.id.toString(),
    row.data_type,
    row.category,
    row.client_id,
    JSON.parse(row.json_data),
    row.id.getDate()
  );
}

module.exports = CassandraDataEntryRepository;
