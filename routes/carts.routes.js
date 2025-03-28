const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product'); 

const router = express.Router();

//Crear un carrito
router.post('/', async (req, res) => {
    try {
        const newCart = new Cart({ products: [] });
        await newCart.save();
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Obtener carrito 
router.get('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).populate('products.product');
        cart ? res.json(cart) : res.status(404).json({ error: 'Carrito no encontrado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Agregar producto al carrito y descontar stock
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid);
        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

        //Buscar el producto en mongo
        const product = await Product.findById(req.params.pid);
        if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

        //Verificar stock disponible
        if (product.stock < 1) {
            return res.status(400).json({ error: 'No hay stock suficiente para este producto' });
        }

        //Descontar stock del producto
        product.stock -= 1;
        await product.save();

        //Agregar el producto en el carrito
        const productIndex = cart.products.findIndex(p => p.product.toString() === req.params.pid);
        if (productIndex !== -1) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({ product: req.params.pid, quantity: 1 });
        }
        await cart.save();
        res.json({ message: 'Producto agregado al carrito y stock actualizado', cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Eliminar producto del carrito y sumar stock
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid);
        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

        //Buscar el producto en el carrito
        const productInCart = cart.products.find(p => p.product.toString() === req.params.pid);
        if (!productInCart) {
            return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
        }

        //Buscar el producto para restaurar el stock
        const product = await Product.findById(req.params.pid);
        if (product) {
            product.stock += productInCart.quantity;
            await product.save();
        }

        //Borrar el producto del carrito
        cart.products = cart.products.filter(p => p.product.toString() !== req.params.pid);
        await cart.save();

        res.json({ message: 'Producto eliminado del carrito y stock restaurado', cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Cambiar todo los productos del carrito
router.put('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid);
        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

        cart.products = req.body.products;
        await cart.save();
        res.json({ message: 'Carrito actualizado completamente', cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid);
        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

        const productInCart = cart.products.find(p => p.product.toString() === req.params.pid);
        if (!productInCart) return res.status(404).json({ error: 'Producto no encontrado en el carrito' });

        //Calcular diferencia de stock
        const newQuantity = req.body.quantity;
        const diff = newQuantity - productInCart.quantity;

        const product = await Product.findById(req.params.pid);
        if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

        if (diff > 0) {
            if (product.stock < diff) {
                return res.status(400).json({ error: 'No hay suficiente stock para aumentar la cantidad' });
            }
            product.stock -= diff;
        } else if (diff < 0) {
            product.stock += Math.abs(diff);
        }
        await product.save();

        //Actualizar cantidad en el carrito
        productInCart.quantity = newQuantity;
        await cart.save();
        res.json({ message: 'Cantidad actualizada y stock ajustado', cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Vaciar carrito y restaurar stock de todos los productos
router.delete('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid);
        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

        //Restaurar stock para cada producto en el carrito
        for (const item of cart.products) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }

        cart.products = [];
        await cart.save();
        res.json({ message: 'Carrito vaciado y stock restaurado', cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
