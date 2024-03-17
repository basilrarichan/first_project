const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  userId: {
    type: String, // Assuming userId is a String, you may need to adjust based on your user model
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  // You might want to add more fields based on your requirements
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
