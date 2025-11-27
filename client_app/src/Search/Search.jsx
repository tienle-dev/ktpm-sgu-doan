import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import queryString from 'query-string'
import Product from '../API/Product';
import './Search.css'
import { Link } from 'react-router-dom';
import CartsLocal from '../Share/CartsLocal';
import { useDispatch, useSelector } from 'react-redux';
import { changeCount } from '../Redux/Action/ActionCount';

Search.propTypes = {

};

function Search(props) {

    const dispatch = useDispatch()
    const count_change = useSelector(state => state.Count.isLoad)
    const [showSuccess, setShowSuccess] = useState(false)

    const [products, set_products] = useState([])
    const [page, set_page] = useState(1)

    const [show_load, set_show_load] = useState(true)

    useEffect(() => {

        setTimeout(() => {

            const fetchData = async () => {

                const params = {
                    page: page,
                    count: '6',
                    search: sessionStorage.getItem('search')
                }

                const query = '?' + queryString.stringify(params)

                const response = await Product.get_search_list(query)

                if (response.length < 1) {
                    set_show_load(false)
                }

                set_products(prev => [...prev, ...response])

            }

            fetchData()

        }, 2500)

    }, [page])

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
        <>
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
            <div className="content-wraper pt-60 pb-60">
                <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="shop-top-bar">
                            <div className="product-select-box">
                                <div className="product-short">
                                    <p>Sort By:</p>
                                    <select className="nice-select">
                                        <option value="trending">Relevance</option>
                                        <option value="rating">Price (Low &gt; High)</option>
                                        <option value="rating">Price (High &gt; Low)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="shop-products-wrapper">
                            <div className="row">
                                <div className="col">
                                    <InfiniteScroll
                                        style={{ overflow: 'none' }}
                                        dataLength={products.length}
                                        next={() => set_page(page + 1)}
                                        hasMore={true}
                                        loader={show_load ? <div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                                            : <h4 className="text-center" style={{ paddingTop: '3rem', color: '#FED700' }}>Yay! You have seen it all</h4>}
                                    >
                                        {
                                            products && products.map(value => (
                                                <div className="row product-layout-list" key={value._id}>
                                                    <div className="col-lg-3 col-md-5 ">
                                                        <div className="product-image" style={{
                                                            position: 'relative',
                                                            filter: value.stock === 0 ? 'grayscale(80%)' : 'none',
                                                            opacity: value.stock === 0 ? 0.7 : 1
                                                        }}>
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
                                                                    backgroundColor: 'rgba(231, 76, 60, 0.9)',
                                                                    color: 'white',
                                                                    padding: '10px 20px',
                                                                    borderRadius: '8px',
                                                                    fontSize: '18px',
                                                                    fontWeight: 'bold',
                                                                    zIndex: 10,
                                                                    border: '2px solid #e74c3c'
                                                                }}>
                                                                    HẾT HÀNG
                                                                </div>
                                                            )}
                                                            <span className="sticker">Mới</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-5 col-md-7">
                                                        <div className="product_desc">
                                                            <div className="product_desc_info">
                                                                <div className="product-review">
                                                                    <h5 className="manufacturer">
                                                                        <a href="product-details.html">{value.name_product}</a>
                                                                    </h5>
                                                                    <div className="rating-box">
                                                                        <ul className="rating">
                                                                            <li><i className="fa fa-star" /></li>
                                                                            <li><i className="fa fa-star" /></li>
                                                                            <li><i className="fa fa-star" /></li>
                                                                            <li><i className="fa fa-star" /></li>
                                                                            <li><i className="fa fa-star" /></li>
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                                <h4><a className="product_name" href="product-details.html">{value.name_product}</a></h4>
                                                                <div style={{marginBottom: '8px', marginTop: '8px'}}>
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
                                                                <p>{value.describe || 'Sản phẩm chất lượng cao, đảm bảo hài lòng khách hàng.'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-4">
                                                        <div className="cart-quantity">
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
                                            ))
                                        }
                                    </InfiniteScroll>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {
                    products && products.map(value => (
                        <div className="modal fade modal-wrapper" key={value._id} id={value._id} >
                            <div className="modal-dialog modal-dialog-centered" role="document">
                                <div className="modal-content">
                                    <div className="modal-body">
                                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                        <div className="modal-inner-area row">
                                            <div className="col-lg-5 col-md-6 col-sm-6">
                                                <div className="product-details-left">
                                                    <div className="product-details-images slider-navigation-1">
                                                        <div className="lg-image">
                                                            <img src={value.image} alt="product image" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-lg-7 col-md-6 col-sm-6">
                                                <div className="product-details-view-content pt-60">
                                                    <div className="product-info">
                                                        <h2>{value.name_product}</h2>
                                                        <div className="rating-box pt-20">
                                                            <ul className="rating rating-with-review-item">
                                                                <li><i className="fa fa-star-o"></i></li>
                                                                <li><i className="fa fa-star-o"></i></li>
                                                                <li><i className="fa fa-star-o"></i></li>
                                                                <li className="no-star"><i className="fa fa-star-o"></i></li>
                                                                <li className="no-star"><i className="fa fa-star-o"></i></li>
                                                            </ul>
                                                        </div>
                                                        <div className="price-box pt-20">
                                                            <span className="new-price new-price-2">${value.price_product}</span>
                                                        </div>
                                                        <div className="product-desc">
                                                            <p>
                                                                <span>
                                                                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Veritatis reiciendis hic voluptatibus aperiam culpa ullam dolor esse error ducimus itaque ipsa facilis saepe rem veniam exercitationem quos magnam, odit perspiciatis.
                                                        </span>
                                                            </p>
                                                        </div>
                                                        <div className="single-add-to-cart">
                                                            <form action="#" className="cart-quantity">
                                                                <div className="quantity">
                                                                    <label>Quantity</label>
                                                                    <div className="cart-plus-minus">
                                                                        <input className="cart-plus-minus-box" value="1" type="text" />
                                                                        <div className="dec qtybutton"><i className="fa fa-angle-down"></i></div>
                                                                        <div className="inc qtybutton"><i className="fa fa-angle-up"></i></div>
                                                                    </div>
                                                                </div>
                                                                <button className="add-to-cart" type="submit">Add to cart</button>
                                                            </form>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                }

            </div>
            </div>
        </>
    )
}

export default Search;