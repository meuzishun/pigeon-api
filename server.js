require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./config/database');

const startApp = async () => {
  await connectDB();
  server.listen(process.env.PORT, () =>
    console.log(`Server listening on port ${process.env.PORT}`)
  );
};

startApp();
