# Dynamic JSON Data Entry API

A RESTful API for dynamic JSON data entry using **Node.js**, **Express**, **Cassandra NoSQL**, and **Domain-Driven Design (DDD)** architecture with **category** and **client tracking**.

## 🏗️ Architecture

This project follows **Domain-Driven Design (DDD)** principles with clear separation of concerns:

```
src/
├── domain/                    # Domain Layer (Business Logic)
│   ├── entities/              # Domain Entities
│   │   └── DataEntry.js
│   ├── value-objects/         # Value Objects
│   │   └── DataType.js
│   ├── repositories/          # Repository Interfaces (Ports)
│   │   └── IDataEntryRepository.js
│   └── services/              # Domain Services
│       └── DataEntryDomainService.js
│
├── application/               # Application Layer (Use Cases)
│   ├── dtos/                  # Data Transfer Objects
│   │   ├── CreateDataEntryRequest.js
│   │   └── DataEntryResponse.js
│   └── use-cases/             # Application Use Cases
│       ├── CreateDataEntryUseCase.js
│       ├── GetDataEntryByIdUseCase.js
│       ├── GetAllDataEntriesUseCase.js
│       └── GetDataEntriesByTypeUseCase.js
│
├── infrastructure/            # Infrastructure Layer (Technical Details)
│   ├── database/              # Database Connections
│   │   └── CassandraClient.js
│   └── repositories/          # Repository Implementations
│       └── CassandraDataEntryRepository.js
│
├── interfaces/                # Interface Layer (API/Controllers)
│   └── api/
│       ├── controllers/       # REST Controllers
│       │   └── DataEntryController.js
│       ├── routes/            # API Routes
│       │   └── dataEntryRoutes.js
│       └── middleware/        # Middleware
│           ├── errorHandler.js
│           └── requestLogger.js
│
├── config/                    # Configuration
│   └── container.js           # Dependency Injection Container
│
└── server.js                  # Application Entry Point
```

## 🎯 DDD Layers Explained

### 1. **Domain Layer** (Business Logic)
- **Entities**: Core business objects (`DataEntry`)
- **Value Objects**: Immutable objects representing concepts (`DataType`)
- **Repository Interfaces**: Contracts for data access
- **Domain Services**: Business logic that doesn't fit in entities

### 2. **Application Layer** (Use Cases)
- **Use Cases**: Application-specific business rules
- **DTOs**: Data transfer objects for input/output
- Orchestrates domain objects to fulfill use cases

### 3. **Infrastructure Layer** (Technical Implementation)
- **Database**: Cassandra client and connection management
- **Repositories**: Concrete implementations of repository interfaces
- External services and technical concerns

### 4. **Interface Layer** (API)
- **Controllers**: Handle HTTP requests/responses
- **Routes**: API endpoint definitions
- **Middleware**: Request processing pipeline

## 📋 Features

- ✅ Accept **any JSON structure** dynamically
- ✅ Store data in **Cassandra NoSQL** database
- ✅ **Client tracking** - track which client owns each data entry
- ✅ **Category organization** - organize data by categories
- ✅ **Domain-Driven Design** architecture
- ✅ RESTful API with full CRUD operations
- ✅ Type-based, category-based, and client-based filtering
- ✅ Dependency injection for loose coupling
- ✅ Error handling and logging middleware
- ✅ **Docker** support for easy deployment

## 🚀 Installation

### Option 1: Docker (Recommended)

The easiest way to run the application with all dependencies:

```bash
# Start all services (API + Cassandra)
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

The API will be available at `http://localhost:3000`

### Option 2: Manual Installation

#### Prerequisites

1. **Node.js** (v14 or higher)
2. **Apache Cassandra** (v3.11 or higher)

### Install Cassandra (macOS)

```bash
# Using Homebrew
brew install cassandra

# Start Cassandra
brew services start cassandra

# Verify Cassandra is running
cqlsh
```

### Install Project Dependencies

```bash
# Clone or navigate to project directory
cd ja-data-entry

# Install npm packages
npm install

# Copy environment configuration
cp .env.example .env
```

### Configure Environment

Edit `.env` file:

```env
PORT=3000
CASSANDRA_CONTACT_POINTS=127.0.0.1
CASSANDRA_LOCAL_DATA_CENTER=datacenter1
CASSANDRA_KEYSPACE=data_entry
```

## 🎮 Usage

### Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

## 📡 API Endpoints

### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "message": "API is running",
  "timestamp": "2025-11-15T10:30:00.000Z"
}
```

### 2. API Documentation
```http
GET /api
```

Returns API endpoint documentation.

### 3. Create Data Entry
```http
POST /api/entries
Content-Type: application/json

{
  "client_id": "client-123",
  "category": "customer-data",
  "data_type": "user",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "active": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data entry created successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "client_id": "client-123",
    "category": "customer-data",
    "data_type": "user",
    "data": {
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30,
      "active": true
    },
    "created_at": "2025-11-15T10:30:00.000Z"
  }
}
```

### 4. Get All Entries
```http
GET /api/entries?limit=100
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [...]
}
```

### 5. Get Entry by ID
```http
GET /api/entries/{id}
```

### 6. Get Entries by Type
```http
GET /api/entries/type/{type}?limit=100
```

### 7. Get Entries by Category
```http
GET /api/entries/category/{category}?limit=100
```

### 8. Get Entries by Client
```http
GET /api/entries/client/{clientId}?limit=100
```

### 9. Get Entries by Client and Category
```http
GET /api/entries/client/{clientId}/category/{category}?limit=100
```

## 💡 Example Requests

### User Entry with Client Tracking
```bash
curl -X POST http://localhost:3000/api/entries \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "acme-corp",
    "category": "customer-data",
    "data_type": "user",
    "data": {
      "name": "Jane Smith",
      "email": "jane@acmecorp.com",
      "role": "admin"
    }
  }'
```

### Product Entry
```bash
curl -X POST http://localhost:3000/api/entries \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "store-xyz",
    "category": "inventory",
    "data_type": "product",
    "data": {
      "name": "Laptop",
      "price": 999.99,
      "specifications": {
        "cpu": "Intel i7",
        "ram": "16GB"
      }
    }
  }'
```

### Get All Entries for a Client
```bash
curl http://localhost:3000/api/entries/client/acme-corp
```

### Get Entries by Client and Category
```bash
curl http://localhost:3000/api/entries/client/acme-corp/category/customer-data
```

### Complex Nested JSON with Analytics
```bash
curl -X POST http://localhost:3000/api/entries \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "analytics-team",
    "category": "web-analytics",
    "data_type": "analytics",
    "data": {
      "event": "page_view",
      "user": {
        "id": "user123",
        "session": "sess456"
      },
      "metadata": {
        "browser": "Chrome",
        "device": "Desktop"
      }
    }
  }'
```

## 🧪 Testing with curl

```bash
# Health check
curl http://localhost:3000/health

# Get all entries
curl http://localhost:3000/api/entries

# Get entries by type
curl http://localhost:3000/api/entries/type/user

# Get entries by category
curl http://localhost:3000/api/entries/category/customer-data

# Get entries by client
curl http://localhost:3000/api/entries/client/acme-corp

# Get entries by client and category
curl http://localhost:3000/api/entries/client/acme-corp/category/inventory

# Get specific entry
curl http://localhost:3000/api/entries/{id}
```

## 🔧 Database Schema

The Cassandra table structure with client and category tracking:

```cql
CREATE KEYSPACE data_entry
WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

CREATE TABLE data_entry.entries (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP,
    data_type TEXT,
    category TEXT,
    client_id TEXT,
    json_data TEXT
);

CREATE INDEX ON data_entry.entries (data_type);
CREATE INDEX ON data_entry.entries (category);
CREATE INDEX ON data_entry.entries (client_id);
```

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View API logs only
docker-compose logs -f api

# Restart API service
docker-compose restart api

# Stop all services
docker-compose down

# Remove all data (including database)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Scale API instances (load balancing)
docker-compose up -d --scale api=3
```

## 🏆 DDD Benefits

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Testability**: Business logic isolated in domain layer
3. **Maintainability**: Easy to understand and modify
4. **Flexibility**: Swap implementations (e.g., change database) without affecting business logic
5. **Scalability**: Clear boundaries enable team scaling

## 📦 Dependencies

- **express**: Web framework
- **cassandra-driver**: Cassandra NoSQL database driver
- **body-parser**: Request body parsing
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## 🛡️ Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid input data
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server errors

All errors return consistent JSON format:
```json
{
  "success": false,
  "error": "Error message description"
}
```

## 📝 License

ISC

## 👨‍💻 Development

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Start in production mode
npm start
```

---

**Built with DDD principles for scalable, maintainable enterprise applications** 🚀
