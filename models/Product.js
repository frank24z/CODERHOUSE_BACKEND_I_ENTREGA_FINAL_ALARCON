const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  code: { type: String, unique: true, sparse: true },
  price: { type: Number, required: true },
  status: { type: Boolean, default: true },
  stock: { type: Number, default: 0 },
  category: { type: String, default: '' },
  thumbnails: [String]
});


productSchema.plugin(mongoosePaginate);

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
