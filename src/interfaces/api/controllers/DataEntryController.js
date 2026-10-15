// API Controller: Data Entry Controller
const CreateDataEntryRequest = require('../../../application/dtos/CreateDataEntryRequest');

const MAX_LIMIT = 1000;

function parseLimit(value) {
  const n = parseInt(value, 10);
  if (!Number.isInteger(n) || n < 1) return 100;
  return Math.min(n, MAX_LIMIT);
}

class DataEntryController {
  constructor(
    createDataEntryUseCase,
    getDataEntryByIdUseCase,
    getAllDataEntriesUseCase,
    getDataEntriesByTypeUseCase,
    getDataEntriesByCategoryUseCase,
    getDataEntriesByClientUseCase,
    getDataEntriesByClientAndCategoryUseCase
  ) {
    this.createDataEntryUseCase = createDataEntryUseCase;
    this.getDataEntryByIdUseCase = getDataEntryByIdUseCase;
    this.getAllDataEntriesUseCase = getAllDataEntriesUseCase;
    this.getDataEntriesByTypeUseCase = getDataEntriesByTypeUseCase;
    this.getDataEntriesByCategoryUseCase = getDataEntriesByCategoryUseCase;
    this.getDataEntriesByClientUseCase = getDataEntriesByClientUseCase;
    this.getDataEntriesByClientAndCategoryUseCase = getDataEntriesByClientAndCategoryUseCase;
  }

  async create(req, res) {
    try {
      const request = CreateDataEntryRequest.fromRequest(req.body);
      const result = await this.createDataEntryUseCase.execute(request);

      if (result.success) {
        return res.status(201).json({
          success: true,
          message: 'Data entry created successfully',
          data: result.data
        });
      } else {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const result = await this.getDataEntryByIdUseCase.execute(id);

      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data
        });
      } else {
        return res.status(404).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message
      });
    }
  }

  async getAll(req, res) {
    try {
      const limit = parseLimit(req.query.limit);
      const pageState = req.query.pageState || null;
      
      const result = await this.getAllDataEntriesUseCase.execute(limit, pageState);

      if (result.success) {
        return res.status(200).json({
          success: true,
          count: result.count,
          data: result.data,
          pagination: {
            pageState: result.pageState,
            hasMore: result.hasMore,
            limit: limit
          }
        });
      } else {
        return res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message
      });
    }
  }

  async getByType(req, res) {
    try {
      const { type } = req.params;
      const limit = parseLimit(req.query.limit);
      const result = await this.getDataEntriesByTypeUseCase.execute(type, limit);

      if (result.success) {
        return res.status(200).json({
          success: true,
          count: result.count,
          data: result.data
        });
      } else {
        return res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message
      });
    }
  }

  async getByCategory(req, res) {
    try {
      const { category } = req.params;
      const limit = parseLimit(req.query.limit);
      const result = await this.getDataEntriesByCategoryUseCase.execute(category, limit);

      if (result.success) {
        return res.status(200).json({
          success: true,
          count: result.count,
          data: result.data
        });
      } else {
        return res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message
      });
    }
  }

  async getByClient(req, res) {
    try {
      const { clientId } = req.params;
      const limit = parseLimit(req.query.limit);
      const result = await this.getDataEntriesByClientUseCase.execute(clientId, limit);

      if (result.success) {
        return res.status(200).json({
          success: true,
          count: result.count,
          data: result.data
        });
      } else {
        return res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message
      });
    }
  }

  async getByClientAndCategory(req, res) {
    try {
      const { clientId, category } = req.params;
      const limit = parseLimit(req.query.limit);
      const result = await this.getDataEntriesByClientAndCategoryUseCase.execute(clientId, category, limit);

      if (result.success) {
        return res.status(200).json({
          success: true,
          count: result.count,
          data: result.data
        });
      } else {
        return res.status(500).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error.message
      });
    }
  }
}

module.exports = DataEntryController;
