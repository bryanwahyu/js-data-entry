// Use Case: Get Data Entries By Type
const DataEntryResponse = require('../dtos/DataEntryResponse');

class GetDataEntriesByTypeUseCase {
  constructor(dataEntryRepository) {
    this.repository = dataEntryRepository;
  }

  async execute(dataType, limit = 100) {
    try {
      const entries = await this.repository.findByType(dataType, limit);

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

module.exports = GetDataEntriesByTypeUseCase;
