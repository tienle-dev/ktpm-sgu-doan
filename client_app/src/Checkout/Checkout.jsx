import React, { useEffect, useState } from 'react';
import io from "socket.io-client";

import './Checkout.css'
import OrderAPI from '../API/OrderAPI';
import Paypal from './Paypal';
import { useForm } from "react-hook-form";
import { Redirect } from 'react-router-dom';
import { changeCount } from '../Redux/Action/ActionCount';
import { useDispatch, useSelector } from 'react-redux';
import NoteAPI from '../API/NoteAPI';
import Detail_OrderAPI from '../API/Detail_OrderAPI';
import CouponAPI from '../API/CouponAPI';
import MoMo from './MoMo.jsx'

const socket = io('http://localhost:8000/', {
    transports: ['websocket'], jsonp: false
});
socket.connect();

Checkout.propTypes = {

};


function Checkout(props) {

    const [orderID, setOrderID] = useState('')

    const [carts, set_carts] = useState([])

    const [total_price, set_total_price] = useState(0)

    const [discount, set_discount] = useState(0)

    // state load_map - đã gộp chung nên không cần state này nữa
    // const [load_map, set_load_map] = useState(true)

    // state load_order - luôn hiển thị cả hai phần
    // const [load_order_status, set_load_order_status] = useState(false)

    const [check_action, set_check_action] = useState(false)

    // Load giỏ hàng khi component mount
    useEffect(() => {
        const cartsFromStorage = JSON.parse(localStorage.getItem('carts')) || []
        set_carts(cartsFromStorage)
        
        if (cartsFromStorage.length > 0) {
            Sum_Price(cartsFromStorage, 0)
        }
    }, [])

    useEffect(() => {

        if (check_action) {

            set_carts(JSON.parse(localStorage.getItem('carts')))

            Sum_Price(JSON.parse(localStorage.getItem('carts')), 0)

            set_check_action(false)
        }

    }, [check_action])

    // Hàm này dùng để tính tổng tiền
    function Sum_Price(carts, sum_price) {

        carts.map(value => {
            return sum_price += Number(value.count) * Number(value.price_product)
        })

        const total = Number(sum_price)

        if (localStorage.getItem('coupon')) {
            // GET localStorage
            const coupon = JSON.parse(localStorage.getItem('coupon'))

            set_discount((total * parseInt(coupon.promotion)) / 100)

            const newTotal = total - ((total * parseInt(coupon.promotion)) / 100) + Number(price)

            localStorage.setItem("total_price", newTotal)

            set_total_price(newTotal)
        } else {

            localStorage.setItem("total_price", total + Number(price))

            set_total_price(total + Number(price))

        }

    }

    const [show_error, set_show_error] = useState(false)

    const [information, set_information] = useState({
        fullname: '',
        phone: '',
        address: '',
        email: ''
    })

    const onChangeFullname = (e) => {
        set_information({
            fullname: e.target.value,
            phone: information.phone,
            address: information.address,
            email: information.email
        })
    }
    const onChangePhone = (e) => {
        set_information({
            fullname: information.fullname,
            phone: e.target.value,
            address: information.address,
            email: information.email
        })
    }

    const onChangeAddress = (e) => {
        set_information({
            fullname: information.fullname,
            phone: information.phone,
            address: e.target.value,
            email: information.email
        })
    }
    const onChangeEmail = (e) => {
        set_information({
            fullname: information.fullname,
            phone: information.phone,
            address: information.address,
            email: e.target.value
        })
    }

    // Hàm này dùng để check validation cho paypal
    useEffect(() => {

        checkValidation()

    }, [information])

    // Kiểm tra Paypal
    function checkValidation() {
        if (information.fullname === '') {
            set_show_error(true)
        } else {
            if (information.phone === '') {
                set_show_error(true)
            } else {
                if (information.email === '') {

                    localStorage.setItem('information', JSON.stringify(information))

                    set_show_error(true)
                } else {
                    set_show_error(false)
                }
            }
        }
    }


    const { register, handleSubmit, errors } = useForm();

    const [redirect, set_redirect] = useState(false)


    const [load_order, set_load_order] = useState(false)

    const count_change = useSelector(state => state.Count.isLoad)

    const dispatch = useDispatch()

    // Hàm này dùng để thanh toán offline
    const handler_Checkout = async (data) => {

        set_load_order(true)

        if (localStorage.getItem("id_coupon")) {

            const responseUpdate = await CouponAPI.updateCoupon(localStorage.getItem("id_coupon"))
            console.log(responseUpdate)

        }

        // data Delivery
        const data_delivery = {
            // id_delivery:  Math.random.toString(),
            fullname: information.fullname,
            phone: information.phone,
        }

        // Xứ lý API Delivery
        const response_delivery = await NoteAPI.post_note(data_delivery)

        // data Order
        const data_order = {
            id_user: sessionStorage.getItem('id_user'),
            address: information.address,
            total: total_price,
            status: "1",
            pay: false,
            id_payment: '6086709cdc52ab1ae999e882',
            id_note: response_delivery._id,
            feeship: price,
            id_coupon: localStorage.getItem('id_coupon') ? localStorage.getItem('id_coupon') : '',
            create_time: `${new Date().getDate()}/${parseInt(new Date().getMonth()) + 1}/${new Date().getFullYear()}`
        }

        // Xứ lý API Order
        const response_order = await OrderAPI.post_order(data_order)

        // data carts
        const data_carts = JSON.parse(localStorage.getItem('carts'))

        // Xử lý API Detail_Order
        for (let i = 0; i < data_carts.length; i++) {

            const data_detail_order = {
                id_order: response_order._id,
                id_product: data_carts[i].id_product,
                name_product: data_carts[i].name_product,
                price_product: data_carts[i].price_product,
                count: data_carts[i].count,
                size: data_carts[i].size
            }

            await Detail_OrderAPI.post_detail_order(data_detail_order)

        }

        // data email
        // const data_email = {
        //     id_order: response_order._id,
        //     total: total_price,
        //     fullname: information.fullname,
        //     phone: information.phone,
        //     price: price,
        //     address: information.address,
        //     email: information.email
        // }

        // Gửi socket lên server
        socket.emit('send_order', "Có người vừa đặt hàng")
        // Xử lý API Send Mail

        // const send_mail = await OrderAPI.post_email(data_email)
        // console.log(send_mail)

        localStorage.removeItem('information')
        localStorage.removeItem('total_price')
        localStorage.removeItem('price')
        localStorage.removeItem('id_coupon')
        localStorage.removeItem('coupon')
        localStorage.setItem('carts', JSON.stringify([]))

        set_redirect(true)


        // Hàm này dùng để load lại phần header bằng Redux
        const action_count_change = changeCount(count_change)
        dispatch(action_count_change)

    }

    const Change_Load_Order = (value) => {

        set_load_order(value)

    }


    //--------------- Xử lý Google API ------------------//

    const [error_address, set_error_address] = useState(false)

    const [from, set_from] = useState('155 Sư Vạn Hạnh, Phường 13, District 10, Ho Chi Minh City, Vietnam')

    // Khoảng cách
    const [distance, set_distance] = useState('')

    // Thời gian đi trong bn phút
    const [duration, set_duration] = useState('')

    // Giá tiền
    const [price, set_price] = useState('')


    // Kiểm tra xem khách hàng đã nhập chỉ nhận hàng hay chưa và tính phí ship
    const handler_CheckDistance = () => {

        if (!information.address) {
            set_error_address(true)
            return
        }

        // Sau khi mà đổ dữ liệu ở bên Jquery xong
        // thì qua bên này mình sẽ lấy những giá trị vừa xử lý

        const kilo = document.getElementById('in_kilo').innerHTML
        const duration_text = document.getElementById('duration_text').innerHTML
        const price_shipping = document.getElementById('price_shipping').innerHTML
        const to_places = document.getElementById('to_places').value

        console.log(kilo)
        console.log(duration_text)
        console.log(price_shipping)

        set_distance(kilo)
        set_duration(duration_text)

        localStorage.setItem('price', price_shipping)
        set_price(price_shipping)

        set_information({
            fullname: information.fullname,
            phone: information.phone,
            address: to_places,
            email: information.email
        })
        
        if (kilo) {
            set_check_action(true)
        }

    }

    const handlerMomo = () => {
        // Mở collapse trước
        const collapseElement = document.getElementById('collapseMomo');
        if (collapseElement && !collapseElement.classList.contains('show')) {
            window.$('#collapseMomo').collapse('show');
        }
        
        // Tạo orderID sau một chút để component được mount
        setTimeout(() => {
            setOrderID(Math.random().toString())
            console.log("Momo Thanh Cong")
        }, 100);
    }

    return (
        <div>

            {
                load_order && (
                    <div className="wrapper_loader">
                        <div className="loader"></div>
                    </div>
                )
            }

            <div className="breadcrumb-area">
                <div className="container">
                    <div className="breadcrumb-content">
                        <ul>
                            <li><a href="index.html">Trang chủ</a></li>
                            <li className="active">Thanh toán</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
                <div className="row">
                    {/* Cột trái: Thông tin người nhận */}
                    <div className="col-lg-6 col-12 pb-5">
                        <form onSubmit={handleSubmit(handler_Checkout)}>
                            {/* Thông tin người nhận */}
                            <div className="checkbox-form">
                                <h3>Thông tin người nhận</h3>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="checkout-form-list">
                                            <label>Họ và tên <span className="required">*</span></label>
                                            <input placeholder="Nhập họ tên" type="text" name="fullname"
                                                ref={register({ required: true })}
                                                value={information.fullname}
                                                onChange={onChangeFullname} />
                                            {errors.fullname && errors.fullname.type === "required" && <span style={{ color: 'red' }}>* Vui lòng nhập họ tên</span>}
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="checkout-form-list">
                                            <label>Số điện thoại <span className="required">*</span></label>
                                            <input placeholder="Nhập số điện thoại" type="text" name="phone"
                                                ref={register({ required: true })}
                                                value={information.phone}
                                                onChange={onChangePhone} />
                                            {errors.phone && errors.phone.type === "required" && <span style={{ color: 'red' }}>* Vui lòng nhập số điện thoại</span>}
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="checkout-form-list">
                                            <label>Email <span className="required">*</span></label>
                                            <input placeholder="Nhập email" type="email" name="email"
                                                ref={register({ required: true })}
                                                value={information.email}
                                                onChange={onChangeEmail} />
                                            {errors.email && errors.email.type === "required" && <span style={{ color: 'red' }}>* Vui lòng nhập email</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Địa chỉ nhận hàng */}
                            <div className="checkbox-form" style={{ marginTop: '2rem' }}>
                                <h3>Địa chỉ nhận hàng</h3>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="checkout-form-list">
                                            <label>Gửi từ <span className="required">*</span></label>
                                            <input type="text" name="from"
                                                id="from_places"
                                                disabled
                                                value={from}
                                                style={{ backgroundColor: '#f5f5f5' }} />
                                            <input id="origin" name="origin" type="hidden" value={from} />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="checkout-form-list">
                                            <label>Địa chỉ giao hàng <span className="required">*</span></label>
                                            <input type="text"
                                                id="to_places"
                                                placeholder="Nhập địa chỉ giao hàng"
                                                name="address"
                                                ref={register({ required: true })}
                                                value={information.address}
                                                onChange={onChangeAddress} />
                                            {errors.address && errors.address.type === "required" && <span style={{ color: 'red' }}>* Vui lòng nhập địa chỉ</span>}
                                            {error_address && <span style={{ color: 'red' }}>* Vui lòng nhập địa chỉ</span>}
                                            <input id="destination" type="hidden" name="destination" />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="checkout-form-list">
                                            <label>Phương tiện vận chuyển</label>
                                            <select id="travel_mode" name="travel_mode" className="form-control">
                                                <option value="DRIVING">Xe máy/Ô tô</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    {/* Hiển thị kết quả tính phí */}
                                    {distance && (
                                        <div className="col-md-12">
                                            <div style={{ 
                                                padding: '15px', 
                                                backgroundColor: '#f8f9fa', 
                                                borderRadius: '5px',
                                                marginBottom: '15px'
                                            }}>
                                                <div style={{ marginBottom: '8px' }}>
                                                    <strong>Khoảng cách:</strong> {distance}
                                                </div>
                                                <div style={{ marginBottom: '8px' }}>
                                                    <strong>Thời gian:</strong> {duration}
                                                </div>
                                                <div>
                                                    <strong>Phí vận chuyển:</strong> <span style={{ color: '#e74c3c', fontSize: '18px' }}>{new Intl.NumberFormat('vi-VN').format(price)} VNĐ</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Hidden fields cho jQuery xử lý */}
                                    <div id="result" className="hide">
                                        <div><label id="in_kilo"></label></div>
                                        <div><label id="duration_text"></label></div>
                                        <div><label id="price_shipping"></label></div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="order-button-payment">
                                            <input value="Tính phí vận chuyển" type="button" id="distance_form" 
                                                style={{ width: '100%', backgroundColor: '#3498db' }} />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="order-button-payment">
                                            {redirect && <Redirect to="/success" />}
                                            <input value="Đặt hàng" type="submit" 
                                                style={{ width: '100%', backgroundColor: '#27ae60' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Cột phải: Đơn hàng */}
                    <div className="col-lg-6 col-12">
                        {/* Đơn hàng */}
                        <div className="your-order">
                            <h3>Đơn hàng của bạn</h3>
                            <div className="your-order-table table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th className="cart-product-name" style={{ width: '60%' }}>Sản phẩm</th>
                                            <th className="cart-product-total" style={{ textAlign: 'right' }}>Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            carts && carts.map(value => (
                                                <tr className="cart_item" key={value._id}>
                                                    <td className="cart-product-name">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            {(value.image || value.img1) && (
                                                                <img 
                                                                    src={value.image || value.img1 || `https://localhost:8000/${value.image}`} 
                                                                    alt={value.name_product}
                                                                    style={{ 
                                                                        width: '60px', 
                                                                        height: '60px', 
                                                                        objectFit: 'cover',
                                                                        borderRadius: '5px',
                                                                        border: '1px solid #ddd'
                                                                    }} 
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none'
                                                                    }}
                                                                />
                                                            )}
                                                            <div>
                                                                <div>{value.name_product}</div>
                                                                <strong className="product-quantity" style={{ fontSize: '13px', color: '#666' }}>Số lượng: {value.count}</strong>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="cart-product-total" style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                                                        <span className="amount">
                                                            {new Intl.NumberFormat('vi-VN').format(parseInt(value.price_product) * parseInt(value.count))} VNĐ
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                    <tfoot>
                                        <tr className="cart-subtotal">
                                            <th>Phí vận chuyển</th>
                                            <td style={{ textAlign: 'right' }}><span className="amount">{new Intl.NumberFormat('vi-VN').format(price || 0)} VNĐ</span></td>
                                        </tr>
                                        <tr className="cart-subtotal">
                                            <th>Giảm giá</th>
                                            <td style={{ textAlign: 'right' }}><span className="amount" style={{ color: '#27ae60' }}>-{new Intl.NumberFormat('vi-VN').format(discount || 0)} VNĐ</span></td>
                                        </tr>
                                        <tr className="order-total">
                                            <th>Tổng cộng</th>
                                            <td style={{ textAlign: 'right' }}><strong><span className="amount" style={{ color: '#e74c3c', fontSize: '20px' }}>{new Intl.NumberFormat('vi-VN').format(total_price || 0)} VNĐ</span></strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            
                            {/* Phương thức thanh toán */}
                            <div className="payment-method">
                                <h4 style={{ marginBottom: '15px' }}>Phương thức thanh toán</h4>
                                <div className="payment-accordion">
                                    <div id="accordion">
                                        {/* Thanh toán khi nhận hàng */}
                                        <div className="card" style={{ marginBottom: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                                            <div className="card-header" style={{ backgroundColor: '#fff', padding: '12px 15px', border: 'none' }}>
                                                <h5 className="panel-title mb-0">
                                                    <span style={{ fontWeight: 'normal', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <span style={{ fontSize: '20px' }}>💵</span>
                                                        <span>Thanh toán khi nhận hàng (COD)</span>
                                                    </span>
                                                </h5>
                                            </div>
                                        </div>

                                        <div className="card" style={{ marginTop: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                                            <div className="card-header" style={{ backgroundColor: '#fff', padding: '12px 15px', border: 'none', cursor: 'pointer' }} data-toggle="collapse" data-target="#collapseMomo">
                                                <h5 className="panel-title mb-0">
                                                    <span style={{ fontWeight: 'normal', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <img 
                                                            src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-MoMo-Square.png"
                                                            alt="MoMo" 
                                                            style={{ width: '24px', height: '24px', borderRadius: '4px' }}
                                                        />
                                                        <span>MoMo</span>
                                                    </span>
                                                </h5>
                                            </div>
                                            <div id="collapseMomo" className="collapse">
                                                <div className="card-body" style={{ textAlign: 'center', padding: '20px' }}>
                                                    {
                                                        show_error ? <p style={{ color: '#e74c3c' }}>Vui lòng kiểm tra lại thông tin!</p> :
                                                            <div>
                                                                <img 
                                                                    src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Icon-MoMo-Square.png" 
                                                                    width="80" 
                                                                    onClick={handlerMomo}
                                                                    alt="MoMo"
                                                                    style={{ cursor: 'pointer', borderRadius: '8px', marginBottom: '10px' }} 
                                                                />
                                                                <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Nhấn vào logo để thanh toán qua MoMo</p>
                                                                {orderID && (
                                                                    <MoMo
                                                                        orderID={orderID}
                                                                        total={total_price}
                                                                    />
                                                                )}
                                                            </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}

export default Checkout;