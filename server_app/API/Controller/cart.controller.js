const Carts = require('../../Models/cart');
const Products = require('../../Models/product');
const mongoose = require('mongoose');

// Lấy giỏ hàng của user
module.exports.getCart = async (req, res) => {
    try {
        const id_user = req.params.id_user;

        if (!id_user) {
            return res.status(400).json({ msg: 'Thiếu id_user' });
        }

        // Tìm giỏ hàng của user
        let cart = await Carts.findOne({ id_user: id_user }).populate('items.id_product');

        if (!cart) {
            // Nếu chưa có giỏ hàng, trả về giỏ hàng rỗng
            return res.json({ id_user: id_user, items: [] });
        }

        res.json(cart);
    } catch (error) {
        console.error('Error getting cart:', error);
        res.status(500).json({ msg: 'Lỗi server', error: error.message });
    }
};

// Thêm sản phẩm vào giỏ hàng
module.exports.addToCart = async (req, res) => {
    try {
        const { id_user, id_product, name_product, price_product, count, image, size } = req.body;

        if (!id_user || !id_product) {
            return res.status(400).json({ msg: 'Thiếu thông tin bắt buộc' });
        }

        // Tìm hoặc tạo giỏ hàng cho user
        let cart = await Carts.findOne({ id_user: id_user });

        if (!cart) {
            // Tạo giỏ hàng mới nếu chưa có
            cart = new Carts({
                id_user: id_user,
                items: []
            });
        }

        // Kiểm tra sản phẩm đã có trong giỏ chưa (cùng id và size)
        const existingItemIndex = cart.items.findIndex(
            item => item.id_product.toString() === id_product && item.size === size
        );

        if (existingItemIndex > -1) {
            // Nếu đã có, cộng thêm số lượng
            cart.items[existingItemIndex].count += parseInt(count) || 1;
        } else {
            // Nếu chưa có, thêm mới
            cart.items.push({
                id_product: id_product,
                name_product: name_product,
                price_product: price_product,
                count: parseInt(count) || 1,
                image: image,
                size: size
            });
        }

        await cart.save();

        // Populate để trả về thông tin đầy đủ
        await cart.populate('items.id_product');

        res.json({ msg: 'Thêm vào giỏ hàng thành công', cart: cart });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ msg: 'Lỗi server', error: error.message });
    }
};

// Cập nhật số lượng sản phẩm trong giỏ
module.exports.updateCartItem = async (req, res) => {
    try {
        const { id_user, item_id, count } = req.body;

        if (!id_user || !item_id) {
            return res.status(400).json({ msg: 'Thiếu thông tin bắt buộc' });
        }

        const cart = await Carts.findOne({ id_user: id_user });

        if (!cart) {
            return res.status(404).json({ msg: 'Không tìm thấy giỏ hàng' });
        }

        // Tìm item trong giỏ
        const itemIndex = cart.items.findIndex(
            item => item._id.toString() === item_id
        );

        if (itemIndex === -1) {
            return res.status(404).json({ msg: 'Không tìm thấy sản phẩm trong giỏ' });
        }

        if (count <= 0) {
            // Nếu count <= 0, xóa sản phẩm khỏi giỏ
            cart.items.splice(itemIndex, 1);
        } else {
            // Cập nhật số lượng
            cart.items[itemIndex].count = parseInt(count);
        }

        await cart.save();
        await cart.populate('items.id_product');

        res.json({ msg: 'Cập nhật giỏ hàng thành công', cart: cart });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ msg: 'Lỗi server', error: error.message });
    }
};

// Xóa sản phẩm khỏi giỏ hàng
module.exports.removeFromCart = async (req, res) => {
    try {
        const id_user = req.params.id_user;
        const item_id = req.params.item_id;

        if (!id_user || !item_id) {
            return res.status(400).json({ msg: 'Thiếu thông tin bắt buộc' });
        }

        const cart = await Carts.findOne({ id_user: id_user });

        if (!cart) {
            return res.status(404).json({ msg: 'Không tìm thấy giỏ hàng' });
        }

        // Xóa item khỏi giỏ
        cart.items = cart.items.filter(item => item._id.toString() !== item_id);

        await cart.save();
        await cart.populate('items.id_product');

        res.json({ msg: 'Xóa sản phẩm thành công', cart: cart });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ msg: 'Lỗi server', error: error.message });
    }
};

// Xóa toàn bộ giỏ hàng
module.exports.clearCart = async (req, res) => {
    try {
        const id_user = req.params.id_user;

        if (!id_user) {
            return res.status(400).json({ msg: 'Thiếu id_user' });
        }

        const cart = await Carts.findOne({ id_user: id_user });

        if (!cart) {
            return res.status(404).json({ msg: 'Không tìm thấy giỏ hàng' });
        }

        cart.items = [];
        await cart.save();

        res.json({ msg: 'Đã xóa toàn bộ giỏ hàng', cart: cart });
    } catch (error) {
        console.error('Error clearing cart:', error);
        res.status(500).json({ msg: 'Lỗi server', error: error.message });
    }
};

// Đồng bộ giỏ hàng từ localStorage lên server (khi user đăng nhập)
module.exports.syncCart = async (req, res) => {
    try {
        const { id_user, items } = req.body;

        if (!id_user) {
            return res.status(400).json({ msg: 'Thiếu id_user' });
        }

        // Tìm hoặc tạo giỏ hàng
        let cart = await Carts.findOne({ id_user: id_user });

        if (!cart) {
            cart = new Carts({
                id_user: id_user,
                items: []
            });
        }

        // Merge items từ localStorage với items hiện có trên server
        if (items && Array.isArray(items)) {
            for (const newItem of items) {
                const existingIndex = cart.items.findIndex(
                    item => item.id_product.toString() === newItem.id_product && item.size === newItem.size
                );

                if (existingIndex > -1) {
                    // Cộng thêm số lượng nếu đã có
                    cart.items[existingIndex].count += parseInt(newItem.count) || 1;
                } else {
                    // Thêm mới nếu chưa có
                    cart.items.push({
                        id_product: newItem.id_product,
                        name_product: newItem.name_product,
                        price_product: newItem.price_product,
                        count: parseInt(newItem.count) || 1,
                        image: newItem.image,
                        size: newItem.size
                    });
                }
            }
        }

        await cart.save();
        await cart.populate('items.id_product');

        res.json({ msg: 'Đồng bộ giỏ hàng thành công', cart: cart });
    } catch (error) {
        console.error('Error syncing cart:', error);
        res.status(500).json({ msg: 'Lỗi server', error: error.message });
    }
};

// Lấy số lượng sản phẩm trong giỏ
module.exports.getCartCount = async (req, res) => {
    try {
        const id_user = req.params.id_user;

        if (!id_user) {
            return res.status(400).json({ msg: 'Thiếu id_user' });
        }

        const cart = await Carts.findOne({ id_user: id_user });

        if (!cart) {
            return res.json({ count: 0 });
        }

        const totalCount = cart.items.reduce((sum, item) => sum + item.count, 0);

        res.json({ count: totalCount });
    } catch (error) {
        console.error('Error getting cart count:', error);
        res.status(500).json({ msg: 'Lỗi server', error: error.message });
    }
};
