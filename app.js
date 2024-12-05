const express = require('express');
const app = express();
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

// IMPORT THE MORGAN PAKGE TO SHOW THE REQUISTS THAT HAPPEN TO API
const morgan = require('morgan');
// IMPORT THE TOURS ROUTE
const tourRouter = require(`./routes/tourRoutes`);
// IMPORT THE USERS ROUTE
const usersRouter = require('./routes/userRoutes');
//IMPORT THE REVIEW ROUTE
const reviewRoute = require('./routes/reviewsRoutes');
// IMPORT APP ERRORE HANDLER
const AppError = require('./utils/appErrore');
// IMPORT ERRORE CONTROLLER handler
const globalErrorHandler = require('./controllers/ErroreController');



// 1)Global MIDDLEWARES

// security http headers 
app.use(helmet());


//development loggong 
if(process.env.NODE_ENV == "development"){
    app.use(morgan('dev'));
}

// body barser , resding the data from body to req.body
app.use(express.json({ limit:'10kb' }));

//Data sanitization against NoSql query injection 
app.use(mongoSanitize());

//Data sanitization against xss
app.use(xss());


//
app.use(hpp({
    whitelist:[
        "duration",
        "ratingsQuantity",
        "ratingsAverage",
        "maxGroupSize",
        "difficulty",
        "price"
    ]
}));

// serving static
app.use(express.static(`${__dirname}/public`));

// limit the number of requests fom one ip in hour
const limiter =  rateLimit({
    max:100,
    windowMs : 60 * 60 * 1000,
    message:"Too many requests from this IP, please try again in an hour!!"
})

app.use('/api',limiter);

//MAKE TOUR ROUTE MIDDLE WARE
app.use(`/api/v1/tours`, tourRouter);

//MAKE USER ROUTE MIDDLE WARE
app.use(`/api/v1/Users`,usersRouter);

// MAKE REVIEW ROUTE MIDDLE WARE 
app.use(`/api/v1/reviews`,reviewRoute)

// MIDDLE WARE FOR ANY UNCORRECT URLS!!
app.all('*',(req,res,next)=>{
    next(new AppError(`can't find ${req.originalUrl} on this server!`,404));
    
});


app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
    next();
})




app.use(globalErrorHandler);


module.exports = app;
