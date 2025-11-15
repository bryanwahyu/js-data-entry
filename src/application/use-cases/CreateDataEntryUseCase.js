// Use Case: Create Data Entry
const DataEntryDomainService = require('../../domain/services/DataEntryDomainService');
const DataEntryResponse = require('../dtos/DataEntryResponse');

class CreateDataEntryUseCase {
  constructor(dataEntryRepository) {
    this.repository = dataEntryRepository;
    this.domainService = new DataEntryDomainService();
  }

  async execute(request) {
    try {
      // Create domain entity using domain service
      const dataEntry = this.domainService.createDataEntry(
        request.dataType,
        request.category,
        request.clientId,
        request.data
      );

      // Persist using repository
      const savedEntry = await this.repository.save(dataEntry);

      // Return DTO
      return {
        success: true,
        data: DataEntryResponse.fromEntity(savedEntry)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = CreateDataEntryUseCase;
