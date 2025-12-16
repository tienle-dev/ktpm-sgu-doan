import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Product from '../../API/Product';
import queryString from 'query-string'
import { Link } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CartsLocal from '../../Share/CartsLocal';
import { useDispatch, useSelector } from 'react-redux';
import { changeCount } from '../../Redux/Action/ActionCount';

Home_Product.propTypes = {
    gender: PropTypes.string,
    GET_id_modal: PropTypes.func,
    title: PropTypes.string,
    limit: PropTypes.number
};

Home_Product.defaultProps = {
    gender: '',
    GET_id_modal: null,
    title: 'Sản Phẩm',
    limit: 8
}

function Home_Product(props) {

    const { gender, GET_id_modal, title, limit } = props
    
    const dispatch = useDispatch()
    const count_change = useSelector(state => state.Count.isLoad)

    var settings = {
        dots: false,
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        pauseOnHover: true,
        initialSlide: 0,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    initialSlide: 2
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };


    const [products, set_products] = useState([])
    const [showSuccess, setShowSuccess] = useState(false)

    // Hàm này dùng gọi API trả lại dữ liệu product
    useEffect(() => {

        const fetchData = async () => {

            let response;
            if (gender === 'all') {
                response = await Product.Get_All_Product()
            } else {
                response = await Product.Get_Product_By_Gender(gender)
            }

            set_products(response.slice(0, limit))

        }

        fetchData()

    }, [gender, limit])

    const handleAddToCart = (product) => {
        const data = {
            id_cart: Math.random().toString(),
            id_product: product._id,
            name_product: product.name_product,
            price_product: product.price_product,
            count: 1,
            image: product.image,
            size: 'M',
        }

        CartsLocal.addProduct(data)
        
        const action_count_change = changeCount(count_change)
        dispatch(action_count_change)

        setShowSuccess(true)
        setTimeout(() => {
            setShowSuccess(false)
        }, 2000)
    }


    return (
        // col-lg-3 col-md-4 col-sm-6 mt-40 col_product
        <section className="product-area li-laptop-product pt-60 pb-45">
            <div className="container">
                {showSuccess && (
                    <div style={{
                        position: 'fixed',
                        top: '20px',
                        right: '20px',
                        backgroundColor: '#27ae60',
                        color: 'white',
                        padding: '15px 25px',
                        borderRadius: '8px',
                        zIndex: 9999,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                        <i className="fa fa-check-circle" style={{marginRight: '10px'}}></i>
                        Đã thêm sản phẩm vào giỏ hàng!
                    </div>
                )}
                <div className="row">
                    <div className="col-lg-12">
                        <div className="li-section-title">
                            <h2>
                                <span>{title}</span>
                            </h2>
                        </div>
                        <Slider {...settings}>
                            {
                                products && products.map(value => (
                                    <div className="col-lg-12 col_product" style={{ height: '30rem', position: 'relative' }} key={value._id}>
                                        <div className="single-product-wrap" style={{
                                            opacity: value.stock === 0 ? 0.6 : 1,
                                            filter: value.stock === 0 ? 'grayscale(80%)' : 'none',
                                            transition: 'all 0.3s ease',
                                            position: 'relative'
                                        }}>
                                            <div className="product-image" style={{position: 'relative'}}>
                                                <Link to={`/detail/${value._id}`}>
                                                    <img src={value.image} alt="Li's Product Image" style={{
                                                        filter: value.stock === 0 ? 'grayscale(100%)' : 'none'
                                                    }} />
                                                </Link>
                                                {value.stock === 0 && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: 'translate(-50%, -50%)',
                                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                        color: 'white',
                                                        padding: '8px 16px',
                                                        borderRadius: '8px',
                                                        fontSize: '16px',
                                                        fontWeight: 'bold',
                                                        zIndex: 10,
                                                        border: '2px solid #e74c3c'
                                                    }}>
                                                        HẾT HÀNG
                                                    </div>
                                                )}
                                                <span className="sticker">Mới</span>
                                            </div>
                                            <div className="product_desc">
                                                <div className="product_desc_info">
                                                    <div className="product-review">
                                                        <h5 className="manufacturer">
                                                            <a href={`/detail/${value._id}`}>{value.name_product}</a>
                                                        </h5>
                                                        <div className="rating-box">
                                                            <ul className="rating">
                                                                <li><i className="fa fa-star-o"></i></li>
                                                                <li><i className="fa fa-star-o"></i></li>
                                                                <li><i className="fa fa-star-o"></i></li>
                                                                <li className="no-star"><i className="fa fa-star-o"></i></li>
                                                                <li className="no-star"><i className="fa fa-star-o"></i></li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <div style={{marginBottom: '8px'}}>
                                                        <span style={{
                                                            display: 'inline-block',
                                                            padding: '3px 10px',
                                                            borderRadius: '12px',
                                                            fontSize: '12px',
                                                            fontWeight: '500',
                                                            backgroundColor: value.gender === 'male' ? '#3498db' : value.gender === 'female' ? '#e91e63' : '#9c27b0',
                                                            color: 'white'
                                                        }}>
                                                            {value.gender === 'male' ? 'Nam' : value.gender === 'female' ? 'Nữ' : 'Unisex'}
                                                        </span>
                                                        {value.stock > 0 ? (
                                                            <span style={{
                                                                marginLeft: '8px',
                                                                fontSize: '12px',
                                                                color: value.stock < 10 ? '#e74c3c' : '#27ae60',
                                                                fontWeight: '500'
                                                            }}>
                                                                Còn {value.stock} sản phẩm
                                                            </span>
                                                        ) : (
                                                            <span style={{
                                                                marginLeft: '8px',
                                                                fontSize: '12px',
                                                                color: '#e74c3c',
                                                                fontWeight: '600'
                                                            }}>
                                                                HẾT HÀNG
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="price-box">
                                                        <span className="new-price">{new Intl.NumberFormat('vi-VN',{style: 'decimal',decimal: 'VND'}).format(value.price_product)+ ' VNĐ'}</span>
                                                    </div>
                                                </div>
                                                <div className="cart-quantity" style={{marginTop: '10px'}}>
                                                    <a 
                                                        href="#" 
                                                        className="add-to-cart"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (value.stock > 0) {
                                                                console.log('Button clicked!', value);
                                                                handleAddToCart(value);
                                                            }
                                                        }}
                                                        style={{
                                                            pointerEvents: value.stock === 0 ? 'none' : 'auto',
                                                            opacity: value.stock === 0 ? 0.5 : 1,
                                                            display: 'block',
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        Thêm vào giỏ
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </Slider>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Home_Product;