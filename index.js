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
const exercises = db.collection('exercises');
const users = db.collection('users');

app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/users", async (req, res) => {
  const username = req.body.username;


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

app.post("/api/users/:_id/exercises", async (req, res) => {
  const userId = req.params._id;

  const desc = req.body.description;

  const duration = parseInt(req.body.duration);
  
  let date = new Date(req.body.date);
  const user = await users.findOne({ _id: new ObjectId(userId) });
  if (!date || isNaN(date.getTime())) {
    date = new Date();
  }

  if (!user) {
    return res.json({error: "user not found"})
  }
const newExercise = {
    userId: user._id,
    description: desc,
    duration: duration,
    date: date
  }
 await exercises.insertOne(newExercise)
res.json({

    username: user.username,
    description:desc,
    duration:  duration,
    date: date.toDateString(),
    _id: user._id,
  })
  
})



app.get("/api/users/:_id/logs", async (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;
  let fromDate = from ? new Date(from) : null;
  let toDate = to ? new Date(to) : null;
  let limitNumber = parseInt(limit) || 0;


  if (fromDate && isNaN(fromDate.getTime())) fromDate = null;
  if (toDate && isNaN(toDate.getTime())) toDate = null;


  const user = await users.findOne({ _id: new ObjectId(userId) });

  if (!user) {
    return res.json({ error: "User not found" });
  }


  let query = { userId: new ObjectId(userId) };

  if (fromDate) query.date = { $gte: fromDate };
  if (toDate) query.date = { ...query.date, $lte: toDate };


  const log = await exercises.find(query).limit(limitNumber).toArray();


  const formattedLog = log.map(ex => ({
    description: ex.description,
    duration: ex.duration,
    date: new Date(ex.date).toDateString()
  }));
  res.json({
    username: user.username,
    count: formattedLog.length,
    _id: user._id,
    log: formattedLog
  });
});

app.get("/api/users", async (req, res) => {

  try {
    const list = await users.find().toArray();
    //stampa la lista di tutti gli utenti
    res.json(list)
  }
  catch (err) {
    res.json("An error occured...")
  }

})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
