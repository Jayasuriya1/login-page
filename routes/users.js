var express = require('express');
var router = express.Router();
const {userModel, UserModel} = require('../schemas/userSchema')
const mongoose = require('mongoose')
const {dbUrl} = require('../common/dbConfig');
const { hashPassword, hashCompare, createToken, validate,roleAdminGaurd } = require('../common/auth');
mongoose.connect(dbUrl)

/* GET users listing. */
router.get('/',validate,roleAdminGaurd, async function(req, res) {
  try{
    let users = await UserModel.find({},{password:0})
    res.status(200).send({
      users,
      message: "Users Data Fetched Successfully"
    });
  }catch(error){
    res.status(500).send({
      message:"Internal Server Error",
      error
  })
  }
  })

  router.get('/:id', async function(req, res) {
    try{
      let users = await UserModel.findOne({_id:req.params.id})
      res.status(200).send({
        users,
        message: "Users Data Fetched Successfully"
      });
    }catch(error){
      res.status(500).send({
        message:"Internal Server Error",
        error
    })
    }
    })

    
    router.put('/:id',async(req,res)=>{
      try{
        let user = await UserModel.findOne({_id:req.params.id})
        console.log(user)
        if(user){
          // let user = await UserModel.deleteOne({_id:req.params.id})
          user.name = req.body.name
          user.email = req.body.email
          user.password =req.body.password

          await user.save()
          res.status(201).send({
          message:"User Updated Successfull!"
        })
        }else{
          res.status(400).send({message:"User Does't Exists!"})
        }
        
      } catch (error){
        res.status(500).send({
          message:"Internal Server Error",
          error
        })
      } 
    })

    router.delete('/:id',async(req,res)=>{
      try{
        let user = await UserModel.findOne({_id:req.params.id})
        console.log(user)
        if(user){
          let user = await UserModel.deleteOne({_id:req.params.id})
          res.status(201).send({
          message:"User Deleted Successfull!"
        })
        }else{
          res.status(400).send({message:"User Does't Exists!"})
        }
        
      } catch (error){
        res.status(500).send({
          message:"Internal Server Error",
          error
        })
      } 
    })

router.post('/signup',async(req,res)=>{
  try{
    let user = await UserModel.findOne({email:req.body.email})
    console.log(user)
    if(!user){
      let hashedPassword = await hashPassword(req.body.password)
      req.body.password = hashedPassword

      let user = await UserModel.create(req.body)
      res.status(201).send({
      message:"User Signup Successfull!"
    })
    }else{
      res.status(400).send({message:"User Alread Exists!"})
    }
    
  } catch (error){
    res.status(500).send({
      message:"Internal Server Error",
      error
    })
  } 
})

router.post('/login',async(req,res)=>{
  try{
    let user = await UserModel.findOne({email:req.body.email})
    console.log(user)
    if(user){
      if(await hashCompare(req.body.password,user.password)){
        let token = await createToken({
          name:user.name,
          email:user.email,
          id:user._id,
          role:user.role
        })
        res.status(200).send({
          message:"User Signin Successfull!",
          token
        })
      }else{
        res.status(402).send({message:"Invalid Credential"})
      }
    }else{
      res.status(400).send({message:"User Does Not Exists!"})
    }
    
  } catch (error){
    res.status(500).send({
      message:"Internal Server Error",
      error
    })
  } 
})

module.exports = router;
