const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  quantity:{
    type: Number, // Use the Mongoose Number type for integers
    default: 1,
  },
});

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
