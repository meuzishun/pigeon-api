require('dotenv').config();
require('./lib/generateKeyPair');
const http = require('http');
const { app } = require('./app');
const { connectDB } = require('./config/database');
const { initializeSocket } = require('./socket');

const startApp = async () => {
  const server = http.createServer(app);
  initializeSocket(server);

  await connectDB();

  server.listen(process.env.PORT, () =>
    console.log(`Server listening on port ${process.env.PORT}`)
  );
};

startApp();
