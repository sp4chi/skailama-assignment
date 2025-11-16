import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    timezone: {
      type: String,
      required: [true, 'Timezone is required'],
      default: 'UTC',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Database Indexes for Profile Query Optimization - DSA Strategy
 *
 * 1. Single Index on name: O(log n) for name-based lookups and sorting
 *    - Optimizes alphabetical sorting of profiles
 *    - Supports efficient name search queries
 *
 * 2. Compound Index on isActive + createdAt: O(log n)
 *    - Quickly filters active profiles and sorts by creation date
 *    - Used in profile listing with status filtering
 *
 * 3. Single Index on timezone: O(log n)
 *    - Optimizes queries grouping profiles by timezone
 */
profileSchema.index({ name: 1 }); // Name sorting and search
profileSchema.index({ isActive: 1, createdAt: -1 }); // Active profiles sorted by date
profileSchema.index({ timezone: 1 }); // Timezone-based queries

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;
