let mongoose = require('mongoose');

var Solario = require('./solario')

let Schema = mongoose.Schema;

let EmpresaSchema = Schema(
    {
        _id: {type: Schema.ObjectId, auto:true},
        nombre: String,
        cif: String,
        email: String,
        password: String,
        tlf: String,
        nombreFiscal: String,
        direccion: String,
        fechaRegistro: {type: Date, default: Date.now},
        estado: {
            type: String,
            enum: ["REGISTRADO","ACTIVO", "BAJA", "IMPAGO"],
            default: "REGISTRADO"
        },
        tipoBono: {
            type: String,
            enum: ["MINUTOS", "SESIONES"],
            default: "SESIONES"
        },
    }
)


module.exports = mongoose.model('Empresa', EmpresaSchema)