let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let PuntuacionSchema = Schema(
    {
        _id: {type: Schema.ObjectId, auto:true},
        puntuacion: Number,
        date: Date,
        usuario: {type: Schema.ObjectId, ref:'User'}
    }
)


module.exports = mongoose.model('Score', PuntuacionSchema)