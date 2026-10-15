const { test } = require('node:test');
const assert = require('node:assert/strict');

const DataEntryDomainService = require('../src/domain/services/DataEntryDomainService');
const Category = require('../src/domain/value-objects/Category');
const DataType = require('../src/domain/value-objects/DataType');
const ClientId = require('../src/domain/value-objects/ClientId');

test('domain service builds a valid entry with defaults', () => {
  const entry = new DataEntryDomainService().createDataEntry(undefined, undefined, 'acme', { a: 1 });
  assert.equal(entry.dataType, 'general');
  assert.equal(entry.category, 'uncategorized');
  assert.equal(entry.clientId, 'acme');
});

test('domain service rejects missing client and non-object data', () => {
  const svc = new DataEntryDomainService();
  assert.throws(() => svc.createDataEntry('t', 'c', '', { a: 1 }), /Client ID/);
  assert.throws(() => svc.createDataEntry('t', 'c', 'acme', 'text'), /object/);
  assert.throws(() => svc.createDataEntry('t', 'c', 'acme', null), /null/);
});

test('value objects normalise and compare by value', () => {
  assert.ok(new Category(' Orders ').equals(new Category('orders')));
  assert.ok(new DataType('ORDER').equals(new DataType('order')));
  assert.ok(new ClientId(' acme ').equals(new ClientId('acme')));
  assert.ok(!new ClientId('Acme').equals(new ClientId('acme')));
  assert.throws(() => new Category(''));
});
