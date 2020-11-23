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
        from: 'no-reply@isolaris.com',
        to: email,
        subject: 'iSolaris :: Confirmar registro',
        html: data,
        attachments: [{
            filename: 'logo.png',
            path: __dirname +'/logo.png',
            cid: 'logo' 
       }]
    };

    await transport.sendMail(message, function(err, info) {
        if (err) { console.log("Email error: ",err) }
        else { console.log("Email sent: ",info.messageId); }
    });
}



module.exports = {
    sendVerificationEmail
}