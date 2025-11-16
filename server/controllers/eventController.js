import Event from '../models/Event.js';

export const getAllEvents = async (req, res) => {
  try {
    const { profileId, startDate, endDate, timezone, search } = req.query;
    let query = {};

    if (profileId) {
      query.profiles = profileId;
    }

    if (startDate || endDate) {
      query.startDateTime = {};
      if (startDate) query.startDateTime.$gte = new Date(startDate);
      if (endDate) query.startDateTime.$lte = new Date(endDate);
    }

    if (timezone) {
      query.timezone = timezone;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Sort leverages index for efficient ordering
    const events = await Event.find(query)
      .populate('profiles', 'name timezone')
      .populate('createdBy', 'name')
      .sort({ startDateTime: 1 })
      .lean(); // Better performance for read-only operations

    res.json(events);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching events',
      message: error.message,
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('profiles', 'name timezone')
      .populate('createdBy', 'name')
      .populate('updateLogs.updatedBy', 'name');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching event',
      message: error.message,
    });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { startDateTime, endDateTime } = req.body;

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    if (end <= start) {
      return res.status(400).json({
        error: 'Invalid dates',
        message: 'End date/time must be after start date/time',
      });
    }

    // Create new event
    const newEvent = new Event(req.body);
    const savedEvent = await newEvent.save();

    // Populate relationships
    const populatedEvent = await Event.findById(savedEvent._id)
      .populate('profiles', 'name timezone')
      .populate('createdBy', 'name');

    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(400).json({
      error: 'Error creating event',
      message: error.message,
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { updatedBy, ...updateData } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Validate dates if provided
    const startDateTime = updateData.startDateTime || event.startDateTime;
    const endDateTime = updateData.endDateTime || event.endDateTime;

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        error: 'Invalid dates',
        message: 'Invalid date format provided',
      });
    }

    if (end.getTime() <= start.getTime()) {
      return res.status(400).json({
        error: 'Invalid dates',
        message: `End date/time must be after start date/time. Start: ${start.toISOString()}, End: ${end.toISOString()}`,
      });
    }

    // Track changes for audit log
    const updateLogs = [];
    const fieldsToTrack = [
      'title',
      'description',
      'startDateTime',
      'endDateTime',
      'timezone',
      'profiles',
    ];

    fieldsToTrack.forEach((field) => {
      if (updateData[field] !== undefined) {
        const oldValue = event[field];
        const newValue = updateData[field];

        // Compare values (handle objects/arrays)
        const oldStr = JSON.stringify(oldValue);
        const newStr = JSON.stringify(newValue);

        if (oldStr !== newStr) {
          updateLogs.push({
            field,
            oldValue,
            newValue,
            updatedAt: new Date(),
            updatedBy,
          });
        }
      }
    });

    // Append new logs to existing logs
    if (updateLogs.length > 0) {
      updateData.updateLogs = [...(event.updateLogs || []), ...updateLogs];
    }

    // Update event fields
    Object.keys(updateData).forEach((key) => {
      event[key] = updateData[key];
    });

    // Save the document (this properly runs validators with full context)
    const savedEvent = await event.save();

    // Populate relationships
    const updatedEvent = await Event.findById(savedEvent._id)
      .populate('profiles', 'name timezone')
      .populate('createdBy', 'name')
      .populate('updateLogs.updatedBy', 'name');

    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({
      error: 'Error updating event',
      message: error.message,
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);

    if (!deletedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      message: 'Event deleted successfully',
      event: deletedEvent,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error deleting event',
      message: error.message,
    });
  }
};
