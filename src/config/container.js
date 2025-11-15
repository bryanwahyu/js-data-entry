// Dependency Injection Container
const CassandraClient = require('../infrastructure/database/CassandraClient');
const CassandraDataEntryRepository = require('../infrastructure/repositories/CassandraDataEntryRepository');
const CreateDataEntryUseCase = require('../application/use-cases/CreateDataEntryUseCase');
const GetDataEntryByIdUseCase = require('../application/use-cases/GetDataEntryByIdUseCase');
const GetAllDataEntriesUseCase = require('../application/use-cases/GetAllDataEntriesUseCase');
const GetDataEntriesByTypeUseCase = require('../application/use-cases/GetDataEntriesByTypeUseCase');
const GetDataEntriesByCategoryUseCase = require('../application/use-cases/GetDataEntriesByCategoryUseCase');
const GetDataEntriesByClientUseCase = require('../application/use-cases/GetDataEntriesByClientUseCase');
const GetDataEntriesByClientAndCategoryUseCase = require('../application/use-cases/GetDataEntriesByClientAndCategoryUseCase');
const DataEntryController = require('../interfaces/api/controllers/DataEntryController');

class Container {
  constructor() {
    this.services = {};
  }

  async initialize() {
    // Infrastructure Layer
    this.services.cassandraClient = CassandraClient;
    await this.services.cassandraClient.connect();

    this.services.dataEntryRepository = new CassandraDataEntryRepository(
      this.services.cassandraClient
    );

    // Application Layer - Use Cases
    this.services.createDataEntryUseCase = new CreateDataEntryUseCase(
      this.services.dataEntryRepository
    );

    this.services.getDataEntryByIdUseCase = new GetDataEntryByIdUseCase(
      this.services.dataEntryRepository
    );

    this.services.getAllDataEntriesUseCase = new GetAllDataEntriesUseCase(
      this.services.dataEntryRepository
    );

    this.services.getDataEntriesByTypeUseCase = new GetDataEntriesByTypeUseCase(
      this.services.dataEntryRepository
    );

    this.services.getDataEntriesByCategoryUseCase = new GetDataEntriesByCategoryUseCase(
      this.services.dataEntryRepository
    );

    this.services.getDataEntriesByClientUseCase = new GetDataEntriesByClientUseCase(
      this.services.dataEntryRepository
    );

    this.services.getDataEntriesByClientAndCategoryUseCase = new GetDataEntriesByClientAndCategoryUseCase(
      this.services.dataEntryRepository
    );

    // Interface Layer - Controllers
    this.services.dataEntryController = new DataEntryController(
      this.services.createDataEntryUseCase,
      this.services.getDataEntryByIdUseCase,
      this.services.getAllDataEntriesUseCase,
      this.services.getDataEntriesByTypeUseCase,
      this.services.getDataEntriesByCategoryUseCase,
      this.services.getDataEntriesByClientUseCase,
      this.services.getDataEntriesByClientAndCategoryUseCase
    );

    console.log('✓ Dependency injection container initialized');
  }

  get(serviceName) {
    if (!this.services[serviceName]) {
      throw new Error(`Service ${serviceName} not found in container`);
    }
    return this.services[serviceName];
  }

  async shutdown() {
    if (this.services.cassandraClient) {
      await this.services.cassandraClient.shutdown();
    }
  }
}

module.exports = Container;
