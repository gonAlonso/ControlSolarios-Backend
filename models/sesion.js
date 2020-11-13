let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let SesionSchema = Schema(
    {
        _id: {type: Schema.ObjectId, auto:true},
        empresa: {type: Schema.ObjectId, ref:'Empresa'},
        usuario: {type: Schema.ObjectId, ref:'Usuario'},
        solario: {type: Schema.ObjectId, ref:'Solario'},
        operario: {type: Schema.ObjectId, ref:'Operario'},
        energia: Number,
        duracion: Number,
        fecha: {
            type: Date,
            default: Date.now
        }
    }
)

module.exports = mongoose.model('Sesion', SesionSchema)