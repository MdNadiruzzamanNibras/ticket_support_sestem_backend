const express = require('express');
const bodyParser = require("body-parser");
require('dotenv').config()
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000



app.use(bodyParser.json());
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.DB_URI

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
     const userCollection = client.db("ticket").collection('user');
     const supportCollection = client.db("ticket").collection('support');
    client.connect();
    app.get('/allSupport', async(req,res)=>{
      const qurey = {}
      const cursor =  supportCollection.find(qurey)
      const supports = await cursor.toArray()
      res.send(supports)
    })
   app.post('/support', async (req, res) => {
  const support = req.body;
  const result = await supportCollection.insertOne(support);
  res.send(result);
   });
    
    // user
    app.get('/admin/:email', async (req, res) => {
    const email = req.params.email;
      const user = await userCollection.findOne({ "user.email": email });
      console.log(user);
      const isAdmin = user?.user?.role === 'admin';
    console.log(isAdmin);
    res.send({ admin: isAdmin })
    
  })
   app.post('/user', async (req, res) => {
  const user = req.body;
  
  const result = await userCollection.insertOne(user);
  
  res.send(result);
});
    
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('ticket support system')
  })
  
  app.listen(port, () => {
    console.log('ticket support system server', port)
  })