let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let UsuarioSchema = Schema(
    {
        _id: {type: Schema.ObjectId, auto:true},
        empresa: {type: Schema.ObjectId, ref:'Empresa'},
        nombre: String,
        dni: String,
        //pin: Number,
        email: String,
        tlf: Number,
        fototipo: String,
        fechaRegistro: {
            type: Date,
            default: Date.now
        },
        estado: {
            type: String,
            enum: ["ACTIVO", "BAJA", "ELIMINADO", "IMPAGO"],
            default: "ACTIVO"
        }
    }
)


module.exports = mongoose.model('Usuario', UsuarioSchema)