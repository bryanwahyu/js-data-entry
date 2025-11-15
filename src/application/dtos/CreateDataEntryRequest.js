// DTO: Create Data Entry Request
class CreateDataEntryRequest {
  constructor(dataType, category, clientId, data) {
    this.dataType = dataType;
    this.category = category;
    this.clientId = clientId;
    this.data = data;
  }

  static fromRequest(body) {
    return new CreateDataEntryRequest(
      body.data_type || body.dataType,
      body.category,
      body.client_id || body.clientId,
      body.data
    );
  }
}

module.exports = CreateDataEntryRequest;
