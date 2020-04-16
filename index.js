var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan')
var cors = require('cors')
const dotenv = require('dotenv'); // Environment config
dotenv.config();

const routerEmpresa = require('./routers/empresa')

var app = express();
// BodyParser to convert plain text to JSON
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(cors())

app.use(morgan('dev'))


app.use('/empresa', routerEmpresa)
// Se debe permitir listar los establecimientos asociados sin iniciar sesion
app.use('/', function(req, res){
    res.status(500).json({accion:'home', mensaje:'Browsing is not allowed'}) 

})


const run = async () => {
    await mongoose.connect(process.env.URL_BASEDATOS, { useFindAndModify: true, useNewUrlParser: true, useUnifiedTopology: true })
    await app.listen(process.env.PUERTO_SERVIDOR)
    console.log(`Servidor [${process.env.PUERTO_SERVIDOR}] y base de datos arrancados`)
}

run().catch(err => console.log('Fallo al arrancar:' + err))