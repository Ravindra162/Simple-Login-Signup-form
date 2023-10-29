var express = require('express');
var router = express.Router();
var mongoose=require('mongoose');
var jwt = require('jsonwebtoken')
mongoose.connect('mongodb://127.0.0.1:27017/Contacts')
const Schema=new mongoose.Schema({
  email:String,
  password:String
})
const User=mongoose.model('User',Schema)
async function isAuthenticated(req,res,next){
  const {token}=req.cookies
  if(token){
    const decode = jwt.verify(token,'Secret')
    req.user=await User.findById(decode)
    next();
  }
  else res.render('index')
}
router.get('/',isAuthenticated,(req,res)=>{
  res.render('logout',{
    name:req.user.email
  })
})
router.post('/login',async function(req,res){
  const {email,password}=req.body
  let user= await User.findOne({email})
  if(!user){
    return res.redirect('/register')
  }
  const value = user.password===password
  if(value){const Token=jwt.sign({_id:user._id},'Secret')
  res.cookie("token",Token,{
    httpOnly:true,
    expires:new Date(Date.now() +  60*1000),
  })
  return res.redirect('/')}
  res.render('index',{
    message:'Incorrect Password'
  })
})
router.get('/register',function(req,res){
  res.render('register')
})
router.post('/register',async function(req,res){
  const {email,password}=req.body
  let user= await User.findOne({email})
  if(user){
    return res.redirect('/login')
  }
 const data = await User.create({
    email:req.body.email,
    password:req.body.password
  })
  res.redirect('/')
})
router.get('/logout',function(req,res){
  res.clearCookie("ID")
  res.render('index')
})
module.exports = router;
