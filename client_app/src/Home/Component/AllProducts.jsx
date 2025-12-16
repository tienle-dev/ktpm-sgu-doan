import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Product from '../../API/Product';
import CategoryAPI from '../../API/CategoryAPI';
import { Link } from 'react-router-dom';
import CartsLocal from '../../Share/CartsLocal';
import { useDispatch, useSelector } from 'react-redux';
import { changeCount } from '../../Redux/Action/ActionCount';

AllProducts.propTypes = {
    GET_id_modal: PropTypes.func
};

AllProducts.defaultProps = {
    GET_id_modal: null
}

function AllProducts(props) {

    const { GET_id_modal } = props
    
    const dispatch = useDispatch()
    const count_change = useSelector(state => state.Count.isLoad)

    const [allProducts, setAllProducts] = useState([])
    const [filteredProducts, setFilteredProducts] = useState([])
    const [selectedGender, setSelectedGender] = useState('all')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [categories, setCategories] = useState([])
    const [showSuccess, setShowSuccess] = useState(false)

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1)
    const productsPerPage = 6 // 2 hàng x 3 sản phẩm

    // Lấy tất cả sản phẩm và categories khi component mount
    useEffect(() => {
        const fetchData = async () => {
            const [productsResponse, categoriesResponse] = await Promise.all([
                Product.Get_All_Product(),
                CategoryAPI.Get_All_Category()
            ])
            setAllProducts(productsResponse)
            setFilteredProducts(productsResponse)
            setCategories(categoriesResponse)
        }
        fetchData()
    }, [])

    // Hàm lọc sản phẩm
    useEffect(() => {
        let filtered = [...allProducts]

        // Lọc theo giới tính
        if (selectedGender !== 'all') {
            filtered = filtered.filter(product =>
                product.gender && product.gender === selectedGender
            )
        }

        // Lọc theo category từ database
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product =>
                product.id_category === selectedCategory
            )
        }

        setFilteredProducts(filtered)
        setCurrentPage(1) // Reset về trang 1 khi filter thay đổi
    }, [selectedGender, selectedCategory, allProducts])

    const handleGenderFilter = (gender) => {
        setSelectedGender(gender)
    }

    const handleCategoryFilter = (category) => {
        setSelectedCategory(category)
    }

    const handleAddToCart = (product) => {
        const data = {
            id_cart: Math.random().toString(),
            id_product: product._id,
            name_product: product.name_product,
            price_product: product.price_product,
            count: 1,
            image: product.image,
            size: 'M', // Size mặc định
        }

        CartsLocal.addProduct(data)
        
        const action_count_change = changeCount(count_change)
        dispatch(action_count_change)

        setShowSuccess(true)
        setTimeout(() => {
            setShowSuccess(false)
        }, 2000)
    }

    // Tính toán sản phẩm cho trang hiện tại
    const indexOfLastProduct = currentPage * productsPerPage
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)

    // Tổng số trang
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <section className="product-area li-laptop-product pt-60 pb-45">
            <div className="container">
                {/* Thông báo thành công */}
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
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        animation: 'slideIn 0.3s ease-out'
                    }}>
                        <i className="fa fa-check-circle" style={{marginRight: '10px'}}></i>
                        Đã thêm sản phẩm vào giỏ hàng!
                    </div>
                )}
                <div className="row">
                    <div className="col-lg-12">
                        <div className="li-section-title">
                            <h2>
                                <span>Tất Cả Sản Phẩm</span>
                            </h2>
                        </div>

                        {/* Bộ lọc theo giới tính */}
                        <div className="filter-section" style={{
                            marginBottom: '30px',
                            padding: '25px',
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            border: '1px solid #e0e0e0',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{ marginBottom: '20px' }}>
                                <h5 style={{
                                    marginBottom: '12px',
                                    fontSize: '15px',
                                    fontWeight: '700',
                                    color: '#2c3e50',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    Giới Tính:
                                </h5>
                                <div className="filter-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    <button
                                        onClick={() => handleGenderFilter('all')}
                                        onMouseEnter={(e) => {
                                            if (selectedGender !== 'all') {
                                                e.target.style.backgroundColor = '#f0f0f0';
                                                e.target.style.transform = 'translateY(-2px)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedGender !== 'all') {
                                                e.target.style.backgroundColor = '#fff';
                                                e.target.style.transform = 'translateY(0)';
                                            }
                                        }}
                                        style={{
                                            padding: '10px 24px',
                                            margin: '0',
                                            border: selectedGender === 'all' ? 'none' : '2px solid #ddd',
                                            borderRadius: '25px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            backgroundColor: selectedGender === 'all' ? '#333' : '#fff',
                                            color: selectedGender === 'all' ? '#fff' : '#555',
                                            boxShadow: selectedGender === 'all' ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.08)',
                                            transition: 'all 0.3s ease',
                                            position: 'relative',
                                            zIndex: 1,
                                            outline: 'none'
                                        }}
                                    >
                                        Tất Cả
                                    </button>
                                    <button
                                        onClick={() => handleGenderFilter('Male')}
                                        onMouseEnter={(e) => {
                                            if (selectedGender !== 'Male') {
                                                e.target.style.backgroundColor = '#e3f2fd';
                                                e.target.style.transform = 'translateY(-2px)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedGender !== 'Male') {
                                                e.target.style.backgroundColor = '#fff';
                                                e.target.style.transform = 'translateY(0)';
                                            }
                                        }}
                                        style={{
                                            padding: '10px 24px',
                                            margin: '0',
                                            border: selectedGender === 'Male' ? 'none' : '2px solid #ddd',
                                            borderRadius: '25px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            backgroundColor: selectedGender === 'Male' ? '#3498db' : '#fff',
                                            color: selectedGender === 'Male' ? '#fff' : '#555',
                                            boxShadow: selectedGender === 'Male' ? '0 4px 12px rgba(52,152,219,0.3)' : '0 2px 4px rgba(0,0,0,0.08)',
                                            transition: 'all 0.3s ease',
                                            position: 'relative',
                                            zIndex: 1,
                                            outline: 'none'
                                        }}
                                    >
                                        Nam
                                    </button>
                                    <button
                                        onClick={() => handleGenderFilter('Female')}
                                        onMouseEnter={(e) => {
                                            if (selectedGender !== 'Female') {
                                                e.target.style.backgroundColor = '#fce4ec';
                                                e.target.style.transform = 'translateY(-2px)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedGender !== 'Female') {
                                                e.target.style.backgroundColor = '#fff';
                                                e.target.style.transform = 'translateY(0)';
                                            }
                                        }}
                                        style={{
                                            padding: '10px 24px',
                                            margin: '0',
                                            border: selectedGender === 'Female' ? 'none' : '2px solid #ddd',
                                            borderRadius: '25px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            backgroundColor: selectedGender === 'Female' ? '#e91e63' : '#fff',
                                            color: selectedGender === 'Female' ? '#fff' : '#555',
                                            boxShadow: selectedGender === 'Female' ? '0 4px 12px rgba(233,30,99,0.3)' : '0 2px 4px rgba(0,0,0,0.08)',
                                            transition: 'all 0.3s ease',
                                            position: 'relative',
                                            zIndex: 1,
                                            outline: 'none'
                                        }}
                                    >
                                        Nữ
                                    </button>
                                    <button
                                        onClick={() => handleGenderFilter('Unisex')}
                                        onMouseEnter={(e) => {
                                            if (selectedGender !== 'Unisex') {
                                                e.target.style.backgroundColor = '#f3e5f5';
                                                e.target.style.transform = 'translateY(-2px)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedGender !== 'Unisex') {
                                                e.target.style.backgroundColor = '#fff';
                                                e.target.style.transform = 'translateY(0)';
                                            }
                                        }}
                                        style={{
                                            padding: '10px 24px',
                                            margin: '0',
                                            border: selectedGender === 'Unisex' ? 'none' : '2px solid #ddd',
                                            borderRadius: '25px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            backgroundColor: selectedGender === 'Unisex' ? '#9c27b0' : '#fff',
                                            color: selectedGender === 'Unisex' ? '#fff' : '#555',
                                            boxShadow: selectedGender === 'Unisex' ? '0 4px 12px rgba(156,39,176,0.3)' : '0 2px 4px rgba(0,0,0,0.08)',
                                            transition: 'all 0.3s ease',
                                            position: 'relative',
                                            zIndex: 1,
                                            outline: 'none'
                                        }}
                                    >
                                        Unisex
                                    </button>
                                </div>
                            </div>

                            {/* Bộ lọc theo loại trang phục - từ database */}
                            <div>
                                <h5 style={{
                                    marginBottom: '12px',
                                    fontSize: '15px',
                                    fontWeight: '700',
                                    color: '#2c3e50',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    Loại Trang Phục:
                                </h5>
                                <div className="filter-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                    <button
                                        onClick={() => handleCategoryFilter('all')}
                                        onMouseEnter={(e) => {
                                            if (selectedCategory !== 'all') {
                                                e.target.style.backgroundColor = '#f0f0f0';
                                                e.target.style.transform = 'translateY(-2px)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedCategory !== 'all') {
                                                e.target.style.backgroundColor = '#fff';
                                                e.target.style.transform = 'translateY(0)';
                                            }
                                        }}
                                        style={{
                                            padding: '10px 24px',
                                            margin: '0',
                                            border: selectedCategory === 'all' ? 'none' : '2px solid #ddd',
                                            borderRadius: '25px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            backgroundColor: selectedCategory === 'all' ? '#333' : '#fff',
                                            color: selectedCategory === 'all' ? '#fff' : '#555',
                                            boxShadow: selectedCategory === 'all' ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.08)',
                                            transition: 'all 0.3s ease',
                                            position: 'relative',
                                            zIndex: 1,
                                            outline: 'none'
                                        }}
                                    >
                                        Tất Cả
                                    </button>
                                    {categories && categories.map((cat, index) => {
                                        const colors = ['#f39c12', '#16a085', '#e74c3c', '#3498db'];
                                        const hoverColors = ['#fff3e0', '#e0f2f1', '#ffebee', '#e3f2fd'];
                                        const activeColor = colors[index % colors.length];
                                        const hoverColor = hoverColors[index % hoverColors.length];

                                        return (
                                            <button
                                                key={cat._id}
                                                onClick={() => handleCategoryFilter(cat._id)}
                                                onMouseEnter={(e) => {
                                                    if (selectedCategory !== cat._id) {
                                                        e.target.style.backgroundColor = hoverColor;
                                                        e.target.style.transform = 'translateY(-2px)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (selectedCategory !== cat._id) {
                                                        e.target.style.backgroundColor = '#fff';
                                                        e.target.style.transform = 'translateY(0)';
                                                    }
                                                }}
                                                style={{
                                                    padding: '10px 24px',
                                                    margin: '0',
                                                    border: selectedCategory === cat._id ? 'none' : '2px solid #ddd',
                                                    borderRadius: '25px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: '600',
                                                    backgroundColor: selectedCategory === cat._id ? activeColor : '#fff',
                                                    color: selectedCategory === cat._id ? '#fff' : '#555',
                                                    boxShadow: selectedCategory === cat._id ? `0 4px 12px ${activeColor}40` : '0 2px 4px rgba(0,0,0,0.08)',
                                                    transition: 'all 0.3s ease',
                                                    position: 'relative',
                                                    zIndex: 1,
                                                    outline: 'none'
                                                }}
                                            >
                                                {cat.category}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Hiển thị số lượng sản phẩm */}
                        <div style={{
                            marginBottom: '20px',
                            fontSize: '14px',
                            color: '#666'
                        }}>
                            Hiển thị <strong>{indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)}</strong> trong tổng số <strong>{filteredProducts.length}</strong> sản phẩm
                        </div>

                        {/* Grid sản phẩm - 3 sản phẩm mỗi hàng */}
                        <div className="row">
                            {
                                currentProducts && currentProducts.length > 0 ? (
                                    currentProducts.map(value => (
                                        <div className="col-lg-4 col-md-6 col-sm-6 mt-40" key={value._id}>
                                            <div className="single-product-wrap" style={{
                                                opacity: value.stock === 0 ? 0.6 : 1,
                                                filter: value.stock === 0 ? 'grayscale(80%)' : 'none',
                                                transition: 'all 0.3s ease',
                                                position: 'relative'
                                            }}>
                                                <div className="product-image" style={{ position: 'relative' }}>
                                                    <Link to={`/detail/${value._id}`}>
                                                        <img src={value.image} alt={value.name_product} style={{
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
                                                <div className="product_desc">
                                                    <div className="product_desc_info">
                                                        <div className="product-review">
                                                            <h5 className="manufacturer">
                                                                <Link to={`/detail/${value._id}`}>{value.name_product}</Link>
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
                                                        <div style={{ marginBottom: '8px' }}>
                                                            <span style={{
                                                                display: 'inline-block',
                                                                padding: '3px 10px',
                                                                borderRadius: '12px',
                                                                fontSize: '12px',
                                                                fontWeight: '500',
                                                                backgroundColor: value.gender === 'Male' ? '#3498db' : value.gender === 'Female' ? '#e91e63' : '#9c27b0',
                                                                color: 'white'
                                                            }}>
                                                                {value.gender === 'Male' ? 'Nam' : value.gender === 'Female' ? 'Nữ' : 'Unisex'}
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
                                                            <span className="new-price">{new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(value.price_product) + ' VNĐ'}</span>
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
                                ) : (
                                    <div className="col-lg-12">
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '40px 20px',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '8px'
                                        }}>
                                            <i className="fa fa-shopping-bag" style={{ fontSize: '48px', color: '#ccc', marginBottom: '15px' }}></i>
                                            <h4 style={{ color: '#666' }}>Không tìm thấy sản phẩm</h4>
                                            <p style={{ color: '#999' }}>Vui lòng thử lại với bộ lọc khác</p>
                                        </div>
                                    </div>
                                )
                            }
                        </div>

                        {/* Phân trang */}
                        {totalPages > 1 && (
                            <div className="pagination-section" style={{
                                marginTop: '40px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                {/* Nút Previous */}
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: '10px 15px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        backgroundColor: currentPage === 1 ? '#f5f5f5' : '#fff',
                                        color: currentPage === 1 ? '#999' : '#333',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                >
                                    ← Trước
                                </button>

                                {/* Số trang */}
                                {[...Array(totalPages)].map((_, index) => {
                                    const pageNumber = index + 1;
                                    // Chỉ hiển thị 5 trang gần currentPage
                                    if (
                                        pageNumber === 1 ||
                                        pageNumber === totalPages ||
                                        (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                                    ) {
                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => handlePageChange(pageNumber)}
                                                style={{
                                                    padding: '10px 15px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    backgroundColor: currentPage === pageNumber ? '#333' : '#fff',
                                                    color: currentPage === pageNumber ? '#fff' : '#333',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: currentPage === pageNumber ? '600' : '500',
                                                    minWidth: '40px'
                                                }}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    } else if (
                                        pageNumber === currentPage - 3 ||
                                        pageNumber === currentPage + 3
                                    ) {
                                        return <span key={pageNumber} style={{ padding: '0 5px' }}>...</span>;
                                    }
                                    return null;
                                })}

                                {/* Nút Next */}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: '10px 15px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        backgroundColor: currentPage === totalPages ? '#f5f5f5' : '#fff',
                                        color: currentPage === totalPages ? '#999' : '#333',
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                >
                                    Sau →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AllProducts;
