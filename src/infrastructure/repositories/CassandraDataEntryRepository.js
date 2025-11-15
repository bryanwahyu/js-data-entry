// Infrastructure: Cassandra Data Entry Repository Implementation
const cassandra = require('cassandra-driver');
const IDataEntryRepository = require('../../domain/repositories/IDataEntryRepository');
const DataEntry = require('../../domain/entities/DataEntry');

class CassandraDataEntryRepository extends IDataEntryRepository {
  constructor(cassandraClient) {
    super();
    this.client = cassandraClient;
  }

  async save(dataEntry) {
    try {
      // For Cassandra versions that don't support RETURNING, we'll use a different approach
      const id = cassandra.types.Uuid.random();
      const createdAt = new Date();
      
      const insertQuery = `
        INSERT INTO entries (id, created_at, data_type, category, client_id, json_data)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      await this.client.getClient().execute(
        insertQuery,
        [id, createdAt, dataEntry.dataType, dataEntry.category, dataEntry.clientId, JSON.stringify(dataEntry.data)],
        { prepare: true }
      );

      // Return the entity with the generated ID
      return new DataEntry(
        id.toString(),
        dataEntry.dataType,
        dataEntry.category,
        dataEntry.clientId,
        dataEntry.data,
        createdAt
      );
    } catch (error) {
      console.error('Repository save error:', error);
      throw new Error('Failed to save data entry: ' + error.message);
    }
  }

  async findById(id) {
    const query = 'SELECT id, created_at, data_type, category, client_id, json_data FROM entries WHERE id = ?';

    try {
      const result = await this.client.getClient().execute(
        query,
        [cassandra.types.Uuid.fromString(id)],
        { prepare: true }
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return new DataEntry(
        row.id.toString(),
        row.data_type,
        row.category,
        row.client_id,
        JSON.parse(row.json_data),
        row.created_at
      );
    } catch (error) {
      console.error('Repository findById error:', error);
      throw new Error('Failed to find entry: ' + error.message);
    }
  }

  async findAll(limit = 100, pageState = null) {
    // For large datasets, use pagination with pageState
    const query = 'SELECT id, created_at, data_type, category, client_id, json_data FROM entries';

    try {
      const options = {
        prepare: true,
        fetchSize: limit || 1000, // Default fetch size
        pageState: pageState // Continue from previous page
      };

      const result = await this.client.getClient().execute(query, [], options);

      const entries = result.rows.map(row => new DataEntry(
        row.id.toString(),
        row.data_type,
        row.category,
        row.client_id,
        JSON.parse(row.json_data),
        row.created_at
      ));

      // Return entries with pagination info
      return {
        entries,
        pageState: result.pageState, // Token for next page
        hasMore: !!result.pageState  // Boolean indicating more data
      };
    } catch (error) {
      console.error('Repository findAll error:', error);
      throw new Error('Failed to find entries: ' + error.message);
    }
  }

  // Alternative: Stream all data in chunks (for batch processing)
  async streamAll(onChunk, chunkSize = 1000) {
    let pageState = null;
    let totalProcessed = 0;

    try {
      do {
        const result = await this.findAll(chunkSize, pageState);
        
        if (result.entries.length > 0) {
          await onChunk(result.entries);
          totalProcessed += result.entries.length;
        }

        pageState = result.pageState;
      } while (pageState);

      return totalProcessed;
    } catch (error) {
      console.error('Repository streamAll error:', error);
      throw new Error('Failed to stream all entries: ' + error.message);
    }
  }

  async findByType(dataType, limit = 100) {
    const query = 'SELECT id, created_at, data_type, category, client_id, json_data FROM entries WHERE data_type = ? LIMIT ? ALLOW FILTERING';

    try {
      const result = await this.client.getClient().execute(
        query,
        [dataType, limit],
        { prepare: true }
      );

      return result.rows.map(row => new DataEntry(
        row.id.toString(),
        row.data_type,
        row.category,
        row.client_id,
        JSON.parse(row.json_data),
        row.created_at
      ));
    } catch (error) {
      console.error('Repository findByType error:', error);
      throw new Error('Failed to find entries by type: ' + error.message);
    }
  }

  async findByCategory(category, limit = 100) {
    const query = 'SELECT id, created_at, data_type, category, client_id, json_data FROM entries WHERE category = ? LIMIT ? ALLOW FILTERING';

    try {
      const result = await this.client.getClient().execute(
        query,
        [category, limit],
        { prepare: true }
      );

      return result.rows.map(row => new DataEntry(
        row.id.toString(),
        row.data_type,
        row.category,
        row.client_id,
        JSON.parse(row.json_data),
        row.created_at
      ));
    } catch (error) {
      console.error('Repository findByCategory error:', error);
      throw new Error('Failed to find entries by category: ' + error.message);
    }
  }

  async findByClient(clientId, limit = 100) {
    const query = 'SELECT id, created_at, data_type, category, client_id, json_data FROM entries WHERE client_id = ? LIMIT ? ALLOW FILTERING';

    try {
      const result = await this.client.getClient().execute(
        query,
        [clientId, limit],
        { prepare: true }
      );

      return result.rows.map(row => new DataEntry(
        row.id.toString(),
        row.data_type,
        row.category,
        row.client_id,
        JSON.parse(row.json_data),
        row.created_at
      ));
    } catch (error) {
      console.error('Repository findByClient error:', error);
      throw new Error('Failed to find entries by client: ' + error.message);
    }
  }

  async findByClientAndCategory(clientId, category, limit = 100) {
    const query = 'SELECT id, created_at, data_type, category, client_id, json_data FROM entries WHERE client_id = ? AND category = ? LIMIT ? ALLOW FILTERING';

    try {
      const result = await this.client.getClient().execute(
        query,
        [clientId, category, limit],
        { prepare: true }
      );

      return result.rows.map(row => new DataEntry(
        row.id.toString(),
        row.data_type,
        row.category,
        row.client_id,
        JSON.parse(row.json_data),
        row.created_at
      ));
    } catch (error) {
      console.error('Repository findByClientAndCategory error:', error);
      throw new Error('Failed to find entries by client and category: ' + error.message);
    }
  }

  async delete(id) {
    const query = 'DELETE FROM entries WHERE id = ?';

    try {
      await this.client.getClient().execute(
        query,
        [cassandra.types.Uuid.fromString(id)],
        { prepare: true }
      );

      return true;
    } catch (error) {
      console.error('Repository delete error:', error);
      throw new Error('Failed to delete entry: ' + error.message);
    }
  }

  // ==================== UPDATE OPERATIONS ====================
  
  async update(id, dataEntry) {
    const query = `
      UPDATE entries 
      SET data_type = ?, category = ?, client_id = ?, json_data = ?
      WHERE id = ?
    `;

    try {
      await this.client.getClient().execute(
        query,
        [dataEntry.dataType, dataEntry.category, dataEntry.clientId, JSON.stringify(dataEntry.data), cassandra.types.Uuid.fromString(id)],
        { prepare: true }
      );

      // Return updated entry
      return await this.findById(id);
    } catch (error) {
      console.error('Repository update error:', error);
      throw new Error('Failed to update entry: ' + error.message);
    }
  }

  async bulkSave(dataEntries) {
    const insertQuery = `
      INSERT INTO entries (id, created_at, data_type, category, client_id, json_data)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    try {
      const batch = [];
      const savedEntries = [];

      for (const dataEntry of dataEntries) {
        const id = cassandra.types.Uuid.random();
        const createdAt = new Date();
        
        batch.push({
          query: insertQuery,
          params: [id, createdAt, dataEntry.dataType, dataEntry.category, dataEntry.clientId, JSON.stringify(dataEntry.data)]
        });

        savedEntries.push(new DataEntry(
          id.toString(),
          dataEntry.dataType,
          dataEntry.category,
          dataEntry.clientId,
          dataEntry.data,
          createdAt
        ));
      }

      await this.client.getClient().batch(batch, { prepare: true });
      return savedEntries;
    } catch (error) {
      console.error('Repository bulkSave error:', error);
      throw new Error('Failed to bulk save entries: ' + error.message);
    }
  }

  // ==================== BASIC READ OPERATIONS ====================

  async exists(id) {
    const query = 'SELECT id FROM entries WHERE id = ?';

    try {
      const result = await this.client.getClient().execute(
        query,
        [cassandra.types.Uuid.fromString(id)],
        { prepare: true }
      );

      return result.rows.length > 0;
    } catch (error) {
      console.error('Repository exists error:', error);
      throw new Error('Failed to check if entry exists: ' + error.message);
    }
  }

  // ==================== ENHANCED FILTERING ====================

  async findByClientAndType(clientId, dataType, limit = 100) {
    const query = 'SELECT id, created_at, data_type, category, client_id, json_data FROM entries WHERE client_id = ? AND data_type = ? LIMIT ? ALLOW FILTERING';

    try {
      const result = await this.client.getClient().execute(
        query,
        [clientId, dataType, limit],
        { prepare: true }
      );

      return result.rows.map(row => new DataEntry(
        row.id.toString(),
        row.data_type,
        row.category,
        row.client_id,
        JSON.parse(row.json_data),
        row.created_at
      ));
    } catch (error) {
      console.error('Repository findByClientAndType error:', error);
      throw new Error('Failed to find entries by client and type: ' + error.message);
    }
  }

  async findByMultipleClients(clientIds, limit = 100) {
    const query = 'SELECT id, created_at, data_type, category, client_id, json_data FROM entries WHERE client_id IN ? LIMIT ? ALLOW FILTERING';

    try {
      const result = await this.client.getClient().execute(
        query,
        [clientIds, limit],
        { prepare: true }
      );

      return result.rows.map(row => new DataEntry(
        row.id.toString(),
        row.data_type,
        row.category,
        row.client_id,
        JSON.parse(row.json_data),
        row.created_at
      ));
    } catch (error) {
      console.error('Repository findByMultipleClients error:', error);
      throw new Error('Failed to find entries by multiple clients: ' + error.message);
    }
  }

  // ==================== DATE RANGE OPERATIONS ====================

  async findByDateRange(startDate, endDate, limit = 100) {
    const query = 'SELECT id, created_at, data_type, category, client_id, json_data FROM entries WHERE created_at >= ? AND created_at <= ? LIMIT ? ALLOW FILTERING';

    try {
      const result = await this.client.getClient().execute(
        query,
        [startDate, endDate, limit],
        { prepare: true }
      );

      return result.rows.map(row => new DataEntry(
        row.id.toString(),
        row.data_type,
        row.category,
        row.client_id,
        JSON.parse(row.json_data),
        row.created_at
      ));
    } catch (error) {
      console.error('Repository findByDateRange error:', error);
      throw new Error('Failed to find entries by date range: ' + error.message);
    }
  }

  async findByClientAndDateRange(clientId, startDate, endDate, limit = 100) {
    const query = 'SELECT id, created_at, data_type, category, client_id, json_data FROM entries WHERE client_id = ? AND created_at >= ? AND created_at <= ? LIMIT ? ALLOW FILTERING';

    try {
      const result = await this.client.getClient().execute(
        query,
        [clientId, startDate, endDate, limit],
        { prepare: true }
      );

      return result.rows.map(row => new DataEntry(
        row.id.toString(),
        row.data_type,
        row.category,
        row.client_id,
        JSON.parse(row.json_data),
        row.created_at
      ));
    } catch (error) {
      console.error('Repository findByClientAndDateRange error:', error);
      throw new Error('Failed to find entries by client and date range: ' + error.message);
    }
  }

  // ==================== STATISTICS & AGGREGATION ====================

  async countAll() {
    const query = 'SELECT COUNT(*) as count FROM entries';

    try {
      const result = await this.client.getClient().execute(query);
      return result.rows[0].count.toNumber();
    } catch (error) {
      console.error('Repository countAll error:', error);
      throw new Error('Failed to count all entries: ' + error.message);
    }
  }

  async countByClient(clientId) {
    const query = 'SELECT COUNT(*) as count FROM entries WHERE client_id = ? ALLOW FILTERING';

    try {
      const result = await this.client.getClient().execute(
        query,
        [clientId],
        { prepare: true }
      );
      return result.rows[0].count.toNumber();
    } catch (error) {
      console.error('Repository countByClient error:', error);
      throw new Error('Failed to count entries by client: ' + error.message);
    }
  }

  async countByCategory(category) {
    const query = 'SELECT COUNT(*) as count FROM entries WHERE category = ? ALLOW FILTERING';

    try {
      const result = await this.client.getClient().execute(
        query,
        [category],
        { prepare: true }
      );
      return result.rows[0].count.toNumber();
    } catch (error) {
      console.error('Repository countByCategory error:', error);
      throw new Error('Failed to count entries by category: ' + error.message);
    }
  }

  async countByType(dataType) {
    const query = 'SELECT COUNT(*) as count FROM entries WHERE data_type = ? ALLOW FILTERING';

    try {
      const result = await this.client.getClient().execute(
        query,
        [dataType],
        { prepare: true }
      );
      return result.rows[0].count.toNumber();
    } catch (error) {
      console.error('Repository countByType error:', error);
      throw new Error('Failed to count entries by type: ' + error.message);
    }
  }

  async getUniqueClients() {
    const query = 'SELECT DISTINCT client_id FROM entries';

    try {
      const result = await this.client.getClient().execute(query);
      return result.rows.map(row => row.client_id);
    } catch (error) {
      console.error('Repository getUniqueClients error:', error);
      throw new Error('Failed to get unique clients: ' + error.message);
    }
  }

  async getUniqueCategories() {
    const query = 'SELECT DISTINCT category FROM entries';

    try {
      const result = await this.client.getClient().execute(query);
      return result.rows.map(row => row.category);
    } catch (error) {
      console.error('Repository getUniqueCategories error:', error);
      throw new Error('Failed to get unique categories: ' + error.message);
    }
  }

  async getUniqueTypes() {
    const query = 'SELECT DISTINCT data_type FROM entries';

    try {
      const result = await this.client.getClient().execute(query);
      return result.rows.map(row => row.data_type);
    } catch (error) {
      console.error('Repository getUniqueTypes error:', error);
      throw new Error('Failed to get unique types: ' + error.message);
    }
  }

  // ==================== DELETE OPERATIONS ====================

  async deleteByClient(clientId) {
    // Note: In Cassandra, delete by non-primary key requires fetching IDs first
    const entries = await this.findByClient(clientId, 1000);
    const deleteQuery = 'DELETE FROM entries WHERE id = ?';

    try {
      const batch = entries.map(entry => ({
        query: deleteQuery,
        params: [cassandra.types.Uuid.fromString(entry.id)]
      }));

      if (batch.length > 0) {
        await this.client.getClient().batch(batch, { prepare: true });
      }

      return batch.length;
    } catch (error) {
      console.error('Repository deleteByClient error:', error);
      throw new Error('Failed to delete entries by client: ' + error.message);
    }
  }

  async deleteByCategory(category) {
    const entries = await this.findByCategory(category, 1000);
    const deleteQuery = 'DELETE FROM entries WHERE id = ?';

    try {
      const batch = entries.map(entry => ({
        query: deleteQuery,
        params: [cassandra.types.Uuid.fromString(entry.id)]
      }));

      if (batch.length > 0) {
        await this.client.getClient().batch(batch, { prepare: true });
      }

      return batch.length;
    } catch (error) {
      console.error('Repository deleteByCategory error:', error);
      throw new Error('Failed to delete entries by category: ' + error.message);
    }
  }

  async bulkDelete(ids) {
    const deleteQuery = 'DELETE FROM entries WHERE id = ?';

    try {
      const batch = ids.map(id => ({
        query: deleteQuery,
        params: [cassandra.types.Uuid.fromString(id)]
      }));

      if (batch.length > 0) {
        await this.client.getClient().batch(batch, { prepare: true });
      }

      return batch.length;
    } catch (error) {
      console.error('Repository bulkDelete error:', error);
      throw new Error('Failed to bulk delete entries: ' + error.message);
    }
  }

  // ==================== SEARCH OPERATIONS ====================

  async search(query, limit = 100) {
    // For basic search, we'll search in json_data field
    // Note: This uses ALLOW FILTERING which may be slow on large datasets
    const searchQuery = `
      SELECT id, created_at, data_type, category, client_id, json_data 
      FROM entries 
      WHERE json_data LIKE ? 
      LIMIT ? 
      ALLOW FILTERING
    `;

    try {
      const result = await this.client.getClient().execute(
        searchQuery,
        [`%${query}%`, limit],
        { prepare: true }
      );

      return result.rows.map(row => new DataEntry(
        row.id.toString(),
        row.data_type,
        row.category,
        row.client_id,
        JSON.parse(row.json_data),
        row.created_at
      ));
    } catch (error) {
      // If LIKE is not supported, fallback to client-side filtering
      console.warn('Search with LIKE not supported, using client-side filtering');
      const allEntries = await this.findAll(limit * 10);
      return allEntries.filter(entry => 
        JSON.stringify(entry.data).toLowerCase().includes(query.toLowerCase())
      ).slice(0, limit);
    }
  }

  async searchByClient(clientId, query, limit = 100) {
    try {
      const clientEntries = await this.findByClient(clientId, limit * 10);
      return clientEntries.filter(entry => 
        JSON.stringify(entry.data).toLowerCase().includes(query.toLowerCase())
      ).slice(0, limit);
    } catch (error) {
      console.error('Repository searchByClient error:', error);
      throw new Error('Failed to search entries by client: ' + error.message);
    }
  }
}

module.exports = CassandraDataEntryRepository;
