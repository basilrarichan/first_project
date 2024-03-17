const express = require('express');
const multer = require('multer');
const cors = require('cors'); 
const path = require('path');

const connectToDatabase = require('./db'); // Import the database connection function

const app = express();
const port = 3001;

// Set up MongoDB connection using Mongoose
connectToDatabase((error) => {
  if (error) {
    console.error('Failed to connect to the database:', error);
    // Handle the error as needed (e.g., exit the application)
    process.exit(1);
  } else {
    // Database connection successful, continue with Express setup
    app.use(cors());
    app.use((req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      next();
    });
    
    app.use(express.json());


    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    app.use('/', require('./Routes/Auth'));

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
});
