// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
   
  },
  email: {
    type: String,
   
    
  },
  phoneNumber: {
    type: String,
   
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    
  },
  address: {
    type: String,
    
  },
  password: {
    type: String,
  
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
