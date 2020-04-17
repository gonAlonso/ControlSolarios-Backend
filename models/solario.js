let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let SolarioSchema = Schema(
    {
        _id: {type: Schema.ObjectId, auto:true},
        propietario: {type: Schema.ObjectId, ref:'Empresa'},
        nombre: String,
        potencia: Number,
        fechaUltimaRevision: {
            type: Date,
            default: Date.now
        },
        estado: {
            type: String,
            enum: ["ACTIVO", "ELIMINADO", "MANTENIMIENTO"],
            default: "ACTIVO"
        }
    }
)


module.exports = mongoose.model('Solario', SolarioSchema)