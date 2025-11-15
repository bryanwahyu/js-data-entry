// Use Case: Get Data Entries By Client And Category
const DataEntryResponse = require('../dtos/DataEntryResponse');

class GetDataEntriesByClientAndCategoryUseCase {
  constructor(dataEntryRepository) {
    this.repository = dataEntryRepository;
  }

  async execute(clientId, category, limit = 100) {
    try {
      const entries = await this.repository.findByClientAndCategory(clientId, category, limit);

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

module.exports = GetDataEntriesByClientAndCategoryUseCase;
