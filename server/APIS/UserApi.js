const exp = require('express')

const UserApi = exp.Router()

const bcryptjs = require('bcryptjs')

const expressAsyncHandler = require('express-async-handler')
const { response } = require('express')

const jwt = require('jsonwebtoken')

UserApi.use(exp.json())

//get userdatap
UserApi.get('/getUsers', expressAsyncHandler(async (req, res) => {
    let user = req.app.get('user')
    let users = await user.find().toArray()
    if (users == undefined) {
        res.send({ message: "no users found" })
    }
    else {
        res.send({ message: "users found", payload: users })
    }
}))

//get userdata by username 
UserApi.get('/getUser/:username', expressAsyncHandler(async (req, res) => {
    const name = (req.params.username)
    let user = req.app.get('user')
    let usersData = await user.find().toArray()
    let l = []
   
    for (let user of usersData) {
        if(user.username==name) l.push(user)
    }
    if (l.length==0) {
        res.send({ message: "no users  found" })
    }
    else {
        res.send({ message: "users found", payload: l })
    }
}))

//create user
UserApi.post('/createUser', expressAsyncHandler(async (req, res) => {

    let user = req.app.get('user')
    let requests=req.app.get('requests')
    let posts=req.app.get('posts')

    //extracting user details
    let newUserObj = req.body
    //checking if user exists 
    let oldUser = await user.findOne({ username: newUserObj.username })
    if (oldUser != null) {
        res.send({ message: 'username already exists, choose another one' })
    }
    else {
        let hashedPass = await bcryptjs.hash(newUserObj.password, 5);
        newUserObj.password = hashedPass;
        await user.insertOne(newUserObj)
        let reqObj={
            username:newUserObj.username,
            MyRequests:[],
            PendingRequests:[],
            followers:[],
            following:[]
        }

        let postObj={
            username:newUserObj.username,
            profilePic:undefined,
            MyPosts:[],
            Bio:undefined
        }
        await requests.insertOne(reqObj)
        await posts.insertOne(postObj)
        
        res.send({ message: "user created successfully" })
    }
}))


//login user
UserApi.post('/loginUser', expressAsyncHandler(async (req, res) => {
    let user = req.app.get('user')
    let userObj = req.body

    let result1 = await user.findOne({ username: userObj.id })
    let result2 = await user.findOne({ email: userObj.id })
    let result3 = await user.findOne({ phone: userObj.id })
    let result = { ...result1, ...result2, ...result3 }
    if (result == null) {
        res.send({ message: "invalid details" })
    }
    else {

        let check = await bcryptjs.compare(userObj.password, result.password)
        if (check) {
            //generating a token 
            let token = jwt.sign({ username: userObj.username }, 'abcd', { expiresIn: 30 })
            res.send({ message: "logged in successfully", payload: token, userObj: result })
        }
        else {
            res.send({ message: "invalid password" })
        }
    }
}))

//update user 
UserApi.put('/updateUser', expressAsyncHandler(async (req, res) => {
    let user = req.app.get('user')
    let updatedObj = req.body
    let result = await user.findOne({ username: updatedObj.username })
    if (result == null) {
        res.send({ message: "invalid username" })
    }
    else {
        await user.updateOne({ username: updatedObj.username }, { $set: updatedObj })
        res.send({ message: "updated succesfully" })
    }
}))

UserApi.delete('/deleteUser', expressAsyncHandler(async (req, res) => {
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
module.exports = UserApi