import Profile from '../models/Profile.js';

export const getAllProfiles = async (req, res) => {
  try {
    const { timezone, search, sortBy = 'createdAt' } = req.query;
    let query = { isActive: true };

    // Timezone filtering - uses single index
    if (timezone) {
      query.timezone = timezone;
    }

    // Name search - uses index on name field
    if (search) {
      query.name = { $regex: search, $options: 'i' }; // Case-insensitive
    }

    // Dynamic sorting leveraging indexes
    const sortOptions = {};
    sortOptions[sortBy] = sortBy === 'name' ? 1 : -1; // Asc for name, desc for dates

    const profiles = await Profile.find(query).sort(sortOptions).lean();

    res.json(profiles);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching profiles',
      message: error.message,
    });
  }
};

// @desc    Get single profile by ID
// @route   GET /api/profiles/:id
// @access  Public
export const getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching profile',
      message: error.message,
    });
  }
};

// @desc    Create new profile
// @route   POST /api/profiles
// @access  Public
export const createProfile = async (req, res) => {
  try {
    const newProfile = new Profile(req.body);
    const savedProfile = await newProfile.save();

    res.status(201).json(savedProfile);
  } catch (error) {
    res.status(400).json({
      error: 'Error creating profile',
      message: error.message,
    });
  }
};

// @desc    Update profile (mainly for timezone changes)
// @route   PUT /api/profiles/:id
// @access  Public
export const updateProfile = async (req, res) => {
  try {
    const updatedProfile = await Profile.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(updatedProfile);
  } catch (error) {
    res.status(400).json({
      error: 'Error updating profile',
      message: error.message,
    });
  }
};
