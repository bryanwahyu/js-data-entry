// Repository Interface (Port)
class IDataEntryRepository {
  async save(dataEntry) {
    throw new Error('Method not implemented');
  }

  async findById(id) {
    throw new Error('Method not implemented');
  }

  async findAll(limit, pageState) {
    throw new Error('Method not implemented');
  }

  async findByType(dataType, limit) {
    throw new Error('Method not implemented');
  }

  async findByCategory(category, limit) {
    throw new Error('Method not implemented');
  }

  async findByClient(clientId, limit) {
    throw new Error('Method not implemented');
  }

  async findByClientAndCategory(clientId, category, limit) {
    throw new Error('Method not implemented');
  }
}

module.exports = IDataEntryRepository;
