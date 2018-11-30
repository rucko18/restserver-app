const express = require('express');

let { verificaToken } = require('../middlewares/autentificacion');

let app = express();

let Producto = require('../models/producto');


// ===================================
// MOSTRAR PRODUCTOS
// ===================================
app.get('/producto', verificaToken, (req, res) => {
    let desde = Number(req.query.desde) || 0;
    let limite = Number(req.query.limite) || 5;
    Producto.find({disponible: true})
        .skip(desde)
        .limit(limite)
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if(err){
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            });
        });
});

// ===================================
// MOSTRAR PRODUCTOS POR ID
// ===================================
app.get('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    
    Producto.findById(id)
    .populate('usuario', 'nombre email')
    .populate('categoria', 'descripcion')
    .exec((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

// ===================================
// CREAR UN NUEVO PRODUCTO
// ===================================

app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
    
    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i')
    
    Producto.find({nombre: regex})
            .populate('categoria', 'nombre')
            .exec((err, productos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                if (!productos) {
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
                res.json({
                    ok: true,
                    productos: productos
                });
            })
});




// ===================================
// CREAR UN NUEVO PRODUCTO
// ===================================

app.post('/producto', verificaToken, (req, res) => {
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            productos: productoDB
        });
    });
});

// ===================================
// ACTUALIZAR NOMBRE DE CATEGORIAS
// ===================================
app.put('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;


    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.descripcion = body.descripcion;
        productoDB.disponible = body.disponible;
        productoDB.categoria = body.categoria;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            return res.json({
                ok: true,
                producto: productoGuardado
            });
        });
        

    });
});


// ===================================
// ELIMINAR CATEGORIAS
// ===================================
app.delete('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;


    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        productoDB.disponible = false;

        productoDB.save((err, productoEliminado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            return res.json({
                ok: true,
                producto: productoEliminado,
                menssage: "Producto eliminado"
            });
        });


    });
});

module.exports = app;