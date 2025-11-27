import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string'
import Product from '../../API/Product';
import { Link } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import SaleAPI from '../../API/SaleAPI';
import CartsLocal from '../../Share/CartsLocal';
import { useDispatch, useSelector } from 'react-redux';
import { changeCount } from '../../Redux/Action/ActionCount';

Home_Category.propTypes = {
    GET_id_modal: PropTypes.func
};

Home_Category.defaultProps = {
    GET_id_modal: null
}

function Home_Category(props) {

    const dispatch = useDispatch()
    const count_change = useSelector(state => state.Count.isLoad)
    const [showSuccess, setShowSuccess] = useState(false)

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

    // Lấy func từ component cha chuyển xuống
    const { GET_id_modal } = props

    const [product_category, set_product_category] = useState([])

    useEffect(() => {

        const fetchData = async () => {

            const response = await SaleAPI.getList()

            set_product_category(response)

        }

        fetchData()

    }, [])

    const handleAddToCart = (product) => {
        const discountedPrice = parseInt(product.id_product.price_product) - 
            ((parseInt(product.id_product.price_product) * parseInt(product.promotion)) / 100)
        
        const data = {
            id_cart: Math.random().toString(),
            id_product: product.id_product._id,
            name_product: product.id_product.name_product,
            price_product: discountedPrice,
            count: 1,
            image: product.id_product.image,
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
        <div className="product-area pt-60 pb-50">
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
            <div className="container">
                <Slider {...settings}>
                    {
                        product_category && product_category.map(value => (
                            <div className="col-lg-12 animate__animated animate__zoomIn col_product" style={{ zIndex: '999', height: '30rem' }} key={value._id}>
                                <div className="single-product-wrap" style={{
                                    opacity: value.id_product.stock === 0 ? 0.6 : 1,
                                    filter: value.id_product.stock === 0 ? 'grayscale(80%)' : 'none',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <div className="product-image" style={{position: 'relative'}}>
                                        <Link to={`/detail/${value.id_product._id}`}>
                                            <img src={value.id_product.image} alt="Li's Product Image" style={{
                                                filter: value.id_product.stock === 0 ? 'grayscale(100%)' : 'none'
                                            }} />
                                        </Link>
                                        {value.id_product.stock === 0 && (
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
                                        <span className="sticker">-{value.promotion}%</span>
                                    </div>
                                    <div className="product_desc">
                                        <div className="product_desc_info">
                                            <div className="product-review">
                                                <h5 className="manufacturer">
                                                    <a href="shop-left-sidebar.html">{value.id_product.name_product}</a>
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
                                                    backgroundColor: value.id_product.gender === 'male' ? '#3498db' : value.id_product.gender === 'female' ? '#e91e63' : '#9c27b0',
                                                    color: 'white'
                                                }}>
                                                    {value.id_product.gender === 'male' ? 'Nam' : value.id_product.gender === 'female' ? 'Nữ' : 'Unisex'}
                                                </span>
                                                {value.id_product.stock > 0 ? (
                                                    <span style={{
                                                        marginLeft: '8px',
                                                        fontSize: '12px',
                                                        color: value.id_product.stock < 10 ? '#e74c3c' : '#27ae60',
                                                        fontWeight: '500'
                                                    }}>
                                                        Còn {value.id_product.stock} sản phẩm
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
                                            <div className="d-flex justify-content-between price-box">
                                                <del className="new-price">{new Intl.NumberFormat('vi-VN',{style: 'decimal',decimal: 'VND'}).format(value.id_product.price_product)+ ' VNĐ'}</del>
                                                <span className="new-price" style={{ color: 'red' }}>
                                                    {new Intl.NumberFormat('vi-VN',{style: 'decimal',decimal: 'VND'})
                                                    .format(parseInt(value.id_product.price_product) - ((parseInt(value.id_product.price_product) * parseInt(value.promotion)) / 100)) + ' VNĐ'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="cart-quantity" style={{marginTop: '12px'}}>
                                            <a 
                                                href="#" 
                                                className="add-to-cart"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (value.id_product.stock > 0) {
                                                        console.log('Button clicked!', value);
                                                        handleAddToCart(value);
                                                    }
                                                }}
                                                style={{
                                                    pointerEvents: value.id_product.stock === 0 ? 'none' : 'auto',
                                                    opacity: value.id_product.stock === 0 ? 0.5 : 1,
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
        </div >
    );
}

export default Home_Category;