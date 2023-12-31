const asyncHandler = require('express-async-handler');
const User = require('../models/userModel')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { trusted } = require('mongoose');

const generateToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"})
}


//Register user =============================================================
exports.registerUser = asyncHandler(async (req,res )=> {
  const {name, email, password} = req.body;


  //validation
  if(!name|| !email|| !password) {
    res.status(400)
    throw new Error('Please fill in all required fields')
  }
  if(password.length < 6){
    res.status(400)
    throw new Error('Password must be up to 6 characters')
  }
  //check if user email already exist
  const userExists = await User.findOne({email});

  if(userExists) {
    res.status(400)
    throw new Error('Email has already exists')
  }



  //Create new user
  const user = await User.create({
    name,
    email,
    password
  })

    //generate token
    const token = generateToken(user._id)

    //send HTTP-only cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400), // 1 day
      sameSite: "none",
      secure: true
    });

  if(user) {
    const {_id, name, email, photo, phone, bio } = user;
    res.status(201).json({
      _id, name, email, photo, phone, bio, token

    })
  } else {
    res.status(400)
    throw new Error("Invalid user data")
  }

})

//Login User ============================================================
exports.loginUser = asyncHandler( async (req, res) => {
  const {email, password} = req.body;

  //validate request
  if(!email || !password) {
    res.status(400);
    throw new Error('Please add email and password')
  }
  //check if usaer exists
  const  user = await User.findOne({email})  

  if(!user){
    res.status(400);
    throw new Error('User not found, please signup')
  }

  //User exists, check if password is correct
  const passwordIsCorrect = await bcrypt.compare(password, user.password)

  //generate token
  const token = generateToken(user._id)

  //send HTTP-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: "none",
    secure: true
  });
  

  if(user && passwordIsCorrect) {
    const {_id, name, email, photo, phone, bio} = user;
    res.status(200).json({
      _id, name, email, photo, phone, bio, token
    })
  } else {
    res.status(400)
    throw new Error('Invalid email or password');
  }
})

//logout user
exports.logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true
  });
  return res.status(200).json({ message: "Successfully Logged Out"})
})

//get  user data
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if(user) {
    const {_id, name, email, photo, phone, bio } = user;
    res.status(201).json({
      _id, name, email, photo, phone, bio

    })
  } else {
    res.status(400)
    throw new Error("User not found")
  }
})

//get Login Status
exports.loginStatus = asyncHandler(async(req,res) => {
  const token = req.cookies.token
  if(!token){
    return res.json(false)
  } 
  //verify token
  const verified = jwt.verify(token, process.env.JWT_SECRET)
  if(verified){
    return res.json(true);
  } 
    return res.json(false)
})

//update user
exports.updateUser = asyncHandler(async (req,res) => {
  const user = await User.findById(req.user._id)

  if(user){
    const {name, email, photo, phone, bio } = user;
    user.email = email, 
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;
    user.photo = req.body.photo || photo;
    const updatedUser = await user.save()
    res.status(200).json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      photo: updatedUser.photo,
      phone: updatedUser.phone,
      bio: updatedUser.bio 
    })    
  }else{
    res.status(404)
    throw new Error('User not found')
  }
})

exports.changePassword = asyncHandler(async(req,res) =>{
  
})