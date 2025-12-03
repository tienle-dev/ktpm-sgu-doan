import { addSession, deleteSession } from '../../Redux/Action/ActionSession';
import { changeCount } from '../../Redux/Action/ActionCount';
import { addCart, deleteCart, updateCart } from '../../Redux/Action/ActionCart';

describe('Redux Actions', () => {
    describe('Session Actions', () => {
        test('addSession tạo đúng action', () => {
            const userId = 'user123';
            const expectedAction = {
                type: 'ADD_SESSION',
                payload: userId
            };

            expect(addSession(userId)).toEqual(expectedAction);
        });

        test('deleteSession tạo đúng action', () => {
            const expectedAction = {
                type: 'DELETE_SESSION'
            };

            expect(deleteSession()).toEqual(expectedAction);
        });
    });

    describe('Count Actions', () => {
        test('changeCount toggle giá trị isLoad', () => {
            const currentValue = false;
            const expectedAction = {
                type: 'CHANGE_COUNT',
                payload: !currentValue
            };

            expect(changeCount(currentValue)).toEqual(expectedAction);
        });

        test('changeCount từ true sang false', () => {
            const currentValue = true;
            const expectedAction = {
                type: 'CHANGE_COUNT',
                payload: !currentValue
            };

            expect(changeCount(currentValue)).toEqual(expectedAction);
        });
    });

    describe('Cart Actions', () => {
        test('addCart tạo đúng action với product data', () => {
            const product = {
                id_product: 'prod1',
                name_product: 'Test Product',
                price_product: 100000,
                count: 1
            };
            const expectedAction = {
                type: 'ADD_CART',
                payload: product
            };

            expect(addCart(product)).toEqual(expectedAction);
        });

        test('deleteCart tạo đúng action với cart id', () => {
            const cartId = 'cart123';
            const expectedAction = {
                type: 'DELETE_CART',
                payload: cartId
            };

            expect(deleteCart(cartId)).toEqual(expectedAction);
        });

        test('updateCart tạo đúng action với updated data', () => {
            const updateData = {
                id_cart: 'cart123',
                count: 5
            };
            const expectedAction = {
                type: 'UPDATE_CART',
                payload: updateData
            };

            expect(updateCart(updateData)).toEqual(expectedAction);
        });
    });
});
