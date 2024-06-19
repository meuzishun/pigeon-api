require('dotenv').config();
const mongoose = require('mongoose');
const server = require('./app');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Database connected');
  } catch (error) {
    console.error(error);
  }
};

const startApp = async () => {
  await connectDB();
  server.listen(process.env.PORT, () =>
    console.log(`Server listening on port ${process.env.PORT}`)
  );
};

startApp();
