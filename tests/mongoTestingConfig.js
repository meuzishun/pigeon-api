const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const initializeMongoServer = async () => {
  const mongoServer = await MongoMemoryServer.create();
  const mongoURI = mongoServer.getUri();

  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  mongoose.connection.on('error', (err) => {
    if (err.message.code === 'ETIMEDOUT') {
      console.log(err);
      mongoose.connect(mongoURI);
    }
    console.log(err);
  });

  mongoose.connection.once('open', () => {
    console.log(`Mocked MongoDB successfully connected to ${mongoURI}`);
  });
};

const disconnectMongoServer = async () => {
  mongoose.connection.on('disconnected', () => {
    console.log('Mocked MongoDB successfully disconnected');
  });
  await mongoose.disconnect();
};

module.exports = { initializeMongoServer, disconnectMongoServer };
