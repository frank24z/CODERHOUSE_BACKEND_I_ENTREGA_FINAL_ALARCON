const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const productsFile = path.join(__dirname, '../data/products.json');

const readJSON = () => JSON.parse(fs.readFileSync(productsFile, 'utf-8'));
const writeJSON = (data) => fs.writeFileSync(productsFile, JSON.stringify(data, null, 2));

//Obtener productos
router.get('/', (req, res) => res.json(readJSON()));

//Obtener producto por ID
router.get('/:pid', (req, res) => {
    const product = readJSON().find(p => p.id == req.params.pid);
    product ? res.json(product) : res.status(404).json({ error: 'Producto no encontrado' });
});

//Agregar producto
router.post('/', (req, res) => {
    const products = readJSON();
    const newProduct = { id: products.length ? products[products.length - 1].id + 1 : 1, ...req.body };
    products.push(newProduct);
    writeJSON(products);
    req.app.get('io').emit('updateProducts', products);
    res.status(201).json(newProduct);
});

//Eliminar producto
router.delete('/:pid', (req, res) => {
    let products = readJSON();
    products = products.filter(p => p.id != req.params.pid);
    writeJSON(products);
    req.app.get('io').emit('updateProducts', products);
    res.json({ message: `Producto con ID ${req.params.pid} eliminado` });
});

module.exports = router;
