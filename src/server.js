const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const Container = require('./config/container');
const DataEntryRoutes = require('./interfaces/api/routes/dataEntryRoutes');
const errorHandler = require('./interfaces/api/middleware/errorHandler');
const requestLogger = require('./interfaces/api/middleware/requestLogger');

const PORT = process.env.PORT || 3000;

class Application {
  constructor() {
    this.app = express();
    this.container = new Container();
  }

  async initialize() {
    // Initialize dependency injection container
    await this.container.initialize();

    // Middleware
    this.app.use(cors());
    this.app.use(bodyParser.json({ limit: '10mb' }));
    this.app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(requestLogger);

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        message: 'API is running',
        timestamp: new Date().toISOString()
      });
    });

    // API Routes
    const dataEntryController = this.container.get('dataEntryController');
    const dataEntryRoutes = new DataEntryRoutes(dataEntryController);
    this.app.use('/api/entries', dataEntryRoutes.getRouter());

    // API Documentation endpoint
    this.app.get('/api', (req, res) => {
      res.json({
        name: 'Data Entry API',
        version: '1.0.0',
        description: 'Dynamic JSON data entry API with Cassandra NoSQL database using DDD architecture',
        endpoints: [
          {
            method: 'GET',
            path: '/health',
            description: 'Health check endpoint'
          },
          {
            method: 'POST',
            path: '/api/entries',
            description: 'Create a new data entry',
            body: {
              data_type: 'string (optional)',
              category: 'string (optional, default: uncategorized)',
              client_id: 'string (required) - identifies who owns this data',
              data: 'object (required) - any valid JSON object'
            }
          },
          {
            method: 'GET',
            path: '/api/entries',
            description: 'Get all data entries',
            queryParams: {
              limit: 'number (optional, default: 100)'
            }
          },
          {
            method: 'GET',
            path: '/api/entries/:id',
            description: 'Get a specific data entry by ID'
          },
          {
            method: 'GET',
            path: '/api/entries/type/:type',
            description: 'Get data entries by type',
            queryParams: {
              limit: 'number (optional, default: 100)'
            }
          },
          {
            method: 'GET',
            path: '/api/entries/category/:category',
            description: 'Get data entries by category',
            queryParams: {
              limit: 'number (optional, default: 100)'
            }
          },
          {
            method: 'GET',
            path: '/api/entries/client/:clientId',
            description: 'Get all data entries for a specific client',
            queryParams: {
              limit: 'number (optional, default: 100)'
            }
          },
          {
            method: 'GET',
            path: '/api/entries/client/:clientId/category/:category',
            description: 'Get data entries for a specific client and category',
            queryParams: {
              limit: 'number (optional, default: 100)'
            }
          }
        ]
      });
    });

    // Error handling middleware (must be last)
    this.app.use(errorHandler);

    console.log('✓ Application initialized');
  }

  start() {
    this.app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log('🚀 Data Entry API Server');
      console.log('='.repeat(50));
      console.log(`📡 Server running at: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`📚 API docs: http://localhost:${PORT}/api`);
      console.log(`🔌 API endpoint: http://localhost:${PORT}/api/entries`);
      console.log('='.repeat(50) + '\n');
    });
  }

  async shutdown() {
    console.log('\n🛑 Shutting down gracefully...');
    await this.container.shutdown();
    process.exit(0);
  }
}

// Bootstrap application
async function bootstrap() {
  try {
    const app = new Application();
    await app.initialize();
    app.start();

    // Graceful shutdown handlers
    process.on('SIGINT', () => app.shutdown());
    process.on('SIGTERM', () => app.shutdown());
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
