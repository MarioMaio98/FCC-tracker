require('dotenv').config({ path: 'sample.env' });
const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ObjectId } = require('mongodb');

const dns = require('dns');
const urlparser = require('url');



const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error("MongoDB URI not set in environment variables");
}

const myMongo = new MongoClient(mongoUri);

const db = myMongo.db('list');
const exercises = db.collection ('exercises');
const users = db.collection ('users');

app.use(express.urlencoded({ extended: true })); 
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post ("/api/users", async (req, res) => {
  const username=req.body.username;

  
  const newUser = {
    username: username,
  
  }

  const User = await users.insertOne(newUser);
  //console.log("New User created");
  res.json({
    username: username,
    _id: User.insertedId
  })
})

app.post ("/api/users/:_id/exercises", async (req, res) => {
  const id = req.params._id;
  const desc = req.body.description;
  const duration = req.body.duration;
  let date = new Date (req.body.date);
  const user = await users.findOne({ _id: new ObjectId(id) });
  if (!date || isNaN(date.getTime())) {
    date = new Date(); 
  }

  if (!user) {
    return res.json("user not found")
  }

    
  const newExercise = {
    id: id,
    description: desc,
    duration: duration,
    date: date
  }

  const exercise = await exercises.insertOne(newExercise)

  res.json ({
    id: id,
    description: desc,
    duration: duration,
    date: date
  })

  
})

app.get ("/api/users", async (req, res) => {
  
  try{
    const list = await users.find().toArray();
  //stampa la lista di tutti gli utenti
  res.json (list)
}
catch (err){
  res.json("An error occured...")
}
  
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
