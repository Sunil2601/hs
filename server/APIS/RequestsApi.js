const exp = require('express')

const RequestsApi = exp.Router()

const bcryptjs = require('bcryptjs')

const expressAsyncHandler = require('express-async-handler')
const { response } = require('express')

const jwt = require('jsonwebtoken')

RequestsApi.use(exp.json())


//get requests by username 
RequestsApi.get('/getOthersData/:username', expressAsyncHandler(async (req, res) => {
    const name = (req.params.username)
    let requests = req.app.get('requests')

    let usersData = await requests.find().toArray()
    let l = null

    for (let user of usersData) {
        if (user.username == name) {
            l = user
            break
        }
    }
    if (l == null) {
        res.send({ message: "no data  found" })
    }
    else {
        res.send({ message: "data found", payload: l })
    }
}))


//send request
RequestsApi.post('/sendRequest', expressAsyncHandler(async (req, res) => {

    let requests = req.app.get('requests')
    //extracting user details
    let userObj = req.body

    let receiver = await requests.findOne({ username: userObj.receiver })
    let sender = await requests.findOne({ username: userObj.sender })

    if (receiver == undefined) {
        res.send({ message: 'user not exists' })
    }
    else {
        let f = true
        for (let i of receiver.PendingRequests) {
            if (i === sender.username) {
                f = false
                break
            }
        }
        if (f) receiver.PendingRequests.push(sender.username)

        f = true
        for (let i of sender.MyRequests) {
            if (i === receiver.username) {
                f = false
                break
            }
        }
        if (f) sender.MyRequests.push(receiver.username)


        await requests.updateOne({ username: receiver.username }, { $set: receiver })
        await requests.updateOne({ username: sender.username }, { $set: sender })

        res.send({ message: "requests sent successfully" })
    }
}))


RequestsApi.post('/acceptRequest', expressAsyncHandler(async (req, res) => {

    let requests = req.app.get('requests')
    //extracting user details
    let userObj = req.body
    let acceptor = await requests.findOne({ username: userObj.acceptor })
    let sender = await requests.findOne({ username: userObj.sender })
    if (acceptor == undefined) {
        res.send({ message: 'User not exists' })
    }
    else {
        i1 = -1
        for (let i = 0; i < acceptor.PendingRequests.length; i++) {
            if (i == sender) {
                i1 = i
                break
            }
        }

        i2 = -1
        for (let i = 0; i < sender.MyRequests.length; i++) {
            if (i == acceptor) {
                i2 = i
                break
            }
        }

        acceptor.PendingRequests.splice(i1, 1)
        sender.MyRequests.splice(i2, 1)
        acceptor.followers.push(sender.username)
        sender.following.push(acceptor.username)

        await requests.updateOne({ username: acceptor.username }, { $set: acceptor })
        await requests.updateOne({ username: sender.username }, { $set: sender })

        res.send({ message: "request accepted" })

    }
}))

//delete request


RequestsApi.post('/deleteRequest', expressAsyncHandler(async (req, res) => {

    let requests = req.app.get('requests')
    //extracting user details
    let userObj = req.body
    let acceptor = await requests.findOne({ username: userObj.acceptor })
    let sender = await requests.findOne({ username: userObj.sender })
    if (acceptor == undefined) {
        res.send({ message: 'User not exists' })
    }
    else {
        i1 = -1
        for (let i = 0; i < acceptor.PendingRequests.length; i++) {
            if (i == sender) {
                i1 = i
                break
            }
        }

        i2 = -1
        for (let i = 0; i < sender.MyRequests.length; i++) {
            if (i == acceptor) {
                i2 = i
                break
            }
        }

        acceptor.PendingRequests.splice(i1, 1)
        sender.MyRequests.splice(i2, 1)
        
        await requests.updateOne({ username: acceptor.username }, { $set: acceptor })
        await requests.updateOne({ username: sender.username }, { $set: sender })

        res.send({ message: "request deleted" })

    }
}))

//update user 
RequestsApi.put('/updateUser', expressAsyncHandler(async (req, res) => {
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

RequestsApi.delete('/deleteUser', expressAsyncHandler(async (req, res) => {
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
module.exports = RequestsApi