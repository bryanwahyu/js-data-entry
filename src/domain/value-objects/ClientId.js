// Value Object: ClientId
class ClientId {
  constructor(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('ClientId must be a non-empty string');
    }
    
    this.value = value.trim();
  }

  equals(other) {
    return other instanceof ClientId && this.value === other.value;
  }

  toString() {
    return this.value;
  }
}

module.exports = ClientId;
