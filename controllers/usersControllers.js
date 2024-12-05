const { application } = require('express');
const user = require('../models/user`sModel');
const catchAsync = require('../utils/catchAsync');
const AppErrore = require('../utils/appErrore');
const User = require('../models/user`sModel');
const Factory = require('./handlerFactory');
// MAKE THE TOUR HANDLLERS AND EXPORT THEM

const filtredObj = (obj , ...allowedFields) =>{
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el]
    })
    return newObj;
}

// get all users
exports.getAllUsers = Factory.getAll(user)


exports.updateMe = catchAsync(async(req,res,next)=>{
    //1) don`t allow update user password in this route 
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppErrore("This route is not for update password , please use /UpdatePassword",400));
    }

    //2) update the data data
    const filtredBody = filtredObj(req.body , "name" , "email");
    console.log(filtredBody);  
    const updatedUser = await User.findByIdAndUpdate(req.user.id , filtredBody , {
        new:true ,
        runValidators:true
    })

    res.status(200).json({
        status:"Success",
        data:{
            updatedUser
        }
    })

})

exports.deleteMe = catchAsync(async(req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id , {active:false});

    res.status(204).json({
        status:"Success",
        data:null
    })
})


exports.getUser = Factory.getOne(user)

exports.createUsers = Factory.createOne(user);

exports.updateUser = Factory.updateOne(User);

exports.deleteUser = Factory.deleteOne(User);

