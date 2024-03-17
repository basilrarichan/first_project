const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const FormDataModel = require('../models/FormData');
const User = require('../models/User')
const Card = require('../models/AddToCart')
const Order = require('../models/Orders')
const { body, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
const jwtSecret = "HaHa"
var fetch = require('../middleware/fetchdetails')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post('/your-backend-endpoint', upload.single('uploadFile'), async (req, res) => {
  try {
    const { Name, Category, Price, Description } = req.body;
    const file = req.file;

    // Create a new instance of the FormData model
    const formData = new FormDataModel({
      Name,
      Category,
      Price,
      Description,
      filePath: file ? file.filename : null,
    });

    // Save the form data to the database
    await formData.save();

    if (file) {
      const filePath = path.join(__dirname, 'uploads', file.filename);
      file.mv(filePath, (err) => {
        if (err) {
          console.error('Error moving file:', err);
          res.status(500).json({ error: 'Internal Server Error' });
        } else {
          console.log('File saved:', filePath);
          res.json({ message: 'Form data and file received and saved successfully' });
        }
      });
    } else {
      res.json({ message: 'Form data received successfully (without file)' });
    }
  } catch (error) {
    console.error('Error handling form submission:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }


});
router.post('/foodData', async (req, res) => {
  try {
      // console.log( JSON.stringify(global.foodData))
      // const userId = req.user.id;
      // await database.listCollections({name:"food_items"}).find({});
      const formData = await FormDataModel.find(); 
      const formDataWithUrls = formData.map((data) => {
        return {
          ...data._doc,
          imageUrl: data.filePath ? `/uploads/${data.filePath}` : null,
        };
      });
      res.json(formDataWithUrls);
      
  } catch (error) {
      console.error(error.message)
      res.send("Server Error")

  }
});
router.post('/registration', async (req, res) => {
  formData = req.body;
  try{
    
    const newUser = new User(formData);
    await newUser.save();

    console.log('User registered:', formData);
    res.json({ message: 'Registration successful' });
  }
  catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }


});

router.post('/login', [
  body('email', "Enter a Valid Email").isEmail(),
  body('password', "Password cannot be blank").exists(),
], async (req, res) => {
  let success = false
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
  }

  const { email, password } = req.body;
  try {
      let user = await User.findOne({ email });  //{email:email} === {email}
      if (!user) {
          return res.status(400).json({ success, error: "Try Logging in with correct credentials" });
      }

      const pwdCompare = user.password // this return true false.
      if (!pwdCompare) {
          return res.status(400).json({ success, error: "Try Logging in with correct credentials" });
      }
      const data = {
          user: {
              id: user.id
          }
      }
      success = true;
      const authToken = jwt.sign(data, jwtSecret);
      res.json({ success, authToken })


  } catch (error) {
      console.error(error.message)
      res.send("Server Error")
  }
})
router.post('/getuser', fetch, async (req, res) => {
  try {
      const userId = req.user.id;
      const user = await User.findById(userId).select("-password") // -password will not pick password from db.
      res.send(user)
  } catch (error) {
      console.error(error.message)
      res.send("Server Error")

  }
})
router.post('/add-to-cart', fetch, async (req, res) => {
  try {
    const userCardCount = await Card.countDocuments({ user: req.user.id });
    
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get card details from the request body
    const { id, name, description, price, imageUrl } = req.body;
    
    const filter = { id, user: req.user.id };
    const update = { $inc: { quantity: 1 } }; // Increment the quantity by 1
  
    const updatedCard = await Card.findOneAndUpdate(filter, update, {
      new: true, // Return the updated document
    });
      if(!updatedCard){
             // Create a new card in the database
          const card = new Card({
            id,
            name,
            description,
            price,
            imageUrl,
            user: req.user.id,
            quantity:1 // Associate the card with the authenticated user
    });

    // Save the card to the database
    await card.save();
      res.status(201).json({
        
        userCardCount,  // Include userCardCount in the response
        success: true,
        message: 'Item added to cart successfully'
        })}
     else{
      
        res.status(200).json({
          userCardCount,
          success:true,
          message: 'Item added to cart successfully'
        });
      }
  
 
    
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.post('/specific_cart',fetch,async(req,res)=>{
  try {
    const userId = req.user.id;
    console.log(userId)
    const user = await Card.find({ user: userId })
    console.log(user)
    const totalPrice = user.reduce((sum, item) => sum + item.price*item.quantity, 0);
    console.log('it is not workin')
    console.log(totalPrice)
     res.json({
      user: user,
      totalPrice: totalPrice,
    });
} catch (error) {
    console.error(error.message)
    res.send("Server Error")

}


})
router.put('/update_quantity/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const { quantity } = req.body;

    // Update the quantity in the database
    const updatedCard = await Card.findOneAndUpdate(
      { _id: itemId },
      { $set: { quantity: quantity } },
      { new: true }
    );

    if (!updatedCard) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json(updatedCard);
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.delete('/remove_item/:id', async (req, res) => {
  try {
    const itemId = req.params.id;

    // Remove the item from the database
    const removedCard = await Card.findOneAndDelete({ _id: itemId });

    if (!removedCard) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json({ success: true, message: 'Item removed successfully' });
  } catch (error) {
    console.error('Error removing item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.post('/placeorder',fetch, async (req, res) => {
  console.log('what is the issue in placing order')
  const userId = req.user.id;

  try {
    const userId1 = req.user.id;
    // Extract form data
    const user = await Card.find({ user: userId })
    const totalPrice = user.reduce((sum, item) => sum + item.price*item.quantity, 0);
    const { address, pincode, mobile, paymentMethod } = req.body;

    // Save the order to the database
    const order = new Order({
      address,
      pincode,
      mobile,
      userId:userId1,
      paymentMethod,
      // You may need to calculate total amount based on the items in the cart
      totalAmount: totalPrice, // Change this value accordingly
    });

    await order.save();
    
    // You might want to send a response back to the client
    res.status(201).json({ message: 'Order placed successfully' });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
router.post('/ordershown',fetch,async(req,res)=>{
  try{
    const userId = req.user.id;
    const user = await Order.find({userId: userId })
      res.send(user)
    
  }
  catch{
    console.error(error.message)
      res.send("Server Error")
  }
})
module.exports = router;
