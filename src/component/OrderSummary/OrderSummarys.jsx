import React, { useEffect, useState } from 'react';
import { ShoppingCart, Minus, Plus, Trash2, Tag, Receipt, HandPlatter } from 'lucide-react';
import { useOrder } from '../../context/OrderItemContext'; 
import './OrderSummary.css';

const Backend = import.meta.env.VITE_BACKEND;

const OrderSummary = ({ tableNumber, loading }) => {
  const { orderItems, setOrderItems, removeItem, clearOrder, orderId } = useOrder();
  const [discountPercent, setDiscountPercent] = useState(0);
  const VAT_RATE = 0.13;

  const calculateSubtotal = () =>
    orderItems.reduce((sum, item) => sum + (item.Item.price * item.quantity), 0);

  const calculateVAT = (subtotal) => subtotal * VAT_RATE;
  const calculateDiscount = (subtotal) => subtotal * (discountPercent / 100);
  
  const UpdateItems = (orderItemId, quantity) => {
    fetch(`${Backend}Order/UpdateItem/${orderItemId}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity })
    })
      .then(res => {
        if (!res.ok) throw new Error(`Invalid response ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log(data, "from update");
        // Update local state with fresh data from response
        if (data.Items) {
          setOrderItems(data.Items);
        }
      })
      .catch(err => console.error("Update failed:", err));
  };

  const handleIncreaseQuantity = (item) => {
    const newQuantity = item.quantity + 1;
    // Update local state immediately for responsive UI
    const updatedItems = orderItems.map(i =>
      i.OrderItemID === item.OrderItemID 
        ? { ...i, quantity: newQuantity }
        : i
    );
    setOrderItems(updatedItems);
    // Then sync with backend
    UpdateItems(item.OrderItemID, newQuantity);
  };

  const handleDecreaseQuantity = (item) => {
    if (item.quantity === 1) {
      // Remove from local state
      const updatedItems = orderItems.filter(i => i.OrderItemID !== item.OrderItemID);
      setOrderItems(updatedItems);
      // Then sync with backend (delete endpoint)
      DeleteOrderItem(item.OrderItemID);
    } else {
      const newQuantity = item.quantity - 1;
      // Update local state immediately
      const updatedItems = orderItems.map(i =>
        i.OrderItemID === item.OrderItemID 
          ? { ...i, quantity: newQuantity }
          : i
      );
      setOrderItems(updatedItems);
      // Then sync with backend
      UpdateItems(item.OrderItemID, newQuantity);
    }
  };

  const DeleteOrderItem = (orderItemId) => {
    fetch(`${Backend}Order/DeleteItem/${orderItemId}/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Invalid response ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log(data, "from delete");
        if (data.Items) {
          setOrderItems(data.Items);
        }
      })
      .catch(err => console.error("Delete failed:", err));
  };

  const handleDiscountChange = (e) => {
    const value = Math.max(0, Math.min(100, Number(e.target.value)));
    setDiscountPercent(value);
  };

  const subtotal = calculateSubtotal();
  const vat = calculateVAT(subtotal);
  const discount = calculateDiscount(subtotal);
  const total = subtotal + vat - discount;

  // Show loading skeleton inside order-summary
  if (loading) {
    return (
      <div className="order-summary">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="skeleton-row">
            <div className="skeleton-left">
              <div className="skeleton-name" />
              <div className="skeleton-qty" />
            </div>
            <div className="skeleton-price" />
          </div>
        ))}
      </div>
    );
  }

  if (orderItems.length === 0) {
    return (
      <div className="order-summary">
        <h3 className="section-title">Order Summary</h3>
        <div className="empty-order">
          <ShoppingCart size={48} color="#ccc" />
          <p>No items in order</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-summary">
      <div className="order-header">
        <h3 className="section-title">Order Summary</h3>
        {tableNumber && <span className="table-tag">Table {tableNumber}</span>}
      </div>

      <div className="order-items">
        {orderItems.map(item => (
          <div key={item.OrderItemID} className="order-item">
            <div className="order-item-info">
              <h4 className="order-item-name">{item.Item.item_name}</h4>
              <p className="order-item-price">${item.Item.price.toFixed(2)}</p>
            </div>

            <div className="order-item-actions">
              <button onClick={() => handleDecreaseQuantity(item)} className="quantity-button">
                <Minus size={14} />
              </button>

              <span className="quantity">{item.quantity}</span>

              <button onClick={() => handleIncreaseQuantity(item)} className="quantity-button">
                <Plus size={14} />
              </button>

              <button onClick={() => DeleteOrderItem(item.OrderItemID)} className="delete-button">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="billing-summary">
        <div className="billing-row">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        <div className="billing-row">
          <span>VAT ({(VAT_RATE * 100).toFixed(0)}%):</span>
          <span>${vat.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="billing-row discount-row">
            <span>Discount ({discountPercent}%):</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}

        <div className="total-row">
          <span>Total:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="order-actions">
        {/* <button onClick={clearOrder} className="clear-button">Clear Order</button> */}
        <button onClick={() => alert(`Order submitted for ${tableNumber}`)} className="submit-button">
          <Receipt size={18} /> Submit Order
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;