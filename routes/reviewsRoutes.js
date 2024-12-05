const express = require('express');
const reviewsControler = require("../controllers/reviewsControler");
const authConroler = require("../controllers/authController");

const reviewRouter = express.Router({mergeParams : true});


reviewRouter.route('/')
.get(authConroler.protact, reviewsControler.getAllReviews)
.post(
    authConroler.protact ,
    authConroler.restrictTo('user'),
    reviewsControler.createReview
    );

reviewRouter.route('/:id')
.delete(authConroler.protact,reviewsControler.deleteReview)
.get(authConroler.protact , reviewsControler.getReview)
.patch(authConroler.protact , authConroler.restrictTo("user"),reviewsControler.updateReview);



module.exports = reviewRouter;
