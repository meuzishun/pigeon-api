require('dotenv').config();
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/user');

let PRIV_KEY = process.env.PRIV_KEY;

if (!PRIV_KEY) {
  console.error('PRIV_KEY environment variable is not set');
  process.exit(1); // Exit the application if the private key is not set
}

PRIV_KEY = PRIV_KEY.replace(/\\n/g, '\n');

const authHandler = asyncHandler(async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith('Bearer')
  ) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, PRIV_KEY);
  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    res.status(401);
    throw new Error('Not authorized, no user found');
  }

  req.body.user = user;
  next();
});

module.exports = authHandler;
