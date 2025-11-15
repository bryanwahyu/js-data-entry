// Use Case: Get Data Entries By Client
const DataEntryResponse = require('../dtos/DataEntryResponse');

class GetDataEntriesByClientUseCase {
  constructor(dataEntryRepository) {
    this.repository = dataEntryRepository;
  }

  async execute(clientId, limit = 100) {
    try {
      const entries = await this.repository.findByClient(clientId, limit);

      return {
        success: true,
        count: entries.length,
        data: entries.map(entry => DataEntryResponse.fromEntity(entry))
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = GetDataEntriesByClientUseCase;
