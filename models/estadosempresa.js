let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let EstadosEmpresaSchema = Schema(
    {
        fecha: {
            type: Date,
            default: Date.now
        },
        estado: {
            type: String,
            enum: ["ACTIVO", "BAJA", "ELIMINADO", "IMPAGO"],
            default: "ACTIVO"
        },
        gestor: {
            type: Schema.ObjectId
        }
    }
)

//let EstadosEmpresa =  mongoose.model('EstadosEmpresa', EstadosEmpresaSchema)
module.exports = mongoose.model('EstadosEmpresa', EstadosEmpresaSchema)
//module.exports = { EstadosEmpresaSchema, EstadosEmpresa}    