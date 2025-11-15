// Value Object: Category
class Category {
  constructor(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('Category must be a non-empty string');
    }
    
    this.value = value.toLowerCase().trim();
  }

  equals(other) {
    return other instanceof Category && this.value === other.value;
  }

  toString() {
    return this.value;
  }
}

module.exports = Category;
