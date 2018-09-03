var express = require('express');
var bycrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED= require('../config/config').SEED;
var app = express();
var Usuarios= require('../models/usuario');

app.post('/',(req,res)=>{

    var body= req.body;

    Usuarios.findOne({email:body.email},(err,usuarioDB)=>{

        if(err){
            return res.status(500).json({
                ok:false,
                mensaje:'Error al buscar usuario',
                errors:err
            });
        }

        if(!usuarioDB){
            return res.status(400).json({
                ok:false,
                mensaje:'Credenciales incorrectass - email',
                errors:err
            });
        }

        if( !bycrypt.compareSync( body.password,usuarioDB.password)){
            return res.status(400).json({
                ok:false,
                mensaje:'Credenciales incorrectass - password',
                errors:err
            });
        }
        //crear un token
        usuarioDB.password=':)'
        var token = jwt.sign({ usuario:usuarioDB }, SEED,{ expiresIn:14400 });//4 horas

        res.status(200).json({
            ok:true,
            usuario:usuarioDB,
            token:token,
            id:usuarioDB._id
        });
    });
});

module.exports=app;