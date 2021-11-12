const express = require('express');
const app = express();
const cors = require('cors')
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const port = process.env.PORT || 8888;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://
${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o6whk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function verifyToken(req, res, next) {
    if (req.headers?.authorization?.startsWith('Bearer ')) {
        const token = req.headers.authorization.split(' ')[1];
        try {
            const decodedUser = await admin.auth().verifyIdToken(token);
            req.decodedEmail = decodedUser.email;
        }
        catch {

        }
    }

    next();
}



async function run() {
    try {
        await client.connect();
        const database = client.db('gamix-pro')
        const GameCollection = database.collection('games')
        const UserCollection = database.collection('users')
        const ReviewCollection = database.collection('review')
        const OrderCollection = database.collection('orders')

        app.post('/games', async (req, res) => {
            const games = req.body;
            const result = await GameCollection.insertOne(games)
            res.json(result)
        })
        app.get('/games', async (req, res) => {
            const size = parseInt(req.query.size);
            const cursor = GameCollection.find({})
            let games;
            if (size) {
                games = await cursor.limit(size).toArray();
            }
            else {
                games = await cursor.toArray();
            }
            res.json(games);
        })
        app.get('/games/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await GameCollection.findOne(query);
            res.json(result)
        })
        app.post('/users', async (req, res) => {
            const users = req.body;
            const result = await UserCollection.insertOne(users)
            res.json(result)
        })
        app.put('/users', async (req, res) => {
            const users = req.body;
            const filter = { email: users.email }
            const options = { upsert: true };
            const updateDoc = { $set: users }
            const result = await UserCollection.updateOne(filter, updateDoc, options)
            res.json(result);
        })
        app.get('/users/:email',async(req,res)=>{
            const email =  req.params.email;
            const query = {email:email}
            const user =await UserCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true
            }
            res.json({admin:isAdmin});
        })
        app.put('/users/admin',async(req,res)=>{
            const user = req.body;
            const filter ={email:user.email};
            const updateDoc = {$set:{role:'admin'}}
            const result = await UserCollection.updateOne(filter,updateDoc)
            res.json(result);
        })
        app.post('/order',async(req,res)=>{
            const order = req.body;
            const result = await OrderCollection.insertOne(order);
            res.json(result);
        })
        app.get('/order',async(req,res)=>{
            const email = req.query.email;
            const query = {email:email}
            const cursor = await OrderCollection.find(query);
            const result = await cursor.toArray();
            res.json(result)
        })
        app.delete('/order/:id',async(req,res)=>{
            const Id = req.params.id;
            const query = {_id:ObjectId(Id)};
            const result = await OrderCollection.deleteOne(query);
            res.json(result)
        })
        app.post('/review', async(req,res)=>{
            const reviews = req.body;
            const result = await ReviewCollection.insertOne(reviews);
            res.json(result)
        })
        app.get('/review',async(req,res)=>{
            const cursor = await ReviewCollection.find({});
            const result = await cursor.toArray();
            res.json(result)
        })
    }
    finally {

    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('api calld')
})

app.listen(port, () => {
    console.log('start server', port);
})