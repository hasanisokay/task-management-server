const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config()

// middleware
app.use(cors());
app.use(express.json())


const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ac-hzckllx-shard-00-00.wvig2d6.mongodb.net:27017,ac-hzckllx-shard-00-01.wvig2d6.mongodb.net:27017,ac-hzckllx-shard-00-02.wvig2d6.mongodb.net:27017/?ssl=true&replicaSet=atlas-sxh7jl-shard-0&authSource=admin&retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    await client.connect();
    
    const taskCollection = client.db("userManagement").collection("allTasks")
    
    // getting all tasks
    app.get('/allTasks', async(req,res)=>{
      const result = await taskCollection.find().toArray()
      res.send(result);
    })

    // adding a task
    app.post("/addTask", async(req,res)=>{
      const newTask = req.body;
      const result = await taskCollection.insertOne(newTask);
      res.send(result);
    })

    // delete a task
    app.delete("/deleteTask/:id", async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await taskCollection.deleteOne(query)
      res.send(result)
    })

    // getting one task details
    app.get("/task/:id", async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await taskCollection.findOne(query)
      res.send(result);
    })


    app.post("/updateStatus/:id", async(req,res)=>{
      const id = req.params.id
      const previousStatus = req.query.status
      console.log(previousStatus);
      const query = {_id: new ObjectId(id)}
      let status
      if(previousStatus == "Done"){
        status = "Pending"
      }
      else{
        status = "Done"
      }
      const options = {upsert: true}
      const updatedStatus = {
        $set:{
            status : status  
        }
    }
      const result = await taskCollection.updateOne(query,updatedStatus,options)
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/",(req,res)=>{
  res.send("Task Manager Server is running")
})


app.listen(port,()=>{
  console.log("Task Manager is running on " + port);  
})
