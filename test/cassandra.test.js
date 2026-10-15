const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');

// Runs only when a Cassandra node is reachable, e.g.
//   docker compose up -d cassandra
//   CASSANDRA_CONTACT_POINTS=127.0.0.1 CASSANDRA_LOCAL_DATA_CENTER=datacenter1 npm test
const enabled = Boolean(process.env.CASSANDRA_CONTACT_POINTS);
const opts = { skip: !enabled && 'CASSANDRA_CONTACT_POINTS not set', timeout: 60_000 };

let client;
let repo;
const run = `t${Date.now()}`;

before(async () => {
  if (!enabled) return;
  process.env.CASSANDRA_KEYSPACE = process.env.CASSANDRA_KEYSPACE || 'data_entry_test';
  client = require('../src/infrastructure/database/CassandraClient');
  const Repository = require('../src/infrastructure/repositories/CassandraDataEntryRepository');
  const DataEntry = require('../src/domain/entities/DataEntry');
  await client.connect();
  repo = new Repository(client);
  repo.build = (clientId, category, dataType, data) => DataEntry.create(dataType, category, clientId, data);
}, { timeout: 120_000 });

after(async () => {
  if (client) await client.shutdown();
});

test('save writes every query table and reads come back newest first', opts, async () => {
  const clientId = `${run}-acme`;
  const first = await repo.save(repo.build(clientId, 'orders', 'order', { n: 1 }));
  const second = await repo.save(repo.build(clientId, 'orders', 'order', { n: 2 }));
  const other = await repo.save(repo.build(clientId, 'invoices', 'invoice', { n: 3 }));

  const byId = await repo.findById(second.id);
  assert.deepEqual(byId.data, { n: 2 });
  assert.ok(byId.createdAt instanceof Date);

  const byClient = await repo.findByClient(clientId, 10);
  assert.deepEqual(byClient.map(e => e.data.n), [3, 2, 1]);

  const byClientCategory = await repo.findByClientAndCategory(clientId, 'orders', 10);
  assert.deepEqual(byClientCategory.map(e => e.id), [second.id, first.id]);

  const byType = await repo.findByType('invoice', 1000);
  assert.ok(byType.some(e => e.id === other.id));
});

test('limit is applied per partition', opts, async () => {
  const clientId = `${run}-globex`;
  for (let i = 0; i < 5; i++) await repo.save(repo.build(clientId, 'logs', 'event', { i }));
  const page = await repo.findByClient(clientId, 2);
  assert.deepEqual(page.map(e => e.data.i), [4, 3]);
});

test('malformed or unknown ids are not found', opts, async () => {
  assert.equal(await repo.findById('not-a-uuid'), null);
  assert.equal(await repo.findById('00000000-0000-1000-8000-000000000000'), null);
});

test('findAll pages with pageState', opts, async () => {
  const page1 = await repo.findAll(2, null);
  assert.equal(page1.entries.length, 2);
  assert.equal(page1.hasMore, true);
  const page2 = await repo.findAll(2, page1.pageState);
  assert.ok(page2.entries.every(e => !page1.entries.some(p => p.id === e.id)));
});
