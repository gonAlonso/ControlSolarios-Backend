let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let OperarioSchema = Schema(
    {
        //_id: {type: Schema.ObjectId, auto:true},
        //empresa: {type: Schema.ObjectId, ref:'Empresa'},
        nombre: String,
        dni: String,
        pin: Number,
        fechaActualizacion: {
            type: Date,
            default: Date.now
        }
    }
)


module.exports = mongoose.model('Operario', OperarioSchema)