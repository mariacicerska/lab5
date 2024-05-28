import { getTotalPrice, getOrdersByQuery } from './orders';
import { Order, OrdersQuery, GetOrdersSearchQueryError, GetOrdersSearchItemsCountNegativeError, GetOrdersSearchTotalPriceArgIsNegativeError, GetOrdersSearchTotalPriceFormatError, GetOrdersSearchNoConditionError } from './shared/orders.models';

describe('getTotalPrice', () => {
  it('should return 0 for empty items', () => {
    const items: Order['items'] = [];
    expect(getTotalPrice(items)).toBe(0);
  });

  it('should calculate total price for single item', () => {
    const items: Order['items'] = [
      { title: 'Item 1', pricePerUnit: 100, quantity: 2 },
    ];
    expect(getTotalPrice(items)).toBe(200);
  });

  it('should calculate total price for multiple items', () => {
    const items: Order['items'] = [
      { title: 'Item 1', pricePerUnit: 100, quantity: 2 },
      { title: 'Item 2', pricePerUnit: 50, quantity: 3 },
    ];
    expect(getTotalPrice(items)).toBe(350);
  });
});

describe('getOrdersByQuery', () => {
  it('should throw error for search query less than 3 characters', () => {
    const query: OrdersQuery = { search: 'ab' };
    expect(() => getOrdersByQuery(query)).toThrow(GetOrdersSearchQueryError);
  });

  it('should return orders matching search query', () => {
    const query: OrdersQuery = { search: 'et' };
    const result = getOrdersByQuery(query);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('et');
  });

  it('should return orders matching userIds', () => {
    const query: OrdersQuery = { userIds: ['A8A9861E-5E73-9F6C-9A47-D3F98C682B5D'] };
    const result = getOrdersByQuery(query);
    expect(result).toHaveLength(1);
    expect(result[0].userId).toBe('A8A9861E-5E73-9F6C-9A47-D3F98C682B5D');
  });

  it('should return orders matching itemsCount', () => {
    const query: OrdersQuery = { itemsCount: 5 };
    const result = getOrdersByQuery(query);
    expect(result).toHaveLength(3);
  });

  it('should throw error for negative itemsCount', () => {
    const query: OrdersQuery = { itemsCount: -1 };
    expect(() => getOrdersByQuery(query)).toThrow(GetOrdersSearchItemsCountNegativeError);
  });

  it('should return orders matching totalPrice eq', () => {
    const query: OrdersQuery = { totalPrice: { eq: 1472 } };
    const result = getOrdersByQuery(query);
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('et');
  });

  it('should throw error for negative totalPrice eq', () => {
    const query: OrdersQuery = { totalPrice: { eq: -1 } };
    expect(() => getOrdersByQuery(query)).toThrow(GetOrdersSearchTotalPriceArgIsNegativeError);
  });

  it('should return orders matching totalPrice gt and lt', () => {
    const query: OrdersQuery = { totalPrice: { gt: 1000, lt: 2000 } };
    const result = getOrdersByQuery(query);
    expect(result).toHaveLength(2);
  });

  it('should throw error for invalid totalPrice format', () => {
    const query: OrdersQuery = { totalPrice: { eq: 1000, gt: 500 } };
    expect(() => getOrdersByQuery(query)).toThrow(GetOrdersSearchTotalPriceFormatError);
  });

  it('should throw error if no conditions provided', () => {
    const query: OrdersQuery = {};
    expect(() => getOrdersByQuery(query)).toThrow(GetOrdersSearchNoConditionError);
  });
});
