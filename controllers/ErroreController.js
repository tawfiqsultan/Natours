const app = require('../app');
const AppError = require('../utils/appErrore')

const handleCastErrorDB = err =>{
    const message = `Invalid ${err.path} : ${err.value._id}`;
    return new AppError(message,400);
}


const handleDuplicateFieldsDB = err =>{
    // const value = err.message
    const message = `Duplicate value: ${err.keyValue.name}, Please use another value!`;
    return new AppError(message , 400);
}

const handleValidatorErrorDB = err=>{
    const errors = Object.values(err.errors).map(value => value.message);
    const message = `Invalid input data, ${errors.join('.  ')}`;
    console.log(message);
    return new AppError(message , 400);
    
}


const handleJsonWebTokenError =()=>{
    const message = `Invalid token. Please log in again!`;
    return new AppError(message,401);
}

const handleTokenExpiredError = () =>{
    const message = `your Token is expired please log in again`;
    return new AppError(message , 401);
}



const ErroreDevelopment = (err , res) =>{
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        stack: err.stack,
    });
};


const ErrorProduction = (err , res) =>{
    // Operational, trusted error: send message to client
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message:err.message,
        })
    //Programming or other unknown+ errors
    }else{
        // 1) Log error
        console.error("ERROR =>" , err);

        // 2) send generic message
        res.status(500).json({
            status:"Error!!",
            message: "SomeThing went very wrong!!",
        });
    }
}



module.exports = (err, req , res , next)=>{

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if(process.env.NODE_ENV === 'development'){
        ErroreDevelopment(err , res);
    }else if(process.env.NODE_ENV === 'production'){
        let error = {...err};
        // console.log(error);
        // when the user input error id name of the error is CastError
        if(err.name === "CastError") error = handleCastErrorDB(error);
        // when the user creat a new document and he put SomeThing WORNG! the error code is 11000
        if(err.code === 11000) error = handleDuplicateFieldsDB(error);
        // when you have update data not like we want in the schema!
        if(err._message === "Validation failed") error = handleValidatorErrorDB(error);
        // when the token is wrong!
        if(err.name == "JsonWebTokenError") error = handleJsonWebTokenError();
        // when the token is expired
        if(err.name == "TokenExpiredError") error = handleTokenExpiredError();
        ErrorProduction( error , res);
    }
    
}