// Repository Interface (Port)
class IDataEntryRepository {
  // Create & Update operations
  async save(dataEntry) {
    throw new Error('Method not implemented');
  }

  async update(id, dataEntry) {
    throw new Error('Method not implemented');
  }

  async bulkSave(dataEntries) {
    throw new Error('Method not implemented');
  }

  // Read operations - Basic
  async findById(id) {
    throw new Error('Method not implemented');
  }

  async findAll(limit) {
    throw new Error('Method not implemented');
  }

  async exists(id) {
    throw new Error('Method not implemented');
  }

  // Read operations - Filtering
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

  async findByClientAndType(clientId, dataType, limit) {
    throw new Error('Method not implemented');
  }

  async findByMultipleClients(clientIds, limit) {
    throw new Error('Method not implemented');
  }

  // Read operations - Date range
  async findByDateRange(startDate, endDate, limit) {
    throw new Error('Method not implemented');
  }

  async findByClientAndDateRange(clientId, startDate, endDate, limit) {
    throw new Error('Method not implemented');
  }

  // Statistics & Aggregation
  async countAll() {
    throw new Error('Method not implemented');
  }

  async countByClient(clientId) {
    throw new Error('Method not implemented');
  }

  async countByCategory(category) {
    throw new Error('Method not implemented');
  }

  async countByType(dataType) {
    throw new Error('Method not implemented');
  }

  async getUniqueClients() {
    throw new Error('Method not implemented');
  }

  async getUniqueCategories() {
    throw new Error('Method not implemented');
  }

  async getUniqueTypes() {
    throw new Error('Method not implemented');
  }

  // Delete operations
  async delete(id) {
    throw new Error('Method not implemented');
  }

  async deleteByClient(clientId) {
    throw new Error('Method not implemented');
  }

  async deleteByCategory(category) {
    throw new Error('Method not implemented');
  }

  async bulkDelete(ids) {
    throw new Error('Method not implemented');
  }

  // Search operations
  async search(query, limit) {
    throw new Error('Method not implemented');
  }

  async searchByClient(clientId, query, limit) {
    throw new Error('Method not implemented');
  }
}

module.exports = IDataEntryRepository;
