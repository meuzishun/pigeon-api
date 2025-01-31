const { body, param, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const Message = require('../models/message');
const User = require('../models/user');

// @desc    Get room messages
// @route   GET /api/messages
// @access  Private
const getMessages = [
  param('roomId').isMongoId().withMessage('Invalid room ID'),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.body.user._id);

    if (!user) {
      res.status(400);
      throw new Error('No user found');
    }

    const messages = await Message.find({
      $or: [{ participants: user._id }, { author: user._id }],
    })
      .populate('author', '-password -friends')
      .populate('participants', '-password -friends');

    return res.status(200).json({ messages });
  }),
];

// @desc    Get a single room message
// @route   GET /api/messages/:messageId
// @access  Private
const getMessage = [
  param('messageId').isMongoId().withMessage('Invalid message ID'),

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

    const message = await Message.findById(req.params.messageId).populate(
      'author',
      '-password -friends'
    );

    if (!message) {
      res.status(404);
      throw new Error('No message found with id');
    }

    if (message.author._id.toString() !== user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized, message not authored by user');
    }

    return res.status(200).json({ message });
  }),
];

// @desc    Post messages
// @route   POST /api/messages
// @access  Private
const createMessage = [
  body('data.content')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Message has no content'),

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
      throw new Error('No author submitted');
    }

    const message = await Message.create({
      ...req.body.data,
      author: user._id,
      timestamp: new Date(),
    });

    const populatedMessage = await Message.populate(message, [
      {
        path: 'author',
        select: '-password -friends',
      },
      {
        path: 'participants',
        select: '-password -friends',
      },
    ]);

    return res.status(201).json({ message: populatedMessage });
  }),
];

// @desc    Edit message
// @route   PUT /api/messages/:messageId
// @access  Private
const editMessage = [
  param('messageId').isMongoId().withMessage('Invalid message ID'),

  body('data.content')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Message has no content'),

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

    const message = await Message.findById(req.params.messageId);

    if (!message) {
      res.status(404);
      throw new Error('Message not found');
    }

    if (user._id.toString() !== message.author.toString()) {
      res.status(400);
      throw new Error(
        'Cannot alter message when author and user ids do not match'
      );
    }

    const newMessage = await Message.findByIdAndUpdate(
      req.params.messageId,
      {
        content: req.body.data.content,
        timestamp: new Date(),
      },
      { returnDocument: 'after' }
    ).populate('author', '-password -friends');

    res.status(201).json({ message: newMessage });
  }),
];

// @desc    Delete message
// @route   DELETE /api/messages/:messageId
// @access  Private
const deleteMessage = [
  param('messageId').isMongoId().withMessage('Invalid message ID'),

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

    const message = await Message.findById(req.params.messageId);

    if (!message) {
      res.status(404);
      throw new Error('No message found');
    }

    if (user._id.toString() !== message.author.toString()) {
      res.status(400);
      throw new Error(
        'Cannot delete message when author and user ids do not match'
      );
    }

    const deletedMsgId = await Message.findByIdAndDelete(req.params.messageId);

    res.status(200).json({ id: message._id });
  }),
];

module.exports = {
  getMessages,
  getMessage,
  createMessage,
  editMessage,
  deleteMessage,
};
