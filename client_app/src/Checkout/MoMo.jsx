import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

MoMo.propTypes = {
    orderID: PropTypes.string,
    total: PropTypes.number,
}

MoMo.defaultProps = {
    orderID: '',
    total: 0,
}

function MoMo(props) {

    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false)
    const [called, setCalled] = useState(false) // Prevent multiple calls

    const { orderID, total } = props

    console.log('MoMo Component Mounted')
    console.log('MoMo orderID:', orderID)
    console.log('MoMo total:', total)

    useEffect(() => {
        // Chỉ gọi API khi có orderID và total hợp lệ, và chưa gọi
        if (!orderID || !total || total <= 0 || called) {
            console.log('Skipping MoMo API call - invalid params or already called')
            return
        }

        setCalled(true)
        setLoading(true)

        console.log('Calling MoMo API...')

        // Gọi API proxy từ backend (tránh CORS)
        const API_URL = process.env.REACT_APP_API_URL || process.env.LOCALHOST_URL;
        axios.post(`https://ktpm-sgu-doan-production.up.railway.app/api/Payment/momo/create`, {
            orderID: orderID,
            total: total
        })
        .then((response) => {
            console.log('MoMo Response:', response.data)
            setLoading(false)

            // Kiểm tra resultCode (0 = thành công)
            if (response.data.resultCode !== 0) {
                console.error('MoMo Error:', response.data.message)
                setError(true)
                setTimeout(() => {
                    setError(false)
                    setCalled(false) // Allow retry
                }, 3000)
            } else {
                // Kiểm tra payUrl có tồn tại không
                const payUrl = response.data.payUrl
                console.log('payUrl received:', payUrl)
                
                if (payUrl && payUrl !== 'null' && payUrl !== null && payUrl !== '') {
                    // Lưu orderId vào localStorage để xử lý sau khi redirect về
                    localStorage.setItem('momoOrderId', response.data.orderId || orderID)
                    localStorage.setItem('originalOrderId', orderID)
                    
                    console.log('Redirecting to:', payUrl)
                    window.location.href = payUrl
                } else {
                    console.error('payUrl is null or invalid:', payUrl)
                    setError(true)
                    setTimeout(() => {
                        setError(false)
                        setCalled(false)
                    }, 3000)
                }
            }
        })
        .catch(error => {
            console.error('MoMo API Error:', error);
            setLoading(false)
            setError(true)
            setTimeout(() => {
                setError(false)
                setCalled(false)
            }, 3000)
        })
    }, [orderID, total, called])

    return (
        <div>
            {
                loading &&
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div className="spinner-border text-danger" role="status">
                        <span className="sr-only">Đang xử lý...</span>
                    </div>
                    <p style={{ marginTop: '10px', color: '#666' }}>Đang kết nối với MoMo...</p>
                </div>
            }
            {
                error &&
                <div className="modal_success">
                    <div className="group_model_success pt-3">
                        <div className="text-center p-2">
                            <i className="fa fa-bell fix_icon_bell" style={{ fontSize: '40px', color: '#fff', backgroundColor: '#f84545' }}></i>
                        </div>
                        <h4 className="text-center p-3" style={{ color: '#fff' }}>Lỗi thanh toán MoMo! Vui lòng thử lại.</h4>
                    </div>
                </div>
            }
        </div>
    );
}

export default MoMo;