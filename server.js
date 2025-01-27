require('dotenv').config();
require('./lib/generateKeyPair');
const http = require('http');
const { app } = require('./app');
const { connectDB } = require('./config/database');

const startApp = async () => {
  const server = http.createServer(app);

  await connectDB();

  server.listen(process.env.PORT, () =>
    console.log(`Server listening on port ${process.env.PORT}`)
  );
};

startApp();
