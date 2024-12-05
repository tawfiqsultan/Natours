const reviews = require('../models/reviewsModel');



//IMPORT CATCH ASYNC HUNDLER!!!!
const catchAsync = require('../utils/catchAsync');

const Factory = require('./handlerFactory');


exports.createReview = catchAsync(async(req,res,next)=>{
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;

    const review = await reviews.create({
        "review":req.body.review,
        "rating":req.body.rating,
        "tour":req.body.tour,
        "user":req.user.id,
    });
    res.status(201).json({
        status:"success",
        data:{
            Review : review
        }
    })
})

// get all reviews
exports.getAllReviews = Factory.getAll(reviews)

// delete review
exports.deleteReview = Factory.deleteOne(reviews);
//update review
exports.updateReview = Factory.updateOne(reviews);
// get reveiw 
exports.getReview = Factory.getOne(reviews)