import express from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';

const router = express.Router();

/**
 * Event Routes - Following MVC pattern
 * Controllers handle business logic, routes define endpoints
 */

// @route   GET /api/events
router.get('/', getAllEvents);

// @route   GET /api/events/:id
router.get('/:id', getEventById);

// @route   POST /api/events
router.post('/', createEvent);

// @route   PUT /api/events/:id
router.put('/:id', updateEvent);

// @route   DELETE /api/events/:id
router.delete('/:id', deleteEvent);

export default router;
