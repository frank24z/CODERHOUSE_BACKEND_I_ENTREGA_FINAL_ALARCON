const express = require('express');
const { engine } = require('express-handlebars');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 8080;

//Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

//Importar rutas
const productsRoutes = require('./routes/products.routes');
const cartsRoutes = require('./routes/carts.routes');

app.use('/api/products', productsRoutes);
app.use('/api/carts', cartsRoutes);

//Ruta views normal
app.get('/', (req, res) => {
    const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf-8'));
    res.render('home', { products });
});

//Ruta views realtime
app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts');
});

//WebSockets
io.on('connection', (socket) => {
    console.log('Cliente conectado');

    socket.on('newProduct', (product) => {
        let products = JSON.parse(fs.readFileSync('./data/products.json', 'utf-8'));
        const newProduct = { id: products.length ? products[products.length - 1].id + 1 : 1, ...product };
        products.push(newProduct);
        fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2));
        io.emit('updateProducts', products);
    });

    socket.on('deleteProduct', (id) => {
        let products = JSON.parse(fs.readFileSync('./data/products.json', 'utf-8'));
        products = products.filter(p => p.id != id);
        fs.writeFileSync('./data/products.json', JSON.stringify(products, null, 2));
        io.emit('updateProducts', products);
    });
});

//Iniciar servidor
server.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}/realtimeproducts`));
