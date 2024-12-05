const express = require('express');

// 1) IMPORT USERS CONTROLLER
const userController = require('./../controllers/usersControllers');

// IMPORT THE authController 
const authController = require("../controllers/authController");

// 2) Make the userRouter 
const usersRouter = express.Router();

// import authantication route
// const authController = require("../controllers/authController");
// make the signup route
usersRouter.post('/signup' , authController.signup);
// make the login route
usersRouter.post('/login' , authController.login);
// make the forgotPassword route
usersRouter.post('/forgotPassword' , authController.forgotPassword);
usersRouter.patch('/resetPassword/:token', authController.resetPassword);
usersRouter.patch('/UpdatePassword' ,authController.protact,authController.UpdatePassword);
usersRouter.patch('/updateMe',authController.protact , userController.updateMe);
usersRouter.delete('/deleteMe',authController.protact , userController.deleteMe);
// 3) USER ROUTE
usersRouter.route('/')
.get(authController.protact , authController.restrictTo('admin') , userController.getAllUsers)
.post(authController.protact , authController.restrictTo('admin') , userController.createUsers);

usersRouter.route('/:id')
.get(authController.protact , authController.restrictTo('admin') ,userController.getUser)
.patch(authController.protact , authController.restrictTo("admin") ,userController.updateUser)
.delete(authController.protact , authController.restrictTo('admin') , userController.deleteUser)

// 4)  Export the rout
module.exports = usersRouter;
