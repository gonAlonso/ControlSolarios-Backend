
var Puntuacion = require('../models/puntuacion')

async function getAll(req,res) {
    //callbacks
   /* Puntuacion.find({}).exec( (err, puntuaciones)=>{
        if(err){
            res.status(500).send({accion:'get all', mensaje:'error al obtener la puntuacion'})
        }else{
            res.status(200).send({accion:'get all', datos: puntuaciones})
        }
    })*/
    // promesas 
    /*Puntuacion.find().exec()
        .then(puntuaciones => res.status(200).send({accion:'get all', datos: puntuaciones}) )
        .catch(err => res.status(500).send({accion:'get all', mensaje:'error al obtener la puntuacion'}) )
    */
   // async await
    try{
        let puntuaciones = await Puntuacion.find();
        res.status(200).json({accion:'get all', datos: puntuaciones}) 
    }catch(err){
        res.status(500).json({accion:'get all', mensaje:'error al obtener las puntuaciones'}) 
    }

}



async function getById(req,res) {
    let puntuacionId = req.params.id;

    try{
        let puntuacion = await Puntuacion.findById(puntuacionId);
        res.status(200).json({accion:'get one', datos: puntuacion}) 
    }catch(err){
        res.status(500).json({accion:'get one', mensaje:'error al obtener la puntuacion'}) 
    }

   
}




async function insert(req, res){
   /* var datos = req.body;

    var puntuacion = new Puntuacion();
    puntuacion.nombre = datos.nombre;
    puntuacion.puntuacion = datos.puntuacion;*/
    const puntuacion = new Puntuacion(req.body)
    try{
        let puntuacionGuardada = await puntuacion.save();
        res.status(200).json({accion:'save', datos: puntuacionGuardada}) 
    }catch(err){
        res.status(500).json({accion:'save', mensaje:'error al guardar la puntuacion'}) 
    }
   
}

async function remove(req,res){
    let puntuacionId = req.params.id;
    try{
        let puntuacionBorrada = await Puntuacion.findByIdAndDelete(puntuacionId);
        res.status(200).json({accion:'delete', datos: puntuacionBorrada}) 
    }catch(err){
        res.status(500).json({accion:'delete', mensaje:'error al borrar la puntuacion'}) 
    }
  
}

async function update (req,res){
    var datos = req.body;
    let puntuacionId = req.params.id;

    try{
        let puntuacionActualizada = await Puntuacion.findByIdAndUpdate(puntuacionId, datos);
        res.status(200).json({accion:'update', datos: puntuacionActualizada}) 
    }catch(err){
        res.status(500).json({accion:'update', mensaje:'error al actualizar la puntuacion'}) 
    }

}

module.exports = {getAll, getById, insert, remove, update }