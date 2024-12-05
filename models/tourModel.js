const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./user`sModel');
const tourSAchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true , 'A tour must have a name'],
        unique:true,
        trim: true,
        maxlength: [40 , 'A tour name mus have less or equal then 40 charcter'],
        minlength: [10 , 'A tour name mus have more or equal then 10 charcter'],
        // validate: [validator.isAlpha , 'A tour name most only contsin char']
    },

    slug: String,

    duration:{
        type: Number,
        required:[true , 'A tour must have a duration']
    },

    maxGroupSize:{
        type:Number,
        required:[true , 'A tour must have a group size']
    },

    difficulty:{
        type:String,
        required : [true , 'A tour must have a difficulty'],
        enum: {
            values : ['easy', 'medium','difficult'],
            message: 'Difficulty is either: easy , medium , difficult '
        } ,
    },

    ratingsAverage:{
        type:Number,
        default:4.5,
        min:[1,'Rating must be above 1.0'],
        max:[5,'Rating must be equal or below 5.0'],
    },

    ratingsQuantity:{
        type:Number,
        default:0
    },

    price:{
        type:Number,
        required:[true , 'A tour must have a price' ]
    },

    priceDiscount:{
        type:Number,
        validate:{
            validator: function(value){
                //THIS ONLY POINTS TO CURRENT DOCUMENT ON NEW DOCUMENT CREATION
                return value < this.price;
            },
            message:'Discout price ({VALUE} ) should be below regular price',
        }
    },

    summary:{
        type:String,
        trim:true
    },

    description:{
        type:String,
        trim: true,
        required:[true , 'A tour must have a description' ]
    },

    imageCover:{
        type:String,
        required:[true , 'A tour must have a description cover image' ]
    },

    images: [String],
    createdAt:{
        type:Date,
        default:Date.now()
    },

    startDates: [Date],

    startLocation: {
        //Goe json
        type:{
            type:String,
            default:"point",
            enum:["point"]
        },
        coordinates:[Number],
        address:String,
        description:String
    },

    locations:[{

        type:{
            type:String,
            default:"point",
            enum:["point"]
        },
        coordinates:[Number],
        address:String,
        description:String,
        day:Number

    }],

    guides:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'User'
        }
    ],


    secretTour: {
        type: Boolean,
        default:false,
    },


},
{ 
    toJSON:{ virtuals:true } ,
    toObject:{ virtuals:true } 
}
);

tourSAchema.virtual('durationWeeks').get( function() {
    return this.duration / 7;
})

tourSAchema.virtual("Reviews",{
    ref:'reviews',
    foreignField:'tour',
    localField:'_id'
})

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
tourSAchema.pre('save',function(next){
    this.slug = slugify(this.name , { lower : true });
    next();
});  

//embadding
// tourSAchema.pre('save',async function(next){
//     const guidesPromises = this.guides.map( async id => await User.findById(id))
//     this.guides = await Promise.all(guidesPromises)
//     next();
// })

// tourSAchema.pre('save',function(next){
//     console.log('will save the document!!!');
//     next();
// });

// tourSAchema.post('save' , function(doc , next){
//     console.log(doc);
//     next();
// })

// QUERY MIDDLEWARE 
tourSAchema.pre(/^find/,function(next){
    this.find({secretTour : {$ne:true}});

    this.start = Date.now();
    next();
})

tourSAchema.pre(/^find/ , function(next){
    this.populate({
        path:'guides',
        select: '-__v -passwordChangedAt'
    })
    next();
})

tourSAchema.post(/^find/,function(docs,next){
    console.log(`Query took ${Date.now() - this.start} milliseconds`);
    // console.log(docs);
    next();
});


// AGGREGATION MIDLLEWARE

tourSAchema.pre('aggregate' , function(next){

    this.pipeline().unshift({  $match: { secretTour : {$ne:true} }  })

    next();
})

const Tour = mongoose.model('Tour', tourSAchema);

module.exports = Tour;
