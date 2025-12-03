// Test Reducers
// Giả sử reducers được định nghĩa như sau

// Session Reducer
const sessionReducer = (state = { idUser: null }, action) => {
    switch (action.type) {
        case 'ADD_SESSION':
            return { ...state, idUser: action.payload };
        case 'DELETE_SESSION':
            return { ...state, idUser: null };
        default:
            return state;
    }
};

// Count Reducer
const countReducer = (state = { isLoad: false }, action) => {
    switch (action.type) {
        case 'CHANGE_COUNT':
            return { ...state, isLoad: action.payload };
        default:
            return state;
    }
};

// Cart Reducer
const cartReducer = (state = { listCart: [] }, action) => {
    switch (action.type) {
        case 'ADD_CART':
            return { ...state, listCart: [...state.listCart, action.payload] };
        case 'DELETE_CART':
            return { 
                ...state, 
                listCart: state.listCart.filter(item => item.id_cart !== action.payload) 
            };
        case 'UPDATE_CART':
            return {
                ...state,
                listCart: state.listCart.map(item => 
                    item.id_cart === action.payload.id_cart 
                        ? { ...item, count: action.payload.count }
                        : item
                )
            };
        default:
            return state;
    }
};

describe('Redux Reducers', () => {
    describe('Session Reducer', () => {
        test('trả về initial state', () => {
            expect(sessionReducer(undefined, {})).toEqual({ idUser: null });
        });

        test('xử lý ADD_SESSION', () => {
            const action = { type: 'ADD_SESSION', payload: 'user123' };
            expect(sessionReducer(undefined, action)).toEqual({ idUser: 'user123' });
        });

        test('xử lý DELETE_SESSION', () => {
            const initialState = { idUser: 'user123' };
            const action = { type: 'DELETE_SESSION' };
            expect(sessionReducer(initialState, action)).toEqual({ idUser: null });
        });
    });

    describe('Count Reducer', () => {
        test('trả về initial state', () => {
            expect(countReducer(undefined, {})).toEqual({ isLoad: false });
        });

        test('xử lý CHANGE_COUNT thành true', () => {
            const action = { type: 'CHANGE_COUNT', payload: true };
            expect(countReducer(undefined, action)).toEqual({ isLoad: true });
        });

        test('xử lý CHANGE_COUNT thành false', () => {
            const initialState = { isLoad: true };
            const action = { type: 'CHANGE_COUNT', payload: false };
            expect(countReducer(initialState, action)).toEqual({ isLoad: false });
        });
    });

    describe('Cart Reducer', () => {
        const mockProduct = {
            id_cart: 'cart1',
            id_product: 'prod1',
            name_product: 'Test Product',
            price_product: 100000,
            count: 1
        };

        test('trả về initial state', () => {
            expect(cartReducer(undefined, {})).toEqual({ listCart: [] });
        });

        test('xử lý ADD_CART', () => {
            const action = { type: 'ADD_CART', payload: mockProduct };
            expect(cartReducer(undefined, action)).toEqual({ listCart: [mockProduct] });
        });

        test('xử lý DELETE_CART', () => {
            const initialState = { listCart: [mockProduct] };
            const action = { type: 'DELETE_CART', payload: 'cart1' };
            expect(cartReducer(initialState, action)).toEqual({ listCart: [] });
        });

        test('xử lý UPDATE_CART', () => {
            const initialState = { listCart: [mockProduct] };
            const action = { type: 'UPDATE_CART', payload: { id_cart: 'cart1', count: 5 } };
            
            const result = cartReducer(initialState, action);
            
            expect(result.listCart[0].count).toBe(5);
        });

        test('ADD_CART thêm vào danh sách hiện có', () => {
            const secondProduct = {
                id_cart: 'cart2',
                id_product: 'prod2',
                name_product: 'Product 2',
                price_product: 200000,
                count: 2
            };
            const initialState = { listCart: [mockProduct] };
            const action = { type: 'ADD_CART', payload: secondProduct };
            
            expect(cartReducer(initialState, action)).toEqual({
                listCart: [mockProduct, secondProduct]
            });
        });

        test('DELETE_CART không xóa sản phẩm khác', () => {
            const secondProduct = {
                id_cart: 'cart2',
                id_product: 'prod2',
                name_product: 'Product 2',
                price_product: 200000,
                count: 2
            };
            const initialState = { listCart: [mockProduct, secondProduct] };
            const action = { type: 'DELETE_CART', payload: 'cart1' };
            
            expect(cartReducer(initialState, action)).toEqual({
                listCart: [secondProduct]
            });
        });
    });
});
