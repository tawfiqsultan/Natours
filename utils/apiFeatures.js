class ApiFeatures{
    constructor(query , queryString){
        this.query = query ;
        this.queryString = queryString ;
    }

    filter(){
         //1A) filtering
            
        const queryObj = {...this.queryString};

        // just basic fillter example!!
        const excludedFields = ['page', 'sort' , 'limit' , 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        // //1B) advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr =  JSON.parse(queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match => `$${match}`));
        this.query = this.query.find(queryStr);

        return this;
    }

    sort(){
        if(this.queryString.sort){
            const sortingBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortingBy);
        }
        else
        {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    fieldlimiting(){
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }
        else
        {
            this.query = this.query.select('-__v');
        }
        return this;
    }

    pagination(){
        const page = Number(this.queryString.page) || 1;
        const limit = Number(this.queryString.limit) || 100;
        const skip = (page-1) * limit;
        this.query = this.query.skip(skip).limit(limit);

        return this
    }
}

module.exports = ApiFeatures;