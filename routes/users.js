const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get(`/`, async (req, res) =>{
    const userList = await User.find();

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
    console.log("User Page Running.......")
})

//GET Single User 
router.get(`/:id`, async (req, res) =>{
    const user = await User.findById(req.params.id);

    if(!user) {
        res.status(500).json({success: false, message: 'The user with the Given ID was not found'})
    } 
    res.status(200).send(user);
    console.log("user Page Running.......")
})


//Post user
router.post(`/`,async (req,res)=>{
    let user = new User({
        name:req.body.name,
        email:req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 07),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        Zip: req.body.Zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if(!user)
    return res.status(404).json('The USer cannot be created')

    res.send(user);
    console.log("User Page Running.......")
})

//Update User
router.put(`/:id`,async (req,res)=>{

    const userExist = await User.findById(req.params.id);
    let newPassword 
    if(req.body.password){
        newPassword = bcrypt.hashSync(req.body.password,10)
    }else{
        newPassword = userExist.passwordHash;
    }
    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name:req.body.name,
            email:req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            Zip: req.body.Zip,
            city: req.body.city,
            country: req.body.country,
        },
        {
            new: true
        }
    )
    if(!user){
        res.status(400).send('The user cannot be created!')
    }
    res.send(user);
})

//Login Post Request
router.post(`/login`, async (req,res)=>{
    const user = await User.findOne({email: req.body.email})
    const secret = process.env.secret;
    if(!user){
        return res.status(400).send('The User Not Found')
    }

    if(user && bcrypt.compareSync(req.body.passwordHash, user.passwordHash)){

        const token = jwt.sign(
            {
                userId : user.id,
                isAdmin: user.isAdmin
            },
            secret,
            {expiresIn: '1d'}
        )
        res.status(200).send({user: user.email, token})
    }else{
        res.status(400).send('Password is Wrong!')
    }
})

//Register post
router.post(`/register`,async (req,res)=>{
    let user = new User({
        name:req.body.name,
        email:req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 07),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        Zip: req.body.Zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save();

    if(!user)
    return res.status(404).json('The USer cannot be created')

    res.send(user);
    console.log("User Page Running.......")
})

//Count User List
router.get('/get/count', async (req, res)=> {

    const userCount = await User.countDocuments()
  
    if(!userCount){
      res.status(500).json({success: false, message:'Counting Process Not Completed.....'})
    }
    res.send({
      userCount: userCount
    })
    // res.send('respond with a Product');
    console.log("User Page Running.......")
  });

  
//Delete Users
router.delete('/:id',(req,res)=>{
    User.findByIdAndRemove(req.params.id).then(user=>{
        if(user){
            return res.status(200).json({success:true, message:' The User is Delete'})
        }else{
            return res.status(404).json({success:false, message:' The User is not found'})
        }
    }).catch(err=>{
        return res.status(400).json({success: false, error: err})
    })
  })

module.exports =router;