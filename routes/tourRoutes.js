const express = require('express');  
// 1)IMPORT TOUR CONTROLLER
const tourController = require('./../controllers/toursControllers');

// import aouthController 

const authController  = require('../controllers/authController');

const reviewsRoutes = require('../routes/reviewsRoutes');
// 2) Make the tourRouter 
const tourRouter = express.Router();


tourRouter.use('/:tourId/reviews' , reviewsRoutes);

// 3) Tour Routes
tourRouter.route('/top-5-cheap')
.get(authController.protact , tourController.getAllTours);

tourRouter.route('/tour-statistic')
.get(tourController.getStatisticTours);

tourRouter.route('/monthly-plan/:year')
.get(tourController.aliasTopTours,tourController.getMonthlyPlan);

tourRouter.route('/')
.get(authController.protact,tourController.getAllTours)
.post(authController.protact , authController.restrictTo('admin'),tourController.creatTour);

tourRouter.route('/:id')
.get(authController.protact ,tourController.getTour)
.patch(authController.protact , authController.restrictTo("admin" , "lead-guide") , tourController.updateTourInfo)
.delete(authController.protact,authController.restrictTo("admin","lead-guide"),tourController.deleteTour);

// tourRouter.route('/:tourId/reviews')
// .post(
//     aouthController.protact,
//     aouthController.restrictTo('user'),
//     reviewsControler.createReview
// );

// 4) Export the rout
module.exports = tourRouter;
