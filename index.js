var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan')
var cors = require('cors')
const dotenv = require('dotenv'); // Para las variables de entorno
dotenv.config();

const routerPuntuacion = require('./routers/puntuacion')
const routerUsuario = require('./routers/usuario')

var app = express();
// Preparo body parser para que transforme las peticiones de texto a json
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(cors())

app.use(morgan('dev'))

app.use('/puntuacion', routerPuntuacion)
app.use('/usuario', routerUsuario)

/*app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});*/


/*
mongoose.connect('mongodb://localhost:27018/scores', {useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify:false})
    .then(res => {
        console.log('Base de datos conectada');
        
        app.listen(5200, ()=>{
            console.log("API REST funcionando en http://localhost:5200")
        })
    })
    .catch(err => console.err('Error al conectar a la base de datos'))
*/

const run = async () => {
    await mongoose.connect(process.env.URL_BASEDATOS, { useFindAndModify: true, useNewUrlParser: true, useUnifiedTopology: true })
    await app.listen(process.env.PUERTO_SERVIDOR)
    console.log("Servidor y base de datos arrancados")
}

run().catch(err => console.log('Fallo al arrancar:' + err))