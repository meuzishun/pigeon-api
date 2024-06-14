const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const User = require('../models/user');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(
    req.body.user._id,
    '-password' //TODO: Only remove password here...
  );

  if (!user) {
    res.status(404);
    throw new Error('No user found');
  }

  res.status(200).json({ user });
});

// @desc    Edit user profile
// @route   PUT /api/profile
// @access  Private
const editProfile = [
  body('data').notEmpty().withMessage('No user data submitted'),

  body('data.firstName').notEmpty().trim().withMessage('No First Name'),

  body('data.lastName').notEmpty().trim().withMessage('No Last Name'),

  body('data.email')
    .notEmpty()
    .withMessage('No Email')
    .isEmail()
    .withMessage('Please include a valid email'),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);

      if (
        errorMessages.includes('No user data submitted') ||
        (errorMessages.includes('No First Name') &&
          errorMessages.includes('No Last Name') &&
          errorMessages.includes('No Email'))
      ) {
        res.status(400);
        throw new Error('No user data submitted');
      }

      if (
        !errorMessages.includes('No Email') &&
        errorMessages.includes('Please include a valid email')
      ) {
        res.status(400);
        throw new Error('Please include a valid email');
      }
    }

    const user = await User.findById(req.body.user._id);

    if (!user) {
      res.status(404);
      throw new Error('No user found');
    }

    const newUser = await User.findByIdAndUpdate(user._id, req.body.data, {
      returnDocument: 'after',
    });

    const userNoPassword = newUser.toObject();
    delete userNoPassword.password;

    res.status(201).json({ user: userNoPassword });
  }),
];

// @desc    Delete user profile
// @route   DELETE /api/profile
// @access  Private
const deleteProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.body.user._id);

  if (!user) {
    res.status(404);
    throw new Error('No user found');
  }

  await User.findByIdAndDelete(user._id);

  res.status(200).json({ id: user._id });
});

module.exports = {
  getProfile,
  editProfile,
  deleteProfile,
};
