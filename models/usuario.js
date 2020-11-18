let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let Bono = require('./bono').schema

let UsuarioSchema = Schema(
    {
        _id: {type: Schema.ObjectId, auto:true},
        empresa: {type: Schema.ObjectId, ref:'Empresa'},
        nombre: String,
        dni: String,
        email: String,
        tlf: Number,
        fototipo: String,
        fechaRegistro: {
            type: Date,
            default: Date.now
        },
        estado: {
            type: String,
            enum: ["PENDIENTE","ACTIVO", "BAJA", "ELIMINADO", "IMPAGO"],
            default: "PENDIENTE"
        },
        //bonos : [Bono]
        bono: {type: Bono, default: null}
    }
)


module.exports = mongoose.model('Usuario', UsuarioSchema)