
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
// middleware

// mongoDB CURD

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zfuxqes.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // collection
    const userCollection = client.db("learnEaseDB").collection("users");
    const classCollection = client.db("learnEaseDB").collection("class");
    // collection

    // jwt related api
    app.post('/jwt', async(req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'});
      res.send({token});
    });
    // jwt middleware
    const verifyToken = (req, res, next) => {
      // console.log('inside verify token',req.headers.authorization);
      if(!req.headers.authorization){
        return res.status(401).send({message : 'forbidden access'})
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if(err){
          res.status(401).send({message : "forbidden access"})
        }
        req.decoded = decoded;
        next();
      });
    };

    const verifyAdmin = async(req, res, next) =>{
      const email = req.decoded.email;
      const query = {email: email};
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === 'admin';
      if(!isAdmin){
        res.status(403).send({message : "forbidden access"})
      }
      next();
    };
    // jwt middleware
    // jwt related api

    // database api start
    // user related api

    app.get('/users/admin/:email', verifyToken ,async(req, res) => {
      const email = req.params.email;
      console.log('from admin',email);
      if(email !== req.decoded.email){
        return res.status(403).send({ message : "unauthorized access"})
      }
      const query = {email: email};
      const user = await userCollection.findOne(query);
      let admin = false;
      if(user){
        admin = user?.role === 'admin'
      } 
      res.send({admin})
    });

    app.get('/users/teacher/:email', verifyToken, async (req, res) => {
      const email = req.params.email;
      console.log('from teacher',email);
      if(email !== req.decoded.email){
        return res.status(403).send({ message : "unauthorized access"})
      }
      const query = {email: email};
      const user = await userCollection.findOne(query);
      let teacher = false;
      if(user){
        teacher = user?.role === 'teacher'
      } 
      res.send({teacher})
    });

    app.post("/users", async (req, res) => {
      const userInfo = req.body;
      const query = { email: userInfo.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exist", insertedId: null });
      }
      const result = await userCollection.insertOne(userInfo);
      res.send(result);
    });

    // user related api

    // admin api
    app.get("/class", async(req, res) => {
      const result = await classCollection.find().toArray();
      res.send(result);
    });
    // admin api

    // teacher api
    app.get("/class/:email", async(req, res) => {
      const email = req.params.email;
      const query = {email: email};
      const result = await classCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/class", async(req, res) => {
      const classInfo = req.body;
      console.log(classInfo);
      const result = await classCollection.insertOne(classInfo);
      res.send(result);
    });

    app.delete("/class/:id", async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await classCollection.deleteOne(query);
      res.send(result);
    });
    // teacher api
    // database api end

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// mongoDB CURD

// root api
app.get("/", (req, res) => {
  res.send("Learn Ease Running Successfully");
});
// root api

app.listen(port, () => {
  console.log(`Learn Ease Running On Port ${port}`);
});
