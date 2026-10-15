const crypto = require('crypto');
const IDataEntryRepository = require('../../src/domain/repositories/IDataEntryRepository');
const DataEntry = require('../../src/domain/entities/DataEntry');

// Same contract as the Cassandra repository: newest first, limit applied.
class InMemoryRepository extends IDataEntryRepository {
  constructor() {
    super();
    this.rows = [];
  }

  async save(entry) {
    const saved = new DataEntry(crypto.randomUUID(), entry.dataType, entry.category, entry.clientId, entry.data, new Date());
    this.rows.unshift(saved);
    return saved;
  }

  async findById(id) {
    return this.rows.find(r => r.id === id) || null;
  }

  async findAll(limit) {
    return { entries: this.rows.slice(0, limit), pageState: null, hasMore: this.rows.length > limit };
  }

  async findByType(dataType, limit) {
    return this.rows.filter(r => r.dataType === dataType).slice(0, limit);
  }

  async findByCategory(category, limit) {
    return this.rows.filter(r => r.category === category).slice(0, limit);
  }

  async findByClient(clientId, limit) {
    return this.rows.filter(r => r.clientId === clientId).slice(0, limit);
  }

  async findByClientAndCategory(clientId, category, limit) {
    return this.rows.filter(r => r.clientId === clientId && r.category === category).slice(0, limit);
  }
}

module.exports = InMemoryRepository;
