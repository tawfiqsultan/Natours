const mongoose = require("mongoose");
const validator = require('validator');
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const { type } = require("os");
const userSchema = new mongoose.Schema({
    name :{
        type:String,
        required:[true , "Please tell us your name!"],
    },
    email:{
        type : String,
        required : [true , "Please tell us your email!"],
        unique:[true , "This email has already been registered"],
        lowercase:true,
        validate : [validator.isEmail , "Please provide a avalid email"]
    },
    photo:{
        type: String,
    },
    
    role:{
        type:String,
        enum:["user","guide","lead-guide","admin"],
        default:"user"
    },

    password :{
        type: String,
        required:[true , "please you must have a password"],
        minlength:[8 , "The password must have 8 charcter`s at least"],
        select:false
    },
    passwordConfirm:{
        type:String,
        required: [true , "Please confirm your password"],
        validate:{
            validator: function(el){
                return el === this.password;
            },
            message:'password confirm is wrong!',
        }
    },
    passwordChangedAt : {
        type:Date
    },
    PasswordResetToken: String,
    PasswordResetExpires:Date,
    active:{
        type: Boolean,
        default:true,
        select:false
    }
});



userSchema.pre('save', async function(next){
    // Only run this function if password was actually modified!!
    if(!this.isModified('password')) return next();
    //Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password , 12);
    //Delete the passwordConfirm field
    this.passwordConfirm = undefined;
    next();
    
});


// userSchema.methods.correctPassword = async function(candidatePssword , userPasswrod){
//     return await bcrypt.compare(candidatePssword,userPasswrod);
// }

userSchema.methods.correctPassword = async function(candidatePssword,userPasswrod){
    return await bcrypt.compare(candidatePssword,userPasswrod);
}

userSchema.methods.changedPasswordAfter = function(JwtTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        console.log( changedTimestamp , JwtTimestamp);
        return changedTimestamp > JwtTimestamp;
    }

    //fa;se mean  NOT changed 
    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.PasswordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.PasswordResetExpires = Date.now() + 10 * 60 * 1000

    console.log({resetToken} , this.PasswordResetToken);

    return resetToken;
}

userSchema.pre("save",function(next){
    if(!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000; 
    next();
})

userSchema.pre(/^find/,function(next){
    //this points to the currnet query
    this.find({active: {$ne:false} });
    next();
})

const User = mongoose.model('User',userSchema);

module.exports = User;
