const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { reset } = require("nodemon");


const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());

function verifyJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    else{
      req.decoded = decoded;
      next();
    }
  });

}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bkii56h.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
 try{
    await client.connect();
    const productsCollection = client.db('inventory').collection('products');
    const blogsCollection = client.db('blogs').collection('blog');

    

    // auth
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });
    app.get("/products", async (req, res) => {
        const query = {};
        const cursor = productsCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);
      });
    
    app.get('/products/:id', async(req,res)=>{
      const id=req.params.id;
      const query={_id: ObjectId(id)};
      const product = await productsCollection.findOne(query);
      res.send(product)
    });
    app.get("/blog", async (req, res) => {
        const query = {};
        const cursor = blogsCollection.find(query);
        const blogs = await cursor.toArray();
        res.send(blogs);
      });
    
    app.get('/blog/:id', async(req,res)=>{
      const id=req.params.id;
      const query={_id: ObjectId(id)};
      const blog = await blogsCollection.findOne(query);
      res.send(blog)
    });
    app.get('/myItems',verifyJwt, async(req,res)=>{
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      console.log(decodedEmail,email);

      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = productsCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      }
      else{
        res.status(403).send({message: 'Forbidden access'})
      }
    })
    // update inventory
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updateQuantity = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          quantity: updateQuantity.addQuantity,
        },
      };

      const result = await productsCollection.updateMany(filter, updateDoc);
      res.send(result);
    });

    // post inventory
    app.post("/products", async (req, res) => {
      const newInventory = req.body;
      const result = await productsCollection.insertOne(newInventory);
      res.send(result);
    });
    // delete inventory
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });
    // my items delete
    app.delete("/myItems/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });
      

 }
 finally{
    
 }

}

run().catch(console.dir);
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})