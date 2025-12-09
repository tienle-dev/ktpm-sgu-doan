import axiosClient from './axiosClient'

const CartAPI = {

    // Lấy giỏ hàng của user
    Get_Cart: (id_user) => {
        const url = `/api/Cart/${id_user}`
        return axiosClient.get(url)
    },

    // Lấy số lượng sản phẩm trong giỏ
    Get_Cart_Count: (id_user) => {
        const url = `/api/Cart/count/${id_user}`
        return axiosClient.get(url)
    },

    // Thêm sản phẩm vào giỏ hàng
    Add_To_Cart: (data) => {
        const url = '/api/Cart'
        return axiosClient.post(url, data)
    },

    // Đồng bộ giỏ hàng từ localStorage khi đăng nhập
    Sync_Cart: (data) => {
        const url = '/api/Cart/sync'
        return axiosClient.post(url, data)
    },

    // Cập nhật số lượng sản phẩm
    Update_Cart_Item: (data) => {
        const url = '/api/Cart'
        return axiosClient.put(url, data)
    },

    // Xóa sản phẩm khỏi giỏ hàng
    Remove_From_Cart: (id_user, item_id) => {
        const url = `/api/Cart/${id_user}/${item_id}`
        return axiosClient.delete(url)
    },

    // Xóa toàn bộ giỏ hàng
    Clear_Cart: (id_user) => {
        const url = `/api/Cart/clear/${id_user}`
        return axiosClient.delete(url)
    }

}

export default CartAPI