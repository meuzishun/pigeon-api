require('dotenv').config();
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const pathToPrivKey = path.join(__dirname, '..', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToPrivKey, 'utf8');

// @desc    Register user
// @route   POST /api/register
// @access  Public
const registerUser = [
  body('data').notEmpty().withMessage('No user data submitted'),

  body('data.firstName').notEmpty().withMessage('No first name'),

  body('data.lastName').notEmpty().withMessage('No last name'),

  body('data.email')
    .notEmpty()
    .withMessage('No email')
    .trim()
    .escape()
    .isEmail()
    .withMessage('Please include a valid email'),

  body('data.password').notEmpty().withMessage('No password'),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      res.status(400);
      throw new Error(errorMessages[0]);
    }

    const { firstName, lastName, email, password } = req.body.data;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    const user = newUser.toObject();
    delete user.password;

    const token = jwt.sign({ id: user._id }, PRIV_KEY, {
      expiresIn: '10d',
      algorithm: 'RS256',
    });

    return res.status(201).json({ user, token });
  }),
];

// @desc    Login user
// @route   POST /api/login
// @access  Public
const loginUser = [
  body('data').notEmpty().withMessage('No user submitted'),

  body('data.email')
    .notEmpty()
    .withMessage('No email')
    .trim()
    .escape()
    .isEmail()
    .withMessage('Please include a valid email'),

  body('data.password').notEmpty().withMessage('No password'),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((error) => error.msg);
      res.status(400);
      throw new Error(errorMessages[0]);
    }

    const { email, password } = req.body.data;

    const user = await User.findOne({ email }).populate(
      'friends',
      '-password -friends'
    );

    if (!user) {
      res.status(400);
      throw new Error('No user with that email');
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      res.status(401);
      throw new Error('Incorrect password');
    }

    const token = jwt.sign({ id: user._id }, PRIV_KEY, {
      expiresIn: '10d',
      algorithm: 'RS256',
    });

    const userNoPass = user.toObject();
    delete userNoPass.password;

    return res.status(200).json({ user: userNoPass, token });
  }),
];

module.exports = {
  registerUser,
  loginUser,
};
