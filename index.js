const express = require('express');
const app = express();

const cors = require('cors');
const { param } = require('express/lib/request');

const mongodb = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const mongoClient = mongodb.MongoClient;
const URL = 'mongodb://localhost:27017';

app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);
app.use(express.json());

let product=[]
function authenticate(req, res, next) {
  // Check token present in header
  if (req.headers.authorization) {
    let decode = jwt.verify(req.headers.authorization, 'OsVOSr5eLDdZbRfWjNMTvhUy');
    if (decode) {
      req.userId = decode.id;
      next();
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
  // if present
  // check toen is valid
  // if valid
  // next()

  // res.status(401).json({message : "Unauthorized"})
  // next()
}

// Method : GET
// route : /products
// params :
// Body :

// Return
// [{name : ""},{name : ""}]
app.get('/product', authenticate, async (req, res) => {
  try {
    // Open the connection
    let connection = await mongoClient.connect(URL);

    // Select the DB
    let db = connection.db('car rental client');

    // Select the collection
    // DO operation
    let products = await db
      .collection('products')
      .find({ createdBy: req.userId })
      .toArray();

    // Close the connection
    await connection.close();

    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Method : POST
// Route : /product
// Params :
// Body : product info

// Return
// Object : product ID
app.post('/product', authenticate, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db('car rental client');
    req.body.createdBy = req.userId;
    await db.collection('products').insertOne(req.body);

    await connection.close();

    res.json({ message: 'product Added' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }

  
});

// Method : PUT
// Route : /product/:id
// Params : :id
// Body : Update info

// Return
// updated object

app.put('/product/:id', authenticate, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db('car rent client');

    await db
      .collection('products')
      .updateOne({ _id: mongodb.ObjectId(req.params.id) }, { $set: req.body });

    await connection.close();

    res.json({ message: 'product Updated' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }


});

// Method : DELETE
// route : /product/:id
// Parms : id
// Body :

// Return
// Deleted ID
app.delete('/product/:id', authenticate, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db('car rent client');

    await db
      .collection('products')
      .deleteOne({ _id: mongodb.ObjectId(req.params.id) });

    await connection.close();

    res.json({ message: 'product Deteleted' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }

});

// Method : GET
// route : /product/:id
// params : id
// Body :

// Return
// Object
app.get('/product/:id', authenticate, async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);

    let db = connection.db('car rent client');

    let student = await db
      .collection('products')
      .findOne({ _id: mongodb.ObjectId(req.params.id) });

    await connection.close();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
  
});

app.post('/register', async (req, res) => {
  try {
    let connection = await mongoClient.connect(URL);
    let db = (await connection).db('car rent client');

    let salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(req.body.password, salt);
    req.body.password = hash;

    await db.collection('users').insertOne(req.body);
    await connection.close();
    res.json({ message: 'User Created' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

app.post('/login', async (req, res) => {
  try {
    // open the connection
    let connection = await mongoClient.connect(URL);
    // select the db
    let db = connection.db('car rent client');
    // fetch user with email id from DB
    let user = await db.collection('users').findOne({ email: req.body.email });
    if (user) {
      // if user given password is == user password in db
      let compare = bcrypt.compareSync(req.body.password, user.password);
      if (compare) {
        // Generate JWT token
        let token = jwt.sign(
          { name: user.name, id: user._id },
          'OsVOSr5eLDdZbRfWjNMTvhUy',
          { expiresIn: '1h' }
        );
        res.json({ token });
      } else {
        res.status(500).json({ message: 'Credientials does not match' });
      }
    } else {
      res.status(401).json({ message: 'Credientials does not match' });
    }
    // if no?
    // throw err user not found
    // if yes?
    await connection.close();
    // close the connection
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

app.listen(process.env.PORT || 3001, () => {
  console.log('Web server Started');
});


