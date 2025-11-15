// Domain Service: Data Entry Domain Service
const DataEntry = require('../entities/DataEntry');

class DataEntryDomainService {
  validateJsonStructure(data) {
    try {
      JSON.stringify(data);
      return true;
    } catch (error) {
      throw new Error('Invalid JSON structure: ' + error.message);
    }
  }

  createDataEntry(dataType, category, clientId, data) {
    this.validateJsonStructure(data);
    const entry = DataEntry.create(dataType, category, clientId, data);
    entry.validate();
    return entry;
  }

  // Additional domain logic can be added here
  // For example: data transformation rules, business validations, etc.
}

module.exports = DataEntryDomainService;
