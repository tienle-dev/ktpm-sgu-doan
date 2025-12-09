var mongoose = require('mongoose');

// Schema cho từng item trong giỏ hàng
var cartItemSchema = new mongoose.Schema(
    {
        id_product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Products',
            required: true
        },
        name_product: {
            type: String,
            required: true
        },
        price_product: {
            type: Number,
            required: true
        },
        count: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        image: {
            type: String
        },
        size: {
            type: String
        }
    },
    { _id: true }
);

// Schema chính cho giỏ hàng - mỗi user có một giỏ hàng
var cartSchema = new mongoose.Schema(
    {
        id_user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true,
            unique: true  // Đảm bảo mỗi user chỉ có một giỏ hàng
        },
        items: [cartItemSchema],  // Mảng các sản phẩm trong giỏ
        updated_at: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

// Middleware để cập nhật updated_at trước khi save
cartSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

var Carts = mongoose.model('Carts', cartSchema, 'cart');

module.exports = Carts;