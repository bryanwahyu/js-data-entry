// API Routes: Data Entry Routes
const express = require('express');

class DataEntryRoutes {
  constructor(dataEntryController) {
    this.router = express.Router();
    this.controller = dataEntryController;
    this.initializeRoutes();
  }

  initializeRoutes() {
    // POST /api/entries - Create new data entry
    this.router.post(
      '/',
      (req, res) => this.controller.create(req, res)
    );

    // GET /api/entries - Get all entries
    this.router.get(
      '/',
      (req, res) => this.controller.getAll(req, res)
    );

    // GET /api/entries/type/:type - Get entries by type
    this.router.get(
      '/type/:type',
      (req, res) => this.controller.getByType(req, res)
    );

    // GET /api/entries/category/:category - Get entries by category
    this.router.get(
      '/category/:category',
      (req, res) => this.controller.getByCategory(req, res)
    );

    // GET /api/entries/client/:clientId - Get entries by client
    this.router.get(
      '/client/:clientId',
      (req, res) => this.controller.getByClient(req, res)
    );

    // GET /api/entries/client/:clientId/category/:category - Get entries by client and category
    this.router.get(
      '/client/:clientId/category/:category',
      (req, res) => this.controller.getByClientAndCategory(req, res)
    );

    // GET /api/entries/:id - Get entry by ID
    this.router.get(
      '/:id',
      (req, res) => this.controller.getById(req, res)
    );
  }

  getRouter() {
    return this.router;
  }
}

module.exports = DataEntryRoutes;
