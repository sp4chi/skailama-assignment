import mongoose from 'mongoose';

const eventUpdateLogSchema = new mongoose.Schema({
  field: String,
  oldValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  updatedAt: Date,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
  },
});

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    profiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
        required: true,
      },
    ],
    timezone: {
      type: String,
      required: [true, 'Timezone is required'],
      default: 'UTC',
    },
    startDateTime: {
      type: Date,
      required: [true, 'Start date/time is required'],
    },
    endDateTime: {
      type: Date,
      required: [true, 'End date/time is required'],
      validate: {
        validator: function (value) {
          return value > this.startDateTime;
        },
        message: 'End date/time must be after start date/time',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
    },
    updateLogs: [eventUpdateLogSchema],
  },
  {
    timestamps: true,
  }
);

/**
 * Database Indexes for Query Optimization - DSA Strategy
 *
 * 1. Compound Index on profiles + startDateTime: O(log n) for filtered queries
 *    - Optimizes queries filtering events by profile and sorting by date
 *    - Used in GET /api/events?profileId=xxx endpoint
 *
 * 2. Compound Index on startDateTime + endDateTime: O(log n) for date range queries
 *    - Optimizes queries finding events within date ranges
 *    - Supports efficient "upcoming events" and "past events" filtering
 *
 * 3. Text Index on title + description: O(log n) for text search
 *    - Enables full-text search functionality
 *    - Case-insensitive search across event titles and descriptions
 *
 * 4. Single Index on timezone: O(log n) for timezone filtering
 *    - Optimizes queries grouping events by timezone
 */
eventSchema.index({ profiles: 1, startDateTime: 1 }); // Compound index
eventSchema.index({ startDateTime: 1, endDateTime: 1 }); // Date range queries
eventSchema.index({ title: 'text', description: 'text' }); // Full-text search
eventSchema.index({ timezone: 1 }); // Timezone filtering
eventSchema.index({ createdBy: 1, createdAt: -1 }); // User's events sorted by creation

const Event = mongoose.model('Event', eventSchema);

export default Event;
