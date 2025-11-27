import React from 'react';
import PropTypes from 'prop-types';
import AllProducts from '../Home/Component/AllProducts';

Shop.propTypes = {

};

function Shop(props) {

    return (
        <div className="content-wraper"
            style={{ paddingTop: '50px' }}>
            <div className="container">
                <AllProducts />
            </div>
        </div>
    );
}

export default Shop;