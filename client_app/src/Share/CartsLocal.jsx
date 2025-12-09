import CartAPI from '../API/CartAPI';

// Hàm lấy key giỏ hàng theo user
const getCartKey = () => {
    const userId = sessionStorage.getItem('id_user');
    return userId ? `carts_${userId}` : 'carts_guest';
}

// Hàm chuyển đổi cart items từ server format sang local format
const convertServerToLocal = (serverItems) => {
    return serverItems.map(item => ({
        id_cart: item._id,
        id_product: item.id_product._id || item.id_product,
        name_product: item.name_product,
        price_product: item.price_product,
        count: item.count,
        image: item.image,
        size: item.size
    }));
}

// Hàm chuyển đổi cart items từ local format sang server format
const convertLocalToServer = (localItems) => {
    return localItems.map(item => ({
        id_product: item.id_product,
        name_product: item.name_product,
        price_product: item.price_product,
        count: item.count,
        image: item.image,
        size: item.size
    }));
}

const CartsLocal = {

    // Đồng bộ giỏ hàng khi user đăng nhập
    syncWithServer: async (id_user) => {
        try {
            const guestCartKey = 'carts_guest';
            const userCartKey = `carts_${id_user}`;
            
            // Lấy giỏ hàng guest (nếu có)
            let guestCart = localStorage.getItem(guestCartKey);
            guestCart = guestCart ? JSON.parse(guestCart) : [];

            // Nếu có items trong guest cart, đồng bộ lên server
            if (guestCart.length > 0) {
                const serverItems = convertLocalToServer(guestCart);
                await CartAPI.Sync_Cart({ id_user, items: serverItems });
                // Xóa guest cart sau khi đồng bộ
                localStorage.removeItem(guestCartKey);
            }

            // Lấy giỏ hàng từ server
            const response = await CartAPI.Get_Cart(id_user);
            const serverCart = response.items || [];

            // Chuyển đổi và lưu vào localStorage
            const localCart = convertServerToLocal(serverCart);
            localStorage.setItem(userCartKey, JSON.stringify(localCart));

            return localCart;
        } catch (error) {
            console.error('Error syncing cart:', error);
            return [];
        }
    },

    // Lấy giỏ hàng từ server
    fetchFromServer: async (id_user) => {
        try {
            const response = await CartAPI.Get_Cart(id_user);
            const serverCart = response.items || [];
            const localCart = convertServerToLocal(serverCart);
            
            const userCartKey = `carts_${id_user}`;
            localStorage.setItem(userCartKey, JSON.stringify(localCart));
            
            return localCart;
        } catch (error) {
            console.error('Error fetching cart:', error);
            return [];
        }
    },

    addProduct: async (data) => {
        const data_add_cart = data;
        const id_user = sessionStorage.getItem('id_user');

        // Nếu đã đăng nhập, lưu lên server
        if (id_user) {
            try {
                const serverData = {
                    id_user: id_user,
                    id_product: data_add_cart.id_product,
                    name_product: data_add_cart.name_product,
                    price_product: data_add_cart.price_product,
                    count: data_add_cart.count,
                    image: data_add_cart.image,
                    size: data_add_cart.size
                };
                
                const response = await CartAPI.Add_To_Cart(serverData);
                
                // Cập nhật localStorage từ server response
                if (response.cart && response.cart.items) {
                    const localCart = convertServerToLocal(response.cart.items);
                    const cartKey = getCartKey();
                    localStorage.setItem(cartKey, JSON.stringify(localCart));
                }
                
                return response;
            } catch (error) {
                console.error('Error adding to cart:', error);
            }
        }

        // Nếu chưa đăng nhập, chỉ lưu local
        const cartKey = getCartKey();
        let add_cart = localStorage.getItem(cartKey);
        if (!add_cart) {
            add_cart = [];
        } else {
            add_cart = JSON.parse(add_cart);
        }

        if (add_cart.length < 1) {
            data_add_cart.id_cart = Date.now().toString();
            add_cart.push(data_add_cart);
            localStorage.setItem(cartKey, JSON.stringify(add_cart));
        } else {
            let flag = false;
            
            for (let i = 0; i < add_cart.length; i++) {
                if (add_cart[i].id_product === data_add_cart.id_product && 
                    add_cart[i].size === data_add_cart.size) {
                    add_cart[i].count = parseInt(add_cart[i].count) + parseInt(data_add_cart.count);
                    flag = true;
                    break;
                }
            }

            if (!flag) {
                data_add_cart.id_cart = Date.now().toString();
                add_cart.push(data_add_cart);
            }
            
            localStorage.setItem(cartKey, JSON.stringify(add_cart));
        }
    },

    deleteProduct: async (id_cart) => {
        const id_user = sessionStorage.getItem('id_user');
        const cartKey = getCartKey();
        
        // Xóa local trước
        const delete_cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        const indexDelete = delete_cart.findIndex(value => value.id_cart === id_cart);
        
        if (indexDelete > -1) {
            delete_cart.splice(indexDelete, 1);
            localStorage.setItem(cartKey, JSON.stringify(delete_cart));
        }

        // Nếu đã đăng nhập, xóa trên server
        if (id_user) {
            try {
                await CartAPI.Remove_From_Cart(id_user, id_cart);
            } catch (error) {
                console.error('Error removing from cart:', error);
            }
        }
    },

    updateProduct: async (data) => {
        const data_update_cart = data;
        const id_user = sessionStorage.getItem('id_user');
        const cartKey = getCartKey();
        
        // Cập nhật local trước
        const update_cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        const index = update_cart.findIndex(value => value.id_cart === data_update_cart.id_cart);

        if (index > -1) {
            update_cart[index].count = data_update_cart.count;
            localStorage.setItem(cartKey, JSON.stringify(update_cart));
        }

        // Nếu đã đăng nhập, cập nhật trên server
        if (id_user) {
            try {
                await CartAPI.Update_Cart_Item({
                    id_user: id_user,
                    item_id: data_update_cart.id_cart,
                    count: data_update_cart.count
                });
            } catch (error) {
                console.error('Error updating cart:', error);
            }
        }
    },

    clearCart: async () => {
        const id_user = sessionStorage.getItem('id_user');
        const cartKey = getCartKey();
        
        // Xóa local
        localStorage.setItem(cartKey, JSON.stringify([]));

        // Nếu đã đăng nhập, xóa trên server
        if (id_user) {
            try {
                await CartAPI.Clear_Cart(id_user);
            } catch (error) {
                console.error('Error clearing cart:', error);
            }
        }
    }
}

export { getCartKey, convertServerToLocal, convertLocalToServer }
export default CartsLocal