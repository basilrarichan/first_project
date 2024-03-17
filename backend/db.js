const mongoose = require('mongoose');
const mongoURI = 'mongodb://localhost:27017/your-database-name';

module.exports = function (callback) {
  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;

  db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    if (callback) {
      callback(err); // Pass the error to the callback
    }
  });

  db.once('open', () => {
    console.log('MongoDB connected successfully');
    if (callback) {
      callback(); // Call the callback without an error to indicate success
    }
  });
};
