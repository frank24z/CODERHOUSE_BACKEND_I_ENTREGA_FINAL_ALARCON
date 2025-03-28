// server.js
const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io'); // Si no usas websockets, omítelo
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Si no usas websockets, omítelo
const PORT = process.env.PORT || 8080;

// Conectar a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🟢 Conectado a MongoDB Atlas"))
  .catch(err => console.error("🔴 Error al conectar a MongoDB:", err));

// Configurar Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de API
const productsRoutes = require('./routes/products.routes');
const cartsRoutes = require('./routes/carts.routes');
app.use('/api/products', productsRoutes);
app.use('/api/carts', cartsRoutes);

// Rutas de vistas
app.get('/', (req, res) => {
  // Home con botones "Ver Productos" y "Ver mi Carrito"
  res.render('home');
});

// Vista de productos
app.get('/products', async (req, res) => {
  const Product = require('./models/Product');
  const products = await Product.find().lean();
  res.render('products', { products });
});

// Vista de carrito
app.get('/carts/:cid', async (req, res) => {
  const Cart = require('./models/Cart');
  try {
    const cart = await Cart.findById(req.params.cid)
      .populate('products.product')
      .lean();
    if (!cart) return res.status(404).send('Carrito no encontrado');
    res.render('cart', { cart });
  } catch (err) {
    res.status(500).send('Error al obtener el carrito');
  }
});

// WebSockets (opcional) ...
// io.on('connection', ...);

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
