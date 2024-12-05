const nodemailer = require("nodemailer")

const sendEmail = async options =>{
    //1) create Transport 

    const Transport = nodemailer.createTransport({
        host:process.env.Email_Host,
        port:process.env.Email_Port,
        auth:{
            user:process.env.Email_userName,
            pass:process.env.Email_password
        }
    })

    //2) Define the email options 

    const mailOptions = {
        from:"Tawfiq alqaidy<alqaidy@gmail.com>",
        to:options.email,
        subject: options.subject,
        text: options.message
        //html
    }

    //3) Actually send the email 
    await Transport.sendMail(mailOptions);
}

module.exports = sendEmail;