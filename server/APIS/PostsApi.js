const exp = require('express')
const PostsApi = exp.Router()


const expressAsyncHandler = require('express-async-handler')
const { response } = require('express')




PostsApi.use(exp.json())
// PostsApi.use(exp.urlencoded());


var cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

require('dotenv').config()

const API_KEY=process.env.API_KEY 
const API_SECRET=process.env.API_SECRET
const CLOUD_NAME=process.env.CLOUD_NAME

cloudinary.config({
    cloud_name:CLOUD_NAME,
    api_key: API_KEY,
    api_secret:API_SECRET,
    secure: true,
  });

  const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      return {
        folder: "Instagram",
        public_id: file.fieldname + "-" + Date.now(),
      };
    },
  });

var upload = multer({ storage: cloudinaryStorage });

//get userdatap
PostsApi.get('/getPosts', expressAsyncHandler(async (req, res) => {
    res.send({message:"in posts Api"})
}))

//get Posts of the people I am Following
PostsApi.get('/getPostsOfFollowing/:username', expressAsyncHandler(async (req, res) => {
    const name = (req.params.username)
    
    let posts = req.app.get('posts')
    let requests=req.app.get('requests')
    let userData = await requests.findOne({username:name})
    let MyFollowing=userData.following
    console.log(MyFollowing)
    let AllPosts=[]
    for(let i of MyFollowing){
        let FollowingPersonData=await posts.findOne({username:i})
        if(FollowingPersonData.MyPosts.length>0){
            AllPosts.push(
                {
                    profilePic:FollowingPersonData.profilePic,
                    username:i,
                    image:FollowingPersonData.MyPosts[0].url,
                    captions:FollowingPersonData.MyPosts[0].captions
                }
            )
        }
    }
    if(AllPosts.length==0){
        res.send({message:"something went wrong"})
    }
    else{
        res.send({message:"posts found",payload:AllPosts})
    }
}))

//get userdata by username 
PostsApi.get('/getPosts/:username', expressAsyncHandler(async (req, res) => {
    const name = (req.params.username)
    
    let posts = req.app.get('posts')
    let userData = await posts.findOne({username:name})
    
    if(userData==null){
        res.send({message:"something went wrong"})
    }
    else{
        res.send({message:"posts found",payload:userData})
    }
}))

//Adding New Post
PostsApi.post('/addPost',upload.single('photo'),expressAsyncHandler(async (req, res) => {

    let link=""+req.file.path 
    let username=req.body.username
   
    let posts=req.app.get('posts')
    let userObj=await posts.findOne({username:username})
    
    if(userObj==null){
        res.send({messgae:"something went wrong.."})
    }
    else{
        userObj.MyPosts.push({url:link,captions:req.body.captions})
        await posts.updateOne({username:username}, { $set: userObj })
        res.send({message:"image uploaded successfully.."})
    }

    
}))




//update ProfilePic
PostsApi.put('/updateProfile', upload.single('photo'),expressAsyncHandler(async (req, res) => {
    let posts = req.app.get('posts')
    let updatedObj = req.body
    let result = await posts.findOne({ username: updatedObj.username })
    if (result == null) {
        res.send({ message: "invalid username" })
    }
    else {
        let link=""+req.file.path 
        result.profilePic=link
        result.Bio=updatedObj.Bio 
        await posts.updateOne({ username: updatedObj.username }, { $set: result })
        res.send({ message: "updated succesfully" })
    }
}))

PostsApi.delete('/deleteUser', expressAsyncHandler(async (req, res) => {
    let user = req.app.get('user')
    let updatedObj = req.body
    let result = await user.findOne({ username: updatedObj.username })
    if (result == null) {
        res.send({ message: "invalid username" })
    }
    else {
        await user.deleteOne({ username: updatedObj.username })
        res.send({ message: "deleted succesfully " })
    }
}))
module.exports = PostsApi