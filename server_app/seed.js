require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./Models/product');
const Category = require('./Models/category');

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('🔄 Seeding data...');

  // Xóa dữ liệu cũ
  await Product.deleteMany({});
  await Category.deleteMany({});

  // Category - Phân loại theo loại trang phục
  const categories = await Category.insertMany([
    { category: 'Áo' },
    { category: 'Quần' }
  ]);

  console.log('✓ Categories created:', categories.length);

  // Product - Sản phẩm với đầy đủ thuộc tính
  // Thuộc tính: id_category, name_product, price_product, image, describe, gender, stock
  await Product.insertMany([
    // NAM - ÁO
    {
      id_category: categories[0]._id.toString(),
      name_product: 'Áo Thun Nam Nike Pro',
      price_product: '450000',
      image: 'https://res.cloudinary.com/dofpzisn0/image/upload/v1732600000/products/ao-thun-nam-nike.jpg',
      describe: 'Áo thun thể thao nam chất liệu thoáng mát, thấm hút mồ hôi tốt',
      gender: 'male',
      stock: 50
    },
    {
      id_category: categories[0]._id.toString(),
      name_product: 'Áo Polo Nam Adidas',
      price_product: '550000',
      image: 'https://res.cloudinary.com/dofpzisn0/image/upload/v1732600001/products/ao-polo-nam-adidas.jpg',
      describe: 'Áo polo nam cao cấp, phong cách lịch lãm cho dân văn phòng',
      gender: 'male',
      stock: 30
    },
    {
      id_category: categories[0]._id.toString(),
      name_product: 'Áo Khoác Nam Puma',
      price_product: '890000',
      image: 'https://res.cloudinary.com/dofpzisn0/image/upload/v1732600002/products/ao-khoac-nam-puma.jpg',
      describe: 'Áo khoác thể thao nam chống nắng, chống gió - HẾT HÀNG',
      gender: 'male',
      stock: 0
    },
    
    // NAM - QUẦN
    {
      id_category: categories[1]._id.toString(),
      name_product: 'Quần Jogger Nam Nike',
      price_product: '650000',
      image: 'https://res.cloudinary.com/dofpzisn0/image/upload/v1732600003/products/quan-jogger-nam-nike.jpg',
      describe: 'Quần jogger nam thoải mái, dễ vận động, phù hợp tập luyện',
      gender: 'male',
      stock: 40
    },
    {
      id_category: categories[1]._id.toString(),
      name_product: 'Quần Short Nam Adidas',
      price_product: '380000',
      image: 'https://res.cloudinary.com/dofpzisn0/image/upload/v1732600004/products/quan-short-nam-adidas.jpg',
      describe: 'Quần short thể thao nam thoáng mát, phù hợp mùa hè',
      gender: 'male',
      stock: 60
    },
    {
      id_category: categories[1]._id.toString(),
      name_product: 'Quần Dài Nam Under Armour',
      price_product: '750000',
      image: 'https://res.cloudinary.com/dofpzisn0/image/upload/v1732600005/products/quan-dai-nam-ua.jpg',
      describe: 'Quần dài thể thao nam co giãn 4 chiều - HẾT HÀNG',
      gender: 'male',
      stock: 0
    },
    
    // NỮ - ÁO
    {
      id_category: categories[0]._id.toString(),
      name_product: 'Áo Thun Nữ Nike Dri-FIT',
      price_product: '480000',
      image: 'https://res.cloudinary.com/dofpzisn0/image/upload/v1732600006/products/ao-thun-nu-nike.jpg',
      describe: 'Áo thun thể thao nữ thấm hút mồ hôi, công nghệ Dri-FIT',
      gender: 'female',
      stock: 45
    },
    {
      id_category: categories[0]._id.toString(),
      name_product: 'Áo Croptop Nữ Adidas',
      price_product: '420000',
      image: 'https://res.cloudinary.com/dofpzisn0/image/upload/v1732600007/products/ao-croptop-nu-adidas.jpg',
      describe: 'Áo croptop nữ năng động, trẻ trung cho các bạn gái',
      gender: 'female',
      stock: 35
    },
    {
      id_category: categories[0]._id.toString(),
      name_product: 'Áo Tanktop Nữ Puma',
      price_product: '350000',
      image: 'https://res.cloudinary.com/dofpzisn0/image/upload/v1732600008/products/ao-tanktop-nu-puma.jpg',
      describe: 'Áo tanktop nữ tập gym, yoga - HẾT HÀNG',
      gender: 'female',
      stock: 0
    },
    
    // NỮ - QUẦN
    {
      id_category: categories[1]._id.toString(),
      name_product: 'Quần Legging Nữ Nike',
      price_product: '580000',
      image: 'https://res.cloudinary.com/dofpzisn0/image/upload/v1732600009/products/quan-legging-nu-nike.jpg',
      describe: 'Quần legging nữ tập yoga, gym co giãn tốt, ôm dáng',
      gender: 'female',
      stock: 55
    },
    {
      id_category: categories[1]._id.toString(),
      name_product: 'Quần Short Nữ Adidas',
      price_product: '390000',
      image: 'https://res.cloudinary.com/dofpzisn0/image/upload/v1732600010/products/quan-short-nu-adidas.jpg',
      describe: 'Quần short thể thao nữ thoải mái, phù hợp tập luyện',
      gender: 'female',
      stock: 50
    },
    {
      id_category: categories[1]._id.toString(),
      name_product: 'Quần Jogger Nữ Puma',
      price_product: '620000',
      image: 'https://res.cloudinary.com/dofpzisn0/image/upload/v1732600011/products/quan-jogger-nu-puma.jpg',
      describe: 'Quần jogger nữ phong cách thể thao - HẾT HÀNG',
      gender: 'female',
      stock: 0
    },
    
    // UNISEX - ÁO
    {
      id_category: categories[0]._id.toString(),
      name_product: 'Áo Thun Unisex Basic',
      price_product: '320000',
      image: 'https://res.cloudinary.com/dofpzisn0/image/upload/v1732600012/products/ao-thun-unisex-basic.jpg',
      describe: 'Áo thun unisex form rộng phong cách streetwear, phù hợp cả nam và nữ',
      gender: 'unisex',
      stock: 100
    },
    {
      id_category: categories[0]._id.toString(),
      name_product: 'Áo Hoodie Unisex',
      price_product: '680000',
      image: 'https://res.cloudinary.com/dofpzisn0/image/upload/v1732600013/products/ao-hoodie-unisex.jpg',
      describe: 'Áo hoodie unisex ấm áp, phong cách, phù hợp mùa đông',
      gender: 'unisex',
      stock: 70
    },
    {
      id_category: categories[0]._id.toString(),
      name_product: 'Áo Khoác Bomber Unisex',
      price_product: '850000',
      image: 'https://res.cloudinary.com/dofpzisn0/image/upload/v1732600014/products/ao-bomber-unisex.jpg',
      describe: 'Áo khoác bomber unisex thời trang, phong cách Hàn Quốc',
      gender: 'unisex',
      stock: 25
    },
    
    // UNISEX - QUẦN
    {
      id_category: categories[1]._id.toString(),
      name_product: 'Quần Jogger Unisex',
      price_product: '550000',
      image: 'https://res.cloudinary.com/dofpzisn0/image/upload/v1732600015/products/quan-jogger-unisex.jpg',
      describe: 'Quần jogger unisex phong cách năng động, thoải mái',
      gender: 'unisex',
      stock: 80
    },
    {
      id_category: categories[1]._id.toString(),
      name_product: 'Quần Jean Unisex',
      price_product: '720000',
      image: 'https://res.cloudinary.com/dofpzisn0/image/upload/v1732600016/products/quan-jean-unisex.jpg',
      describe: 'Quần jean unisex bền đẹp, form rộng phong cách streetwear',
      gender: 'unisex',
      stock: 60
    },
    {
      id_category: categories[1]._id.toString(),
      name_product: 'Quần Cargo Unisex',
      price_product: '650000',
      image: 'https://res.cloudinary.com/dofpzisn0/image/upload/v1732600017/products/quan-cargo-unisex.jpg',
      describe: 'Quần cargo unisex nhiều túi tiện dụng - HẾT HÀNG',
      gender: 'unisex',
      stock: 0
    }
  ]);

  console.log('✓ Products created: 18');
  console.log('   - Nam (male): 6 sản phẩm');
  console.log('   - Nữ (female): 6 sản phẩm');
  console.log('   - Unisex: 6 sản phẩm');
  console.log('   - Hết hàng (stock=0): 6 sản phẩm');

  console.log('\n🎉 Seeding complete!');
  mongoose.connection.close();
});
