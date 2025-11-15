// Use Case: Get All Data Entries
const DataEntryResponse = require('../dtos/DataEntryResponse');

class GetAllDataEntriesUseCase {
  constructor(dataEntryRepository) {
    this.repository = dataEntryRepository;
  }

  async execute(limit = 100, pageState = null) {
    try {
      const result = await this.repository.findAll(limit, pageState);

      return {
        success: true,
        count: result.entries.length,
        data: result.entries.map(entry => DataEntryResponse.fromEntity(entry)),
        pageState: result.pageState,
        hasMore: result.hasMore
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = GetAllDataEntriesUseCase;
