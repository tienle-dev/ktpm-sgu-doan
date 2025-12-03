import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { createStore, combineReducers } from 'redux';

// Mock reducers
const cartReducer = (state = { listCart: [] }, action) => {
    switch (action.type) {
        case 'ADD_CART':
            return { ...state, listCart: [...state.listCart, action.payload] };
        case 'DELETE_CART':
            return { ...state, listCart: state.listCart.filter(item => item.id !== action.payload) };
        default:
            return state;
    }
};

const countReducer = (state = { isLoad: false }, action) => {
    switch (action.type) {
        case 'CHANGE_COUNT':
            return { ...state, isLoad: !state.isLoad };
        default:
            return state;
    }
};

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

// Combine reducers
const rootReducer = combineReducers({
    Cart: cartReducer,
    Count: countReducer,
    Session: sessionReducer,
});

// Custom render function với Redux và Router
export const renderWithProviders = (
    ui,
    {
        preloadedState = {},
        store = createStore(rootReducer, preloadedState),
        ...renderOptions
    } = {}
) => {
    const Wrapper = ({ children }) => (
        <Provider store={store}>
            <BrowserRouter>
                {children}
            </BrowserRouter>
        </Provider>
    );

    return {
        store,
        ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    };
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { renderWithProviders as render };
