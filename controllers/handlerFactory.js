const catchAsync = require('../utils/catchAsync');
const AppErrore = require('./../utils/appErrore');
const ApiFeatures = require('../utils/apiFeatures')

exports.deleteOne = model => catchAsync(async (req , res , next)=>{ 
    const duc = await model.findOneAndDelete({_id:req.params.id});

    if(!duc){
        return next(new AppErrore('NO document with that id',404));
    }
    
    res.status(204).json({
        status:`Success`,
        data:null
    })
})

exports.updateOne = model =>  catchAsync(async (req,res , next)=>{
    const updatedDuc = await model.findOneAndUpdate({_id:req.params.id},
        req.body ,{
        new: true,
        runValidators:true
        });

        if(!updatedDuc){
            return next(new AppErrore('NO document with that id',404))
        }

    res.status(200).json({
        status:'Success',
        data:{
            data: updatedDuc
        }
    })
}
)

exports.createOne = model =>  catchAsync(async (req,res, next)=>{
    const newDuc = await model.create(req.body);

    res.status(201).json({
        status: 'Success',
        data: {
        tourData: newDuc,
        }
})
});

exports.getOne = (model , popOptions) => catchAsync(async(req,res,next)=>{
    let query = model.findOne({_id:req.params.id})
    if(popOptions) query = query.populate(popOptions);

    const duc = await query;
    if(!duc) next(new AppErrore("we dont have any document whit this id" , 404));

    res.status(200).json({
        status : "success",
        data: duc
    })
})

exports.getAll = model => catchAsync(async (req, res , next)=>{

    //EXECUTE QUERY
    const features = new ApiFeatures(model.find() , req.query)
    .filter()
    .sort()
    .fieldlimiting()
    .pagination();
    const ducs = await features.query;
    // SEND RESPONSE
    res.status(200).json({
        status:'Success',
        results: ducs.length,
        data: ducs
    })
}
) 

