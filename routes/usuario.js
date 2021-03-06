var express = require('express');
var bycrypt = require('bcryptjs');

var mdAutenticacion =require('../middlewares/autenticacion');

var app = express();

var Usuarios= require('../models/usuario');

//=======================================
//Obtener todo los usuarios
//=============Rutas====================
app.get('/', (req, res, next)=>{

    var desde= req.query.desde || 0;
    desde=Number(desde);


    Usuarios.find({},'nombre email img role')
    .skip(desde)
    .limit(5)
    .exec(
        (err, usuarios)=>{
            if(err){
                return res.status(500).json({
                    ok:false,
                    mensaje:'Error cargando usuario',
                    errors:err
                });
            }

            Usuarios.count({},(err,conteo)=>{
                res.status(200).json({
                    ok:true,
                    usuarios:usuarios,
                    total:conteo
                });
            });
        });
});



//=================================================
//Actualizar usuario
//=================================================
app.put('/:id',mdAutenticacion.verificaToken,(req,res)=>{

    var id= req.params.id;
    var body = req.body;

    Usuarios.findById(id, (err,usuario)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje:'Error al buscar usuario',
                errors:err
            });
        }
        if(!usuario){
            return res.status(400).json({
                ok:false,
                mensaje:'El usuario con el id'+id+'no existe',
                errors:{message:'No existe usuario con ese ID'}
            });
        }

        usuario.nombre=body.nombre;
        usuario.email=body.email;
        usuario.role=body.role;

        usuario.save((err,usuarioGuardado)=>{
            if(err){
                return res.status(400).json({
                    ok:false,
                    mensaje:'Error al actualizar usuario',
                    errors:err
                });
            }
            usuarioGuardado.password=':)'
            res.status(200).json({
                ok:true,
                usuario:usuarioGuardado
            });
        });
    });

});
//=================================================
//Crear un nuevo usuario
//=================================================
app.post('/', mdAutenticacion.verificaToken ,(req, res, next)=>{
    var  body= req.body;
    var usuario= new Usuarios({
        nombre:body.nombre,
        email:body.email,
        password: bycrypt.hashSync(body.password,10),
        img:body.img,
        role:body.role
    });
    usuario.save((err,usuarioGuardado)=>{
        if(err){
            return res.status(400).json({
                ok:false,
                mensaje:'Error al crear usuario',
                errors:err
            });
        }
        res.status(201).json({
            ok:true,
            usuario:usuarioGuardado,
            usuariotoken:req.usuario
        });
    });
});


//=================================================
//  borra un usuario por el id
//=================================================
app.delete('/:id',mdAutenticacion.verificaToken,(req,res)=>{

    var id= req.params.id;

    Usuarios.findByIdAndRemove(id,(err, usuarioBorrado)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                mensaje:'Error borrar usuario',
                errors:err
            });
        }
        if(!usuarioBorrado){
            return res.status(400).json({
                ok:false,
                mensaje:'No existe ese usuario con ese id',
                errors:{ message:'No existe ese usuario con ese id' }
            });
        }
        res.status(200).json({
            ok:true,
            usuario:usuarioBorrado
        });
    });

});
module.exports = app;