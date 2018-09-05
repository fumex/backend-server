var express = require('express');
var fileUpload = require('express-fileupload');
var fs=require('fs');

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

var app = express();

// default options
app.use(fileUpload());

//Rutas
app.put('/:tipo/:id', (req, res, next)=>{

    var tipo = req.params.tipo;
    var id=req.params.id;

    //tipos de coleccion
    var tiposValidos=['hospitales','medicos','usuarios'];
    if(tiposValidos.indexOf(tipo)<0){
        return res.status(400).json({
            ok:false,
            mensaje:'tipo de coleccion no es valida',
            errors:{message:'tipo de coleccion no es valida'}
        });
    }

    if(!req.files){
        return res.status(400).json({
            ok:false,
            mensaje:'No selecciono nada',
            errors:{message:'Debe de seleciona una imagen'}
        });
    }

    //obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo=nombreCortado[ nombreCortado.length - 1];

    //solo esta extensiones aceptamos
    var extensionesValidad=['png','jpg','gif','jpeg'];
    if( extensionesValidad.indexOf( extensionArchivo ) < 0){
        return res.status(500).json({
            ok:false,
            mensaje:'extension no valida',
            errors:{message:'Las extensiones validas son '+ extensionesValidad.join(', ') }
        });
    }
    // Nombre de archivo personalizado
    var nombreArchivo=`${id}-${new Date().getMilliseconds()}.${ extensionArchivo}`;

    //mover el archivo temporal a un path especifico
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path,err=>{
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje:'Error al mover archivo',
                errors:err
            });
        }

        subirPorTipo( tipo, id, nombreArchivo, res )

        
    })

});

function subirPorTipo( tipo, id, nombreArchivo, res ){
    if(tipo==='usuarios'){

        Usuario.findById(id,(err,usuario)=>{
            if(!usuario){
                return res.status(400).json({
                    ok:true,
                    mensaje:'Usuario no existe',
                    usuario: {message:'Usuario no existe'}
                }) 
            }
            //si existe elimina la imagen anterior
            var pathViejo='./uploads/usuarios/'+usuario.img;
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo);
            }

            usuario.img = nombreArchivo;
            usuario.save((err,usuarioActualizado)=>{

                usuarioActualizado.password=':)';

                return res.status(200).json({
                    ok:true,
                    mensaje:'imagen de usuario actualizada',
                    usuario: usuarioActualizado
                })
            });

        });

    }
    if(tipo==='medicos'){
        Medico.findById(id,(err,medico)=>{
            if(!medico){
                return res.status(400).json({
                    ok:true,
                    mensaje:'Medico no existe',
                    medico: {message:'Medico no existe'}
                }) 
            }
            //si existe elimina la imagen anterior
            var pathViejo='./uploads/medicos/'+ medico.img;
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo);
            }
            medico.img = nombreArchivo;
            medico.save((err,medicoActualizado)=>{

                return res.status(200).json({
                    ok:true,
                    mensaje:'imagen de medico actualizada',
                    medico: medicoActualizado
                })
            });

        });
    }
    if(tipo==='hospitales'){
        Hospital.findById(id,(err,hospital)=>{
            if(!hospital){
                return res.status(400).json({
                    ok:true,
                    mensaje:'Hispital no existe',
                    hospital: {message:'Hospital no existe'}
                }) 
            }
            //si existe elimina la imagen anterior
            var pathViejo='./uploads/hospitales/'+hospital.img;
            if(fs.existsSync(pathViejo)){
                fs.unlink(pathViejo);
            }

            hospital.img = nombreArchivo;
            hospital.save((err,hospitalActualizado)=>{

                return res.status(200).json({
                    ok:true,
                    mensaje:'imagen de hospital actualizada',
                    hospital: hospitalActualizado
                })
            });

        }); 
    }
}

module.exports = app;