const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

const InMemoryRepository = require('./support/inMemoryRepository');
const DataEntryRoutes = require('../src/interfaces/api/routes/dataEntryRoutes');
const DataEntryController = require('../src/interfaces/api/controllers/DataEntryController');
const useCases = [
  'CreateDataEntryUseCase',
  'GetDataEntryByIdUseCase',
  'GetAllDataEntriesUseCase',
  'GetDataEntriesByTypeUseCase',
  'GetDataEntriesByCategoryUseCase',
  'GetDataEntriesByClientUseCase',
  'GetDataEntriesByClientAndCategoryUseCase'
].map(name => require(`../src/application/use-cases/${name}`));

let server;
let base;

before(async () => {
  const repo = new InMemoryRepository();
  const controller = new DataEntryController(...useCases.map(UseCase => new UseCase(repo)));
  const app = express();
  app.use(express.json());
  app.use('/api/entries', new DataEntryRoutes(controller).getRouter());
  await new Promise(resolve => { server = app.listen(0, resolve); });
  base = `http://127.0.0.1:${server.address().port}/api/entries`;
});

after(() => server.close());

async function post(body) {
  const res = await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { status: res.status, body: await res.json() };
}

async function get(path) {
  const res = await fetch(base + path);
  return { status: res.status, body: await res.json() };
}

test('create then read back by id', async () => {
  const created = await post({ client_id: 'acme', category: 'orders', data_type: 'order', data: { sku: 'A-1', qty: 2 } });
  assert.equal(created.status, 201);
  assert.deepEqual(created.body.data.data, { sku: 'A-1', qty: 2 });

  const fetched = await get(`/${created.body.data.id}`);
  assert.equal(fetched.status, 200);
  assert.equal(fetched.body.data.client_id, 'acme');
});

test('category and data type default when omitted', async () => {
  const created = await post({ client_id: 'acme', data: { note: 'x' } });
  assert.equal(created.body.data.category, 'uncategorized');
  assert.equal(created.body.data.data_type, 'general');
});

test('client_id and an object payload are required', async () => {
  assert.equal((await post({ data: { a: 1 } })).status, 400);
  assert.equal((await post({ client_id: 'acme', data: 'not an object' })).status, 400);
  assert.equal((await post({ client_id: 'acme' })).status, 400);
});

test('reads are scoped by client and by client + category', async () => {
  await post({ client_id: 'globex', category: 'invoices', data: { n: 1 } });
  await post({ client_id: 'globex', category: 'orders', data: { n: 2 } });

  const byClient = await get('/client/globex');
  assert.equal(byClient.body.count, 2);
  assert.ok(byClient.body.data.every(e => e.client_id === 'globex'));

  const byClientCategory = await get('/client/globex/category/invoices');
  assert.equal(byClientCategory.body.count, 1);
  assert.deepEqual(byClientCategory.body.data[0].data, { n: 1 });
});

test('unknown id is 404', async () => {
  assert.equal((await get('/00000000-0000-1000-8000-000000000000')).status, 404);
});

test('limit is clamped to a sane range', async () => {
  for (let i = 0; i < 3; i++) await post({ client_id: 'initech', data: { i } });
  assert.equal((await get('/client/initech?limit=2')).body.count, 2);
  assert.equal((await get('/client/initech?limit=-5')).body.count, 3);
  assert.equal((await get('/client/initech?limit=abc')).body.count, 3);
});
