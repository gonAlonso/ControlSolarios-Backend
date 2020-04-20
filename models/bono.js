let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let BonoSchema = Schema(
    {
        _id: {type: Schema.ObjectId, auto:true},
        empresa: {type: Schema.ObjectId, ref:'Empresa'},
        usuario: {type: Schema.ObjectId, ref:'Usuario'},
        valor: Number,
        restante: Number,
        tipo: {
            type: String,
            enum: ["SESIONES", "MINUTOS",],
            default: "SESIONES"
        },
        fechaRegistro: {
            type: Date,
            default: Date.now
        },
        fechaLimite: {
            type: Date
        },
        estado: {
            type: String,
            enum: ["ACTIVO", "BAJA", "ELIMINADO", "IMPAGO"],
            default: "ACTIVO"
        }
    }
)


module.exports = mongoose.model('Bono', BonoSchema)