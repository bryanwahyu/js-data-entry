// Cassandra Client Configuration
const fs = require('fs');
const path = require('path');
const cassandra = require('cassandra-driver');
require('dotenv').config();

const SCHEMA_DIR = path.join(__dirname, '..', '..', '..', 'schema');

class CassandraClient {
  constructor() {
    this.client = null;
  }

  async connect() {
    if (this.client) {
      return this.client;
    }

    const contactPoints = process.env.CASSANDRA_CONTACT_POINTS.split(',');
    const localDataCenter = process.env.CASSANDRA_LOCAL_DATA_CENTER;
    const keyspace = process.env.CASSANDRA_KEYSPACE;
    const replicationFactor = parseInt(process.env.CASSANDRA_REPLICATION_FACTOR, 10) || 1;

    const bootstrap = new cassandra.Client({ contactPoints, localDataCenter });
    try {
      await bootstrap.connect();
      await bootstrap.execute(
        `CREATE KEYSPACE IF NOT EXISTS ${keyspace}
         WITH replication = {'class': 'SimpleStrategy', 'replication_factor': ${replicationFactor}}`
      );
    } finally {
      await bootstrap.shutdown();
    }

    this.client = new cassandra.Client({
      contactPoints,
      localDataCenter,
      keyspace,
      queryOptions: {
        consistency: cassandra.types.consistencies.localQuorum,
        prepare: true
      }
    });
    await this.client.connect();
    await this.migrate();
    console.log('✓ Connected to Cassandra');

    return this.client;
  }

  // Runs every schema/*.cql file in name order. Statements use IF NOT EXISTS,
  // so running them on every start is safe.
  async migrate() {
    const files = fs.readdirSync(SCHEMA_DIR).filter(f => f.endsWith('.cql')).sort();
    for (const file of files) {
      const statements = fs.readFileSync(path.join(SCHEMA_DIR, file), 'utf8')
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .split(';')
        .map(s => s.trim())
        .filter(Boolean);
      for (const statement of statements) {
        await this.client.execute(statement, [], { prepare: false });
      }
    }
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
