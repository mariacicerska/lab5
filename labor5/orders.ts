import {
  orders,
  Order,
  GetOrdersSearchItemsCountNegativeError,
  GetOrdersSearchNoConditionError,
  GetOrdersSearchQueryError,
  GetOrdersSearchTotalPriceArgIsNegativeError,
  GetOrdersSearchTotalPriceFormatError,
  OrdersQuery,
} from './shared/orders.models';

export const getTotalPrice = (items: Order['items']) => {
  return items.reduce((acc, cur) => {
    return acc + cur.pricePerUnit * cur.quantity;
  }, 0);
};

export const getOrdersByQuery = (query: OrdersQuery): Order[] => {
  const { search, userIds = [], itemsCount, totalPrice } = query;

  const conditions: ((order: Order) => boolean)[] = [];

  if (search) {
    if (search.length < 3) {
      throw new GetOrdersSearchQueryError('search parameter should be more than 3');
    }

    conditions.push((order: Order): boolean => {
      const searchRegExp = new RegExp(search, 'i');
      return (
        searchRegExp.test(order.title) ||
        order.items.some((item) => searchRegExp.test(item.title))
      );
    });
  }

  if (userIds.length) {
    conditions.push((order: Order): boolean => {
      return userIds.includes(order.userId);
    });
  }

  if (itemsCount != null) {
    if (itemsCount < 0) {
      throw new GetOrdersSearchItemsCountNegativeError();
    }

    conditions.push((order: Order): boolean => order.items.length === itemsCount);
  }

  if (totalPrice) {
    const { eq, gt, lt } = totalPrice;

    if (eq != null && (gt != null || lt != null)) {
      throw new GetOrdersSearchTotalPriceFormatError();
    }

    if (eq != null) {
      if (eq < 0) {
        throw new GetOrdersSearchTotalPriceArgIsNegativeError('eq');
      }
      conditions.push((order: Order): boolean => {
        const totalPrice = getTotalPrice(order.items);
        return totalPrice === eq;
      });
    } else {
      if (lt != null && lt < 0) {
        throw new GetOrdersSearchTotalPriceArgIsNegativeError('lt');
      }
      if (gt != null && gt < 0) {
        throw new GetOrdersSearchTotalPriceArgIsNegativeError('gt');
      }
      conditions.push((order: Order): boolean => {
        const totalPrice = getTotalPrice(order.items);
        return (gt != null ? totalPrice > gt : true) && (lt != null ? totalPrice < lt : true);
      });
    }
  }

  if (!conditions.length) {
    throw new GetOrdersSearchNoConditionError();
  }

  return orders.filter((order) => conditions.every((check) => check(order)));
};
