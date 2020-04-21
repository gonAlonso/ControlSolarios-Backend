let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let LoginSchema = Schema(
    {
        _id: {type: Schema.ObjectId, auto:true},
        email: String,
        password: String,
        tipo: {
            type: String,
            enum: ["INVITADO","USUARIO", "EMPRESA", "GESTOR", "ADMINISTRADOR", "ELIMINADO"],
            default: "INVITADO"
        },
        referencia: {type: Schema.ObjectId, ref: 'Datos'},
    }
)


module.exports = mongoose.model('Login', LoginSchema)