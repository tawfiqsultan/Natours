
class AppErrore extends Error {
    constructor(message , statusCode){
        // LIKE CALLING ERRORE
        super(message);
        //
        this.statusCode = statusCode;
        this.status = `${this.statusCode}`.startsWith('4') ? 'fail' : 'errore' ;
        this.isOperational = true;
        Error.captureStackTrace(this,this.constructor);
        
    }
}

module.exports = AppErrore;