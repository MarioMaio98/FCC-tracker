const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb');
const dns = require('dns');
const urlparser = require('url');

const myMongo = new MongoClient('mongodb+srv://new-user-mario:2czA7Hwmv9hDddhS@cluster0.6yumhe1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

  


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
    username: username
  }

  const User = await users.insertOne(newUser);
  console.log("New User created");
  res.json({
    username: username

  })
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
