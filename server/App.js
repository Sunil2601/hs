let {response}=require('express')

const exp=require('express')

const server=exp()

const mclient=require('mongodb').MongoClient;

server.use(exp.json())

const UserApi=require('./APIS/UserApi')

const RequestsApi=require('./APIS/RequestsApi')

const PostsApi=require('./APIS/PostsApi')

const cors = require('cors');

const corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200
}
require('dotenv').config()
server.use(cors(corsOptions));

server.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', true);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next();
});

const DBURL=process.env.DBURL

mclient.connect(DBURL)
.then((client)=>{
    //getting the database object 
    let dbObj=client.db('Instagram')

    //getting the collections object 
    let user=dbObj.collection('UserCollection')
    let requests=dbObj.collection('RequestsCollection')
    let posts=dbObj.collection('PostsCollection')
    //providing apis to children 
    server.set("user",user) 
    server.set("requests",requests)
    server.set("posts",posts)
    console.log('connected successfully')
})
.catch(err=>console.log('error :',err))


server.use('/user',UserApi)
server.use('/requests',RequestsApi)
server.use('/posts',PostsApi)

server.use((req,res,next)=>{
    res.send({message:"invalid url",url:`${req.url}`})
})

server.use((err,req,res,next)=>{
    res.send({message:`${err.message}`})})


server.listen(5000,()=>console.log(`server listening to port 5000....`))

