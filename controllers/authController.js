const User = require("../models/user`sModel");
const catchAsync = require('../utils/catchAsync');
const AppErrore = require('../utils/appErrore');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const { rtrim } = require("validator");
const sendEmail = require("../utils/email");
const crypto = require('crypto');
const { decode } = require("punycode");



const signToken = id =>{
    return jwt.sign({id},
    process.env.JWT_SECRET,
    {expiresIn : process.env.JWT_EXPIRSIN});
}

const createSendedToken = (user , statusCode, res) =>{
    const Token = signToken(user._id);
    const cookieOptions = {
        expires:new Date( Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000)),
        httpOnly:true,
        secure:false
    };
    if(process.env.NODE_ENV == "production") cookieOptions.secure = true;

    res.cookie('jwt',Token , cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status:'Success',
        Token,
        data:{
            user: user
        }
    })
}


exports.signup = catchAsync(async(req , res , next) =>{
    const newUser = await User.create(req.body);
    createSendedToken(newUser,201,res);
});


exports.login = catchAsync(async(req,res,next)=>{
    const { email , password} = req.body;
    if(!email || !password) return next(new AppErrore("Please provide email and password!!",400));
    
    const filterdUser = await User.findOne({email}).select('+password');
    const correct = await filterdUser.correctPassword(password,filterdUser.password);
    if(!filterdUser || !correct) return next(new AppErrore("Incorrect email or password",401));
    
    createSendedToken(filterdUser,200,res);
})

exports.protact = catchAsync( async (req,res,next)=>{
    //1) Get the tokken and check if it`s there 
    let token = null;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token) return next(new AppErrore('You are not logged in!! please log in to get Access.' , 401));
    //2) Verfication the token 

    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);

    //3) ckeck if the user still exists 

    const freshUser = await User.findById(decoded.id);

    if(!freshUser) return next( new AppErrore("The user bloging to this token does no longer exist. ",401) ) ;
    

    //4) ckeck if the user change the password after the token was issued
if(freshUser.changedPasswordAfter(decoded.iat)){
    return next(new AppErrore("User recently changed password! please log in again.",401))
}

    console.log(freshUser)
    //GRANT ACCESS TO PROTECTED ROUTE!
    req.user = freshUser;
    next();
})

exports.restrictTo = (...roles) => {
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)) {
            return next(new AppErrore("You do not have permission to perform this action",403))
        }
        next();
    }
    
}

exports.forgotPassword = catchAsync(async(req,res,next)=>{
    //1) get user based on POSTED email 
    const currentUser = await User.findOne({email:req.body.email});
    
    if(!currentUser) {
        return next(new AppErrore("There is no user whit this email address",404));
    }

    //2) Generate the random reset token 
    const resetToken = currentUser.createPasswordResetToken();
    await currentUser.save({validateBeforeSave:false});

    //3) send it to user`s email

    const ResetUrl = `${req.get('host')}/api/v1/Users/resetPassword/${resetToken}`;

    const message = `Forgot your password? submit a PATCH request with your new password and
    passWordConform to: ${ResetUrl}.\nIf you didn't forget your password, ignore this email!! `;

    try{
        await sendEmail({
            email:currentUser.email,
            subject:'your passwors reset token (valid for 10 min)',
            message
        });
    
        res.status(200).json({
            status:"Sucsses",
            Message:"sended to the email!"
        })
    }catch(err){
        currentUser.PasswordResetToken = undefined;
        currentUser.PasswordResetExpires = undefined;

        await currentUser.save({validateBeforeSave:false});

        return next(new AppErrore("There was an error sending the email. Try again later!",500 ))
    }

})

exports.resetPassword = catchAsync(async(req,res,next)=>{

    //1) Get the user based on the token 
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const currentUser = await User.findOne(
        {PasswordResetToken:hashedToken , PasswordResetExpires:{$gt:Date.now()}});

    //2) If token has not expired, and there is user , set the new password

    if(!currentUser) return next(new AppErrore("The token is invalied OR has expired",400));


    currentUser.password = req.body.password;
    currentUser.passwordConfirm = req.body.passwordConfirm;
    currentUser.PasswordResetToken = undefined;
    currentUser.PasswordResetExpires = undefined;
    await currentUser.save();

    //3) Update changedPasswordAt property for the user 

    

    //4) Log the user in, send JWT  

    createSendedToken(currentUser,200,res);

});

exports.UpdatePassword = catchAsync(async(req,res,next)=>{
    //1) get the user form the collection 
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: No user in request" });
    }
    const currentUser = await User.findById(req.user.id).select("+password");

    //3) if currcet so, update password

    if(! (await currentUser.correctPassword(req.body.currentPassword,currentUser.password))){
        return next(new AppErrore("Your currnet password is wrong ",401));
    }

    currentUser.password = req.body.password;
    currentUser.passwordConfirm = req.body.passwordConfirm;

    await currentUser.save();

    //4) log the user in, send jwt

    createSendedToken(currentUser,200,res);

})