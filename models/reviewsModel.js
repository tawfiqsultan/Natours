const mongoos = require('mongoose');
// review // rating // createdAt //ref tour // ref user
const reviewSchema = new mongoos.Schema({
    review :{
        type:String,
        required:[true,"review cat not by empty"]
    },
    rating:{
        type:Number,
        min : [1,"the rating must be above or equal 1"],
        max : [5 , "the rating must be below or equal 5.0"]
    },

    createdAt:{
        type: Date,
        defult:Date.now()
    },

    tour:{
        type: mongoos.Schema.ObjectId,
        ref:'Tour',
        required:[true , "Review must belong to a tour"]
    } ,

    user:{
        type: mongoos.Schema.ObjectId,
        ref:'User',
        required:[true , "Review must belong to a user"]
    },
    
},
{
    
    toJSON:{virtuals:true } ,
    toObject:{virtuals:true },
    
}
);


reviewSchema.pre('save', function(next){
    this.createdAt = Date.now();
    next();
})

reviewSchema.pre(/^find/ , function(next){
    this.populate({
        path:'user',
        select:'name photo -_id'
    })
    next();
})


const reviews = mongoos.model('reviews',reviewSchema);


module.exports = reviews;