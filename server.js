const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err=>{
    console.log(err.name , err.message);
    process.exit(1);
})

const app = require('./app');
const port = 8000;

//
dotenv.config({path:'./config.env'});
// IMPORT THE URL OF DB THAT IN  MONGODB ATLAS 
const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);


mongoose.connect(DB , {
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
}).then( () =>console.log('DB Connection successful!'));



//MAKE START SERVER MIDDLE WARE
const server = app.listen(port , ()=>{
    console.log(`the APP running in port ${port}...`);
} )

process.on("unhandledRejection" , err=>{
    console.log("Error type=> "+err.name);
    console.log("UNHANDLED REJECTION!");
    server.close(()=>{
        process.exit(1);
    })
}); 

