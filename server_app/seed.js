const mongoose = require('mongoose');
const Product = require('./Models/product');
const Category = require('./Models/category');
const Users = require('./Models/user');
const Payment = require('./Models/payment');
const Delivery = require('./Models/delivery');
const Permission = require('./Models/permission');
const Order = require('./Models/order');

// Kết nối Atlas
mongoose.connect('mongodb+srv://vinhmatlo432_db_user:vinhcucyeuqa3212@cluster0.cwhtyiw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Seeding data...');

  // Xóa dữ liệu cũ
  await Product.deleteMany({});
  await Category.deleteMany({});
  await Users.deleteMany({});
  await Payment.deleteMany({});
  await Delivery.deleteMany({});
  await Permission.deleteMany({});
  await Order.deleteMany({});

  // Category
  const categories = await Category.insertMany([
    { category: 'Shoes' },
    { category: 'Clothes' },
    { category: 'Accessories' }
  ]);

  // Product
  await Product.insertMany([
     {
        id_category: '68e9f9e5e7268d2654e25101',
        name_product: 'Nike Air Zoom',
        price_product: '150',
        image: 'http://localhost:8000/public/NikeAirZoom.jpg',
        describe: 'High performance running shoes',
        gender: 'men'
    },
    {
        id_category: '68e9f9e5e7268d2654e25101',
        name_product: 'Adidas Running Tee',
        price_product: '45',
        image: 'http://localhost:8000/public/ADDRunTee.jpg',
        describe: 'Lightweight T-shirt for men',
        gender: 'men'
    },

    // --- NỮ ---
    {
        id_category: '68e9f9e5e7268d2654e25102',
        name_product: 'Nike Air Max Women',
        price_product: '160',
        image: 'http://localhost:8000/public/NikeAirWomen.jpg',
        describe: 'Stylish and comfortable shoes for women',
        gender: 'women'
    },
    {
        id_category: '68e9f9e5e7268d2654e25102',
        name_product: 'Adidas Yoga Pants',
        price_product: '75',
        image: 'http://localhost:8000/public/YogaPants.jpg',
        describe: 'Flexible pants for yoga and fitness',
        gender: 'women'
    }
  ]);

  // Permission
  const permission = await Permission.create({ permission: 'user' });

  // User
  const user = await Users.create({
    id_permission: permission._id.toString(),
    username: 'john_doe',
    password: '123456',
    fullname: 'John Doe',
    gender: 'male',
    email: 'john@example.com',
    phone: '0123456789'
  });

  // Payment
  const payment = await Payment.create({ pay_name: 'COD' });

  // Delivery
  const delivery = await Delivery.create({
    id_delivery: 'DL01',
    from: 'Warehouse A',
    to: 'Ho Chi Minh City',
    distance: '20km',
    duration: '2 days',
    price: '5'
  });

  // Order
  await Order.create({
    id_user: user._id.toString(),
    id_payment: payment._id.toString(),
    id_note: delivery._id.toString(),
    address: '123 Le Loi, HCMC',
    total: 230,
    status: 'Pending',
    pay: false,
    feeship: 5,
    id_coupon: '',
    create_time: new Date().toISOString()
  });

  console.log('Seeding complete!');
  mongoose.connection.close();
});
