const isReceivedPurchase = (purchase) =>
  String(purchase.purchaseStatus || '').toLowerCase() === 'received';

export const updateInventoryForPurchase = (purchase, direction) => {
  const products = JSON.parse(localStorage.getItem('bms_products') || '[]');
  const location = purchase.businessLocation || 'Main Store';
  const multiplier = direction === 'add' ? 1 : -1;

  if (!isReceivedPurchase(purchase)) {
    return false;
  }

  const updatedProducts = products.map(product => {
    const item = (purchase.items || []).find(purchaseItem => purchaseItem.productId === product.id);
    if (!item) {
      return product;
    }

    const quantity = (parseFloat(item.quantity) || 0) * multiplier;
    const stockByLocation = { ...(product.stockByLocation || {}) };
    stockByLocation[location] = (parseFloat(stockByLocation[location]) || 0) + quantity;

    return {
      ...product,
      currentStock: (parseFloat(product.currentStock) || 0) + quantity,
      stockByLocation,
      ...(direction === 'add' && item.unitCostAfterDiscount !== undefined
        ? { purchasePrice: parseFloat(item.unitCostAfterDiscount) || 0 }
        : {})
    };
  });

  localStorage.setItem('bms_products', JSON.stringify(updatedProducts));
  return true;
};

export const markPurchaseInventoryApplied = purchase => ({
  ...purchase,
  inventoryApplied: isReceivedPurchase(purchase)
});