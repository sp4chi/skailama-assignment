import express from 'express';
import {
  getAllProfiles,
  getProfileById,
  createProfile,
  updateProfile,
} from '../controllers/profileController.js';

const router = express.Router();

/**
 * Profile Routes - Following MVC pattern
 * Controllers handle business logic, routes define endpoints
 */

// @route   GET /api/profiles
router.get('/', getAllProfiles);

// @route   GET /api/profiles/:id
router.get('/:id', getProfileById);

// @route   POST /api/profiles
router.post('/', createProfile);

// @route   PUT /api/profiles/:id
router.put('/:id', updateProfile);

export default router;
