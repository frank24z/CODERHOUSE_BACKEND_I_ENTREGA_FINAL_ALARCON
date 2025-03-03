const socket = io();

const productList = document.getElementById('productList');
const productForm = document.getElementById('productForm');
const deleteButton = document.getElementById('deleteButton');
const deleteId = document.getElementById('deleteId');

socket.on('updateProducts', (products) => {
    productList.innerHTML = '';
    products.forEach(product => {
        productList.innerHTML += `<li>${product.title} - $${product.price} (ID: ${product.id})</li>`;
    });
});

productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newProduct = {
        title: e.target.title.value,
        price: Number(e.target.price.value),
    };
    socket.emit('newProduct', newProduct);
    e.target.reset();
});

deleteButton.addEventListener('click', () => {
    const id = Number(deleteId.value);
    if (id) {
        socket.emit('deleteProduct', id);
        deleteId.value = '';
    }
});
