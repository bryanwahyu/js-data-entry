// DTO: Data Entry Response
class DataEntryResponse {
  constructor(id, dataType, category, clientId, data, createdAt) {
    this.id = id;
    this.dataType = dataType;
    this.category = category;
    this.clientId = clientId;
    this.data = data;
    this.createdAt = createdAt;
  }

  static fromEntity(entity) {
    return new DataEntryResponse(
      entity.id,
      entity.dataType,
      entity.category,
      entity.clientId,
      entity.data,
      entity.createdAt
    );
  }

  toJSON() {
    return {
      id: this.id,
      data_type: this.dataType,
      category: this.category,
      client_id: this.clientId,
      data: this.data,
      created_at: this.createdAt
    };
  }
}

module.exports = DataEntryResponse;
