const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();


const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path')

app.use(fileUpload());

app.put('/upload/:tipo/:id', (req, res) => {
    let tipo = req.params.tipo;
    let id = req.params.id;
    if(!req.files){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se seleccionado ningun archivo'
            }
        });
    }


    // VALIDAR TIPO
    let tipoValidos = ['productos', 'usuarios'];
    
    if (tipoValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Tipo no Valido, Los tipos validos son: ' + tipoValidos.join(', ')
            }
        });
    }

    let archivo = req.files.archivo;
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1]; 


    //EXTENCIONES VALIDAS
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Archivo no Valido, Extensiones permitidas ' + extensionesValidas.join(', ')
            }
        });
    }

    // CAMBIAR NOMBRE DE ARCHIVO
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`

    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if( tipo == 'usuario'){
            imagenUsuario(id, res, nombreArchivo);
        } else {
            if(tipo == 'productos'){
                imagenProducto(id, res, nombreArchivo);
            }
        }
        
    });
});

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if(err){
            borrarArchivo(usuarioDB.img, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!usuarioDB){
            borrarArchivo(usuarioDB.img, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });
        }

        // let pathImagen = path.resolve(__dirname, `../../uploads/usuarios/${ usuarioDB.img }`);
        // if (fs.existsSync(pathImagen)) {
        //     fs.unlinkSync(pathImagen);
        // }

        borrarArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;

        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        });
    });

}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borrarArchivo(productoDB.img, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            borrarArchivo(productoDB.img, 'productos');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El Producti no existe'
                }
            });
        }

        // let pathImagen = path.resolve(__dirname, `../../uploads/usuarios/${ usuarioDB.img }`);
        // if (fs.existsSync(pathImagen)) {
        //     fs.unlinkSync(pathImagen);
        // }

        borrarArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;

        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            })
        });
    });
}

function borrarArchivo(nombreImagen, tipo){
     let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen }`);
     if (fs.existsSync(pathImagen)) {
         fs.unlinkSync(pathImagen);
     }

}
module.exports = app;