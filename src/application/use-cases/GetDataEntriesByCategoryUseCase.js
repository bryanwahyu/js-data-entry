// Use Case: Get Data Entries By Category
const DataEntryResponse = require('../dtos/DataEntryResponse');

class GetDataEntriesByCategoryUseCase {
  constructor(dataEntryRepository) {
    this.repository = dataEntryRepository;
  }

  async execute(category, limit = 100) {
    try {
      const entries = await this.repository.findByCategory(category, limit);

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

module.exports = GetDataEntriesByCategoryUseCase;
