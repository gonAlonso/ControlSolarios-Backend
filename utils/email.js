const nodemailer = require('nodemailer');
const Mail = require('nodemailer/lib/mailer');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const fs = require("fs");
const ejs = require("ejs");
//const { process } = require('@hapi/joi/lib/errors');
//const { process } = require('@hapi/joi/lib/errors');


async function sendVerificationEmail({email, id, nombre, type}){

    transport = nodemailer.createTransport({
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
            user: '3f19de5b797313',
            pass: '43006dbca98d07'
        }
    })
    //console.log("ID[email]:", id)

    const token = jwt.sign( {
            _id: id,
            email: email,
            type,
            exp: Math.floor(Date.now() / 1000) + (60 * 60), //1 hora
        }, 
        process.env.TOKEN_SECRETO
    )

    const data = await ejs.renderFile(__dirname + "/verification_email.ejs",
    {
        nombre,
        token,
        url: process.env.URL_FRONTEND
    });


    const message = {
        from: 'no-reply@isolaris.com', // Sender address
        to: email,         // List of recipients
        subject: 'iSolaris :: Confirmar registro', // Subject line
        //html: `<h3>Registro en iSolaris</h3><p><em>${nombre}</em> haz click en <a href="${process.env.URL_FRONTEND}verify/${token}">este enlace</a> para verificar tu email</p>`
        html: data
    };

    await transport.sendMail(message, function(err, info) {
        if (err) { console.log("Email error: ",err) }
        else { console.log("Email sent: ",info.messageId); }
    });
}



module.exports = {
    sendVerificationEmail
}