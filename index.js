var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan')
var cors = require('cors')

const routerEmpresa = require('./routers/empresa')
//const routerSolario = require('./routers/solario')
//const routerOperario = require('./routers/operario')
//const routerUsuario = require('./routers/usuario')
//const routerBono = require('./routers/bono')
//const routerSesion = require('./routers/sesion')Copy
const routerGestion = require('./routers/gestion')
const routerAdmin = require('./routers/admin')
const routerLogin = require('./routers/login');
//const { process } = require('@hapi/joi/lib/errors');
//const dotenv = require('dotenv'); // Environment config
//dotenv.config();
require("dotenv").config()

//const Login = require('./controller/login')

var app = express();
// BodyParser to convert plain text to JSON
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(cors())

app.use(morgan('dev'))

app.use('/empresa', routerEmpresa)
//app.use('/solario', routerSolario)
//app.use('/operario', routerOperario)
//app.use('/usuario', routerUsuario)
//app.use('/bono', routerBono)
//app.use('/sesion', routerSesion)
app.use('/gestion', routerGestion)
app.use('/admin', routerAdmin)
//app.use('/login', routerLogin)

//app.use('/login', Login.login )
//app.use('/verify', Login.verifyLogin )
app.use('/login', routerLogin )
app.use('/verify', routerLogin )
app.use('/', (req, res) => { res.status(500).json({accion:'root', mensaje:'Function denied'}) })


const run = async () => {
    console.log(`Conectando a la base de datos`)
    await mongoose.connect(
        process.env.URL_BASEDATOS,
        {
            useFindAndModify: false,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    );

    console.log(`Iniciando servidor`)
    await app.listen(process.env.PUERTO_SERVIDOR, '0.0.0.0')
    console.log(`Servidor [${process.env.PUERTO_SERVIDOR}] y base de datos arrancados`)
}

run().catch(err => console.log('Fallo al arrancar:' + err))
