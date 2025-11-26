const Product = require('../../../Models/product')
const cloudinary = require('../../../config/cloudinary.config');

module.exports.index = async (req, res) => {
    let page = parseInt(req.query.page) || 1;
    const keyWordSearch = req.query.search;

    const perPage = parseInt(req.query.limit) || 8;
    const totalPage = Math.ceil(await Product.countDocuments() / perPage);

    let start = (page - 1) * perPage;
    let end = page * perPage;

    const products = await Product.find().populate('id_category');


    if (!keyWordSearch) {
        res.json({
            products: products.slice(start, end),
            totalPage: totalPage
        })

    } else {
        var newData = products.filter(value => {
            return value.name_product.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
                value.price_product.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1 ||
                value.id.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1
            // value.id_category.category.toUpperCase().indexOf(keyWordSearch.toUpperCase()) !== -1
        })

        res.json({
            products: newData.slice(start, end),
            totalPage: totalPage
        })
    }
}

module.exports.create = async (req, res) => {
    const product = await Product.find();

    const productFilter = product.filter((c) => {
        return c.name_product.toUpperCase() === req.body.name.toUpperCase().trim()
    });

    if (productFilter.length > 0) {
        res.json({ msg: 'Sản phẩm đã tồn tại' })
    } else {
        var newProduct = new Product()
        req.body.name = req.body.name.toLowerCase().replace(/^.|\s\S/g, a => { return a.toUpperCase() })

        newProduct.name_product = req.body.name
        newProduct.price_product = req.body.price
        newProduct.id_category = req.body.category
        newProduct.describe = req.body.description
        newProduct.gender = req.body.gender

        // --- THÊM DÒNG NÀY ---
        // Nhận 'number' từ frontend và lưu vào 'stock' của model
        newProduct.stock = req.body.number

        if (req.files && req.files.file) {
            try {
                const fileImage = req.files.file;

                // Chuyển buffer sang base64 data URI
                const base64Image = `data:${fileImage.mimetype};base64,${fileImage.data.toString('base64')}`;

                // Upload ảnh lên Cloudinary
                const result = await cloudinary.uploader.upload(base64Image, {
                    folder: 'products',
                    resource_type: 'auto'
                });

                newProduct.image = result.secure_url;
            } catch (error) {
                console.error('Cloudinary upload error:', error);
                newProduct.image = 'https://via.placeholder.com/300x300?text=No+Photo';
            }
        }
        else {
            newProduct.image = 'https://via.placeholder.com/300x300?text=No+Photo';
        }

        await newProduct.save();
        res.json({ msg: "Bạn đã thêm thành công" })
    }
}



module.exports.delete = async (req, res) => {
    const id = req.query.id;

    await Product.deleteOne({ _id: id }, (err) => {
        if (err) {
            res.json({ msg: err })
            return;
        }
        res.json({ msg: "Thanh Cong" })
    })

}

module.exports.details = async (req, res) => {
    const product = await Product.findOne({ _id: req.params.id });

    res.json(product)
}

module.exports.update = async (req, res) => {
    const product = await Product.find();

    const productFilter = product.filter((c) => {
        return c.name_product.toUpperCase() === req.body.name.toUpperCase().trim() && c.id !== req.body.id
    });

    if (productFilter.length > 0) {
        res.json({ msg: 'Sản phẩm đã tồn tại' })
    } else {
        req.body.name = req.body.name.toLowerCase().replace(/^.|\s\S/g, a => { return a.toUpperCase() })

        const updateData = {
            name_product: req.body.name,
            price_product: req.body.price,
            id_category: req.body.category,
            describe: req.body.description,
            gender: req.body.gender,
            // --- THÊM DÒNG NÀY ---
            // Cập nhật stock khi sửa sản phẩm
            stock: req.body.number
        };

        if (req.files && req.files.file) {
            try {
                const fileImage = req.files.file;

                // Chuyển buffer sang base64 data URI
                const base64Image = `data:${fileImage.mimetype};base64,${fileImage.data.toString('base64')}`;

                // Upload ảnh mới lên Cloudinary
                const result = await cloudinary.uploader.upload(base64Image, {
                    folder: 'products',
                    resource_type: 'auto'
                });

                updateData.image = result.secure_url;

                // Xóa ảnh cũ trên Cloudinary
                const oldProduct = await Product.findById(req.body.id);
                if (oldProduct.image && oldProduct.image.includes('cloudinary')) {
                    const urlParts = oldProduct.image.split('/');
                    const fileWithExt = urlParts[urlParts.length - 1];
                    const folder = urlParts.slice(urlParts.indexOf('upload') + 2, -1).join('/');
                    const publicId = `${folder}/${fileWithExt.split('.')[0]}`;
                    await cloudinary.uploader.destroy(publicId);
                }
            } catch (error) {
                console.error('Cloudinary upload error:', error);
            }
        }

        await Product.updateOne({ _id: req.body.id }, updateData);
        res.json({ msg: "Bạn đã update thành công" })
    }
}