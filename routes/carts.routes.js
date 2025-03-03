const express = require('express');
const fs = require('fs');

const router = express.Router();
const cartsFile = './data/carts.json';

const readJSON = () => JSON.parse(fs.readFileSync(cartsFile, 'utf-8'));
const writeJSON = (data) => fs.writeFileSync(cartsFile, JSON.stringify(data, null, 2));

//Crear un carrito
router.post('/', (req, res) => {
    const carts = readJSON();
    const newCart = { id: carts.length ? carts[carts.length - 1].id + 1 : 1, products: [] };
    carts.push(newCart);
    writeJSON(carts);
    res.status(201).json(newCart);
});

//Obtener un carrito
router.get('/:cid', (req, res) => {
    const cart = readJSON().find(c => c.id == req.params.cid);
    cart ? res.json(cart) : res.status(404).json({ error: 'Carrito no encontrado' });
});

//Agregar un producto al carrito
router.post('/:cid/product/:pid', (req, res) => {
    const carts = readJSON();
    const cart = carts.find(c => c.id == req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    const productIndex = cart.products.findIndex(p => p.product == req.params.pid);
    productIndex !== -1 ? cart.products[productIndex].quantity++ : cart.products.push({ product: req.params.pid, quantity: 1 });

    writeJSON(carts);
    res.json(cart);
});

module.exports = router;
