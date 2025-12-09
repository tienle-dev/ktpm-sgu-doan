var express = require('express');
var router = express.Router();

const CartController = require('../Controller/cart.controller');

// Lấy giỏ hàng của user
router.get('/:id_user', CartController.getCart);

// Lấy số lượng sản phẩm trong giỏ
router.get('/count/:id_user', CartController.getCartCount);

// Thêm sản phẩm vào giỏ hàng
router.post('/', CartController.addToCart);

// Đồng bộ giỏ hàng từ localStorage (khi đăng nhập)
router.post('/sync', CartController.syncCart);

// Cập nhật số lượng sản phẩm
router.put('/', CartController.updateCartItem);

// Xóa một sản phẩm khỏi giỏ
router.delete('/:id_user/:item_id', CartController.removeFromCart);

// Xóa toàn bộ giỏ hàng
router.delete('/clear/:id_user', CartController.clearCart);

module.exports = router;
