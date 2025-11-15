// Use Case: Get Data Entry By ID
const DataEntryResponse = require('../dtos/DataEntryResponse');

class GetDataEntryByIdUseCase {
  constructor(dataEntryRepository) {
    this.repository = dataEntryRepository;
  }

  async execute(id) {
    try {
      const entry = await this.repository.findById(id);

      if (!entry) {
        return {
          success: false,
          error: 'Entry not found'
        };
      }

      return {
        success: true,
        data: DataEntryResponse.fromEntity(entry)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = GetDataEntryByIdUseCase;
