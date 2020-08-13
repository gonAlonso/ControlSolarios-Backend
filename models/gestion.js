let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let GestionSchema = Schema(
    {
        _id: {type: Schema.ObjectId, auto:true},
        gestor: {type: Schema.ObjectId, ref:'Gestor'},
        accion: {
            tipo: {type: String},
            id: {type: Schema.ObjectId, ref:'Gestor'},
            accion: {type: String}
        },
        mensaje: {type: String},
        fecha: {
            type: Date,
            default: Date.now
        }
    }
)


module.exports = mongoose.model('Gestion', GestionSchema)