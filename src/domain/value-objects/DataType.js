// Value Object: DataType
class DataType {
  constructor(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('DataType must be a non-empty string');
    }
    
    this.value = value.toLowerCase().trim();
  }

  equals(other) {
    return other instanceof DataType && this.value === other.value;
  }

  toString() {
    return this.value;
  }
}

module.exports = DataType;
