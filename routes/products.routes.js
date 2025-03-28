// routes/products.routes.js
const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// GET: listado de productos con paginación y filtros
router.get('/', async (req, res) => {
    const { limit = 10, page = 1, sort, query } = req.query;
    const options = {
        limit: parseInt(limit),
        page: parseInt(page),
        lean: true,
        sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {}
    };

    let filter = {};
    if (query) {
        // Si query es "true" o "false", filtramos por status; sino, por categoría
        if (query === 'true' || query === 'false') {
            filter.status = query === 'true';
        } else {
            filter.category = query;
        }
    }

    try {
        const result = await Product.paginate(filter, options);
        res.json({
            status: 'success',
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}` : null,
            nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}` : null
        });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

// GET producto por ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        product ? res.json(product) : res.status(404).json({ error: 'Producto no encontrado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST: crear producto
router.post('/', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: eliminar producto
router.delete('/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
