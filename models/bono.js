let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let BonoSchema = Schema(
    {
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
        }
    }
)


module.exports = mongoose.model('Bono', BonoSchema)