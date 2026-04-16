import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useTables } from "./TablesContext";
import axios from "axios";

const OrderContext = createContext();
export const useOrder = () => useContext(OrderContext);

const Backend = import.meta.env.VITE_BACKEND;

export const OrderProvider = ({ children }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const { selectedTable } = useTables();

  // Track pending requests to prevent race conditions
  const pendingRequests = useRef(new Map());
  const requestCounter = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  // Clear error message after 3 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

const createOrder = async (tableId, firstMenuItem = null) => {
  const itemsArray = firstMenuItem ? [
    {
      order_items: firstMenuItem.id,
      quantity: 1,
      special_note: ""
    }
  ] : [];

  const body = {
    table: tableId,
    waiter: 1,
    Items: itemsArray
  };

  try {
    const res = await axios.post(`${Backend}Order/create/`, body);
    const data = res.data?.data;

    if (!data) return null;

    const parsedItems = (data.Items || []).map(item => ({
      OrderItemID: item.OrderItemID,
      Item: {
        item_id: item.Item.item_id,
        item_name: item.Item.item_name,
        price: Number(item.Item.price),
        image: item.Item.image || ""
      },
      quantity: item.quantity,
      special_note: item.special_note,
      isTemp: false
    }));

    setOrderId(data.id);
    setOrderItems(parsedItems);

    return data.id;

  } catch (err) {
    setErrorMessage("Failed to create order");
    return null;
  }
};

  const addItem = (orderId, menuItemId, quantity, specialNote = "") => {
    const body = {
      order_ins: orderId,
      order_items: menuItemId,
      quantity: quantity,
      special_note: specialNote
    };

    console.log("Adding item:", body);

    axios.post(`${Backend}Order/AddItem/`, body)
      .then(res => {
        console.log("Item added successfully:", res.data);
        setErrorMessage(null);
      })
      .catch(err => {
        console.error("Failed to add item:", err);
        setErrorMessage(`Failed to add item. ${err.response?.data?.message || 'Please try again.'}`);
        // Remove the optimistic item on error (cleanup will be handled by component)
      });
  };

  const updateQuantity = (orderId, orderItemId, menuItemId, newQuantity) => {
    // Generate unique request ID for race condition handling
    const requestId = ++requestCounter.current;
    pendingRequests.current.set(orderItemId, requestId);
    
    // Store previous state for rollback
    const previousOrderItems = [...orderItems];
    
    // OPTIMISTIC UPDATE: Update UI immediately
    setOrderItems(prevItems =>
      prevItems.map(item =>
        item.OrderItemID === orderItemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );

    // Prepare API request
    const body = {
      "Items": [
        {
          "OrderItemID": orderItemId,
          "order_items": menuItemId,
          "quantity": newQuantity
        }
      ]
    };

    // Make API call
    axios.patch(`${Backend}Order/update/${orderId}/`, body)
      .then(res => {
        console.log("Update successful:", res.data);
        const latestRequestId = pendingRequests.current.get(orderItemId);
        if (latestRequestId === requestId) {
          if (res.data.Items) {
            setOrderItems(res.data.Items);
          }
          pendingRequests.current.delete(orderItemId);
          setErrorMessage(null);
        } else {
          console.log("Ignoring stale response");
        }
      })
      .catch(err => {
        console.error("Update failed:", err);
        
        // Check if this is still the latest request
        const latestRequestId = pendingRequests.current.get(orderItemId);
        if (latestRequestId === requestId) {
          // ROLLBACK: Revert to previous state on error
          setOrderItems(previousOrderItems);
          pendingRequests.current.delete(orderItemId);
          setErrorMessage(`Failed to update quantity. ${err.response?.data?.message || 'Please try again.'}`);
        }
      });
  };

  const removeItem = (orderId, orderItemId, menuItemId) => {
    // Store previous state for rollback
    const previousOrderItems = [...orderItems];
    
    // OPTIMISTIC UPDATE: Remove from UI immediately
    setOrderItems(prevItems =>
      prevItems.filter(item => item.OrderItemID !== orderItemId)
    );

    // Make API call
    axios.delete(`${Backend}Order/deleteItem/${orderItemId}/`)
      .then(res => {
        console.log("Remove successful:", res.data);
        if (res.data.Items) {
          setOrderItems(res.data.Items);
        }
        setErrorMessage(null);
      })
      .catch(err => {
        console.error("Remove failed:", err);
        // ROLLBACK: Revert to previous state on error
        setOrderItems(previousOrderItems);
        setErrorMessage(`Failed to remove item. ${err.response?.data?.message || 'Please try again.'}`);
      });
  };

  const clearOrder = () => {
    setOrderItems([]);
    setOrderId(null);
    setErrorMessage(null);
  };

  if (loading) {
    return (
      <div style={{ padding: "1rem" }}>
        <div style={{ background: "#e0e0e0", height: "20px", marginBottom: "10px", borderRadius: "4px" }}></div>
        <div style={{ background: "#e0e0e0", height: "20px", marginBottom: "10px", borderRadius: "4px" }}></div>
        <div style={{ background: "#e0e0e0", height: "20px", marginBottom: "10px", borderRadius: "4px" }}></div>
      </div>
    );
  }

  return (
    <OrderContext.Provider
      value={{
        orderItems,
        setOrderItems,
        orderId,
        setOrderId,
        selectedTable,
        addItem,
        updateQuantity,
        removeItem,
        clearOrder,
        errorMessage,
        createOrder
      }}
    >
      {children}
      {errorMessage && (
        <div className="error-toast" style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          {errorMessage}
        </div>
      )}
    </OrderContext.Provider>
  );
};