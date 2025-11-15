// Cassandra Client Configuration
const cassandra = require('cassandra-driver');
require('dotenv').config();

class CassandraClient {
  constructor() {
    this.client = null;
  }

  async connect() {
    if (this.client) {
      return this.client;
    }

    // First connect without keyspace to create it
    const tempClient = new cassandra.Client({
      contactPoints: process.env.CASSANDRA_CONTACT_POINTS.split(','),
      localDataCenter: process.env.CASSANDRA_LOCAL_DATA_CENTER
    });

    try {
      await tempClient.connect();
      
      // Create keyspace if it doesn't exist
      const createKeyspace = `
        CREATE KEYSPACE IF NOT EXISTS ${process.env.CASSANDRA_KEYSPACE}
        WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}
      `;
      await tempClient.execute(createKeyspace);
      console.log('✓ Keyspace created/verified');

      await tempClient.shutdown();

      // Connect with keyspace
      this.client = new cassandra.Client({
        contactPoints: process.env.CASSANDRA_CONTACT_POINTS.split(','),
        localDataCenter: process.env.CASSANDRA_LOCAL_DATA_CENTER,
        keyspace: process.env.CASSANDRA_KEYSPACE
      });

      await this.client.connect();
      console.log('✓ Connected to Cassandra');

      // Initialize schema
      await this.initializeSchema();

      return this.client;
    } catch (error) {
      console.error('Cassandra connection error:', error);
      throw error;
    }
  }

  async initializeSchema() {
    // Create table for dynamic JSON storage with category and client tracking
    const createTable = `
      CREATE TABLE IF NOT EXISTS entries (
        id UUID PRIMARY KEY,
        created_at TIMESTAMP,
        data_type TEXT,
        category TEXT,
        client_id TEXT,
        json_data TEXT
      )
    `;
    await this.client.execute(createTable);
    console.log('✓ Table created/verified');

    // Create index for searching by data_type
    const createTypeIndex = `
      CREATE INDEX IF NOT EXISTS ON entries (data_type)
    `;
    await this.client.execute(createTypeIndex);
    console.log('✓ Type index created/verified');

    // Create index for searching by category
    const createCategoryIndex = `
      CREATE INDEX IF NOT EXISTS ON entries (category)
    `;
    await this.client.execute(createCategoryIndex);
    console.log('✓ Category index created/verified');

    // Create index for searching by client_id
    const createClientIndex = `
      CREATE INDEX IF NOT EXISTS ON entries (client_id)
    `;
    await this.client.execute(createClientIndex);
    console.log('✓ Client index created/verified');
  }

  async shutdown() {
    if (this.client) {
      await this.client.shutdown();
      this.client = null;
      console.log('✓ Cassandra connection closed');
    }
  }

  getClient() {
    if (!this.client) {
      throw new Error('Cassandra client not connected. Call connect() first.');
    }
    return this.client;
  }
}

// Singleton instance
const cassandraClient = new CassandraClient();

module.exports = cassandraClient;
