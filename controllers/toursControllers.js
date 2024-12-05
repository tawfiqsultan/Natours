

// IMPORT TOUR MODEL 
const Tour = require('../models/tourModel');


//IMPORT CATCH ASYNC HUNDLER!!!!
const catchAsync = require('../utils/catchAsync');

const Factory = require('./handlerFactory');

// cheap 5 tours middlware 
exports.aliasTopTours = (req , res , next) =>{
    req.query.sort = 'price,-ratingsAverage';
    req.query.limit = '5';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}


// MAKE THE TOUR HANDLLERS AND EXPORT THEM

exports.getAllTours = Factory.getAll(Tour)
exports.getTour = Factory.getOne(Tour , {path : 'Reviews'})



exports.getStatisticTours = catchAsync( async(req,res , next) =>{
    const statistic = await Tour.aggregate([
    {
        $match: {ratingsAverage: { $gte: 4.5 }}
    },
    {
        $group:{
            _id:{ $toUpper : '$difficulty'},
            numTours: {$sum : 1},
            numRatings:{$sum : '$ratingsQuantity'},
            avgRating :{ $avg : '$ratingsAverage' },
            avgPrice: { $avg : '$price'},
            minPrice: { $min : '$price'},
            maxPrice: { $max : '$price'}
        }
    },
    {
        $sort:{ avgPrice : 1 }
    },
    // {
    //     $match : { _id : {$ne: 'EASY'}}
    // }
]);
res.status(200).json({
    status:'Success',
    data:{
        The_Statistic : statistic,
    }
})
})

exports.getMonthlyPlan = catchAsync(async (req , res , next) =>{

    const year = Number(req.params.year); // 2021
    const paln = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match:{                    
                startDates:
                {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                }
            }
        },
        {
            $group:
            {
                _id: {$month: '$startDates'},
                numOfTourStart: { $sum : 1 },
                tours: {$push : '$name'}
            }
        },
        {
            $addFields: { month : '$_id' }
        },
        {
            $project: { _id : 0 }
        },
        {
            $sort: {  numOfTourStart: -1 }
        }

    ])
    res.status(200).json({
        status: 'Success',
        data:{
            The_paln : paln
        }
    })
})

//create tour
exports.creatTour = Factory.createOne(Tour)
// update tour
exports.updateTourInfo = Factory.updateOne(Tour);
// delete tour
exports.deleteTour = Factory.deleteOne(Tour);

