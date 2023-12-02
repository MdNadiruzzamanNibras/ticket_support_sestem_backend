const express = require('express');
const bodyParser = require("body-parser");
require('dotenv').config()
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000



app.use(bodyParser.json());
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://ticket:${process.env.DB_PASS}@cluster0.nvfsjha.mongodb.net/?retryWrites=true&w=majority`

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
    app.get('/support/:id', async(req,res)=>{
      const id = req.params.id 
     const qurey ={_id: new ObjectId(id)}
     const  result= await supportCollection.findOne(qurey)
     res.send(result)
    })
    app.get('/mysupport/:email', async (req, res) => {
     try {
       const email = req.params.email; 
       console.log(req.params);
      console.log(email, "email");
      
       const result = await supportCollection.find({ "support.email": email }).toArray();
       
    res.send(result);
     } catch (error) {
      console.log(error);
     }
  
});

   app.post('/support', async (req, res) => {
  const support = req.body;
  const result = await supportCollection.insertOne(support);
  res.send(result);
   });
    app.put('/reply/:id', async (req, res) => {
  const { id } = req.params; 
  const support = req.body; 

      const result = await supportCollection.updateOne({ _id: new ObjectId(id) },
        { $set: support },
      { upsert: true });
    
      res.json(result);
  
});

    // user
    app.get('/admin/:email', async (req, res) => {
    const email = req.params.email;
      const user = await userCollection.findOne({ "user.email": email });
      const isAdmin = user?.user?.role === 'admin';
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