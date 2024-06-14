const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
  ],
});

module.exports = mongoose.model('Room', RoomSchema);
