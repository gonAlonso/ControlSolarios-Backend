let mongoose = require('mongoose');

var Solario = require('./solario')

let Schema = mongoose.Schema;

let EmpresaSchema = Schema(
    {
        _id: {type: Schema.ObjectId, auto:true},
        login: {type: Schema.ObjectId, ref:'Login'},
        nombre: String,
        cif: String,
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
        historicoEstados: []
    }
)


module.exports = mongoose.model('Empresa', EmpresaSchema)