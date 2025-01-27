const { body, param, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const Message = require('../models/message');
const User = require('../models/user');
const Room = require('../models/room');

// @desc    Get rooms
// @route   GET /api/rooms
// @access  Private
const getRooms = asyncHandler(async (req, res) => {
  const user = await User.findById(req.body.user._id);

  if (!user) {
    res.status(400);
    throw new Error('No user found');
  }

  const rooms = await Room.find();
  return res.status(200).json({ rooms });
});

// @desc    Get a single room
// @route   GET /api/rooms/:roomId
// @access  Private
const getRoom = [
  param('roomId').isMongoId().withMessage('Invalid room ID'),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      res.status(400);
      throw new Error(errorMessages[0]);
    }

    const user = await User.findById(req.body.user._id);

    if (!user) {
      res.status(400);
      throw new Error('No user found');
    }

    const room = await Room.findById(req.params.roomId);

    if (!room) {
      res.status(404);
      throw new Error('No room found with id');
    }

    return res.status(200).json({ room });
  }),
];

// @desc    Post room
// @route   POST /api/rooms
// @access  Private
const createRoom = [
  body('data.name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Room has no name'),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      res.status(400);
      throw new Error(errorMessages[0]);
    }

    const user = await User.findById(req.body.user._id);

    if (!user) {
      res.status(400);
      throw new Error('No user found');
    }

    const room = await Room.create({
      ...req.body.data,
    });

    return res.status(201).json({ room });
  }),
];

// @desc    Edit room
// @route   PUT /api/rooms/:roomId/edit
// @access  Private
const editRoom = [
  param('roomId').isMongoId().withMessage('Invalid room ID'),
  body('data.name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Room has no name'),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      res.status(400);
      throw new Error(errorMessages[0]);
    }

    const user = await User.findById(req.body.user._id);

    if (!user) {
      res.status(401);
      throw new Error('No author submitted');
    }

    const room = await Room.findById(req.params.roomId);

    if (!room) {
      res.status(404);
      throw new Error('Room not found');
    }

    const newRoom = await Room.findByIdAndUpdate(
      req.params.roomId,
      {
        name: req.body.data.name,
      },
      { returnDocument: 'after' }
    );

    res.status(201).json({ room: newRoom });
  }),
];

// @desc    Delete room
// @route   DELETE /api/rooms/:roomId
// @access  Private
const deleteRoom = [
  param('roomId').isMongoId().withMessage('Invalid room ID'),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      res.status(400);
      throw new Error(errorMessages[0]);
    }

    const user = await User.findById(req.body.user._id);

    if (!user) {
      res.status(401);
      throw new Error('No user found');
    }

    const room = await Room.findById(req.params.roomId);

    if (!room) {
      res.status(404);
      throw new Error('No room found');
    }

    const deletedRoomId = await Room.findByIdAndDelete(req.params.roomId);
    res.status(200).json({ id: deletedRoomId._id });
  }),
];

module.exports = {
  getRooms,
  getRoom,
  createRoom,
  editRoom,
  deleteRoom,
};
