const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  // roomId: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'Room',
  //   default: null,
  // },
});

module.exports = mongoose.model('Message', MessageSchema);
