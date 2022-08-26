const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { reset } = require("nodemon");


const port = process.env.PORT || 5000;
// user:dbUser1
// pas:QUqaBJqPgl3NNAJi

// middle ware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bkii56h.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
 try{
    await client.connect();
    const productsCollection = client.db('inventory').collection('products');

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