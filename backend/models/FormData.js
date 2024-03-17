const mongoose = require('mongoose')

const{Schema, model} =  mongoose;

const formDataSchema = new Schema({
    Name: String,
    Category: String,
    Price: String,
    Description: String,
    filePath: String,
  });
  
  // Create a mongoose model based on the schema
module.exports = model('FormData', formDataSchema);