let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let SolarioSchema = Schema({
        nombre: String,
        potencia: Number,
        proximaRevision: {
            type: Date,
            default: Date.now
        },
        estado: {
            type: String,
            enum: ["ACTIVO", "ELIMINADO", "MANTENIMIENTO"],
            default: "ACTIVO"
        }
    })


module.exports = mongoose.model('Solario', SolarioSchema)