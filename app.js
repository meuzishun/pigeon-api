require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const RateLimit = require('express-rate-limit');
const routes = require('./routes/index');
const errorHandler = require('./middleware/errorMiddleware');

const limiter = RateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
});

const whitelist = [
  'https://meuzishun.github.io',
  'http://127.0.0.1:5173',
  'http://localhost:5173',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.includes(origin || !origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

const app = express();

if (process.env.NODE_ENV === 'Production') {
  app.use(cors(corsOptions));
  app.use(limiter);
  app.use(compression());
  app.use(helmet());
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api', routes);
app.use(errorHandler);

const server = http.createServer(app);

module.exports = server;
