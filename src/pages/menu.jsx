import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  UtensilsCrossed, Salad, Beef, Soup, CakeSlice, Coffee,
  Search, X, Plus, Minus, ShoppingCart, Edit2, Trash2,
  Clock, ChefHat, Receipt, Zap, CheckCircle2, AlertCircle,
} from "lucide-react";
import Sidebar from "../component/Sidebar/Sidebars";
import "../assets/css/Menu.css";
import { useTables } from "../context/TablesContext";
import { useOrder } from "../context/OrderItemContext";
import { useMenu } from "../context/MenuContext";


const CATEGORIES = ["All", "Appetizer", "Main Course", "Side", "Dessert", "Beverage"];
const CAT_META = {
  All:           { icon: <UtensilsCrossed size={16} />, color: "#2563eb" },
  Appetizer:     { icon: <Salad size={16} />,           color: "#f59e0b" },
  "Main Course": { icon: <Beef size={16} />,            color: "#ef4444" },
  Side:         { icon: <Soup size={16} />,            color: "#22c55e" },
  Dessert:      { icon: <CakeSlice size={16} />,       color: "#ec4899" },
  Beverage:      { icon: <Coffee size={16} />,          color: "#8b5cf6" },
};

export default function Menu() {
  const [activeView, setActiveView] = useState("menu");
  const [category, setCategory]     = useState("All");
  const [search, setSearch]         = useState("");
  const [cartOpen, setCartOpen]     = useState(false);
  const [flashId, setFlashId]       = useState(null);
  const [pendingAdds, setPendingAdds] = useState({});
  const [creatingOrder, setCreatingOrder] = useState(false);
  const searchRef = useRef(null);
  const cartRef   = useRef(null);
  const { menuItems, loading, error } = useMenu();
  const { selectedTable } = useTables();

  const { 
    orderItems, 
    setOrderItems, 
    updateQuantity, 
    removeItem, 
    orderId, 
    errorMessage, 
    createOrder 
  } = useOrder();



  const displayMenuItems = useMemo(() => {
    if (!menuItems) return [];
    return menuItems.map((item) => ({
      id: item.id,
      name: item.item_name,
      price: Number(item.price),
      category: item.category,
      image: item.item_picture || "",
      prepTime: 10,
      isAvailable: item.is_available,
    }));
  }, [menuItems]);

  const getQuantity = (menuItemId) => {
    const orderItem = orderItems.find(item => item.Item?.item_id === menuItemId);
    return orderItem?.quantity ?? 0;
  };

  const getCategoryCount = (cat) =>
    cat === "All" ? displayMenuItems.length : displayMenuItems.filter((i) => i.category === cat).length;


  const handleAddItem = async (menuItem) => {
    if (pendingAdds[menuItem.id] || creatingOrder) return;

    const validMenuItem = {
      ...menuItem,
      price: Number(menuItem.price) || 0
    };

    if (!orderId) {
      setCreatingOrder(true);
      const newOrderId = await createOrder(selectedTable.id, validMenuItem);
      setCreatingOrder(false);

      if (newOrderId) {
        setFlashId(validMenuItem.id);
        setTimeout(() => setFlashId(null), 800);
      }
      return;
    }

    const existingItem = orderItems.find(item => item.Item?.item_id === validMenuItem.id);

    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;

      setOrderItems(prev =>
        prev.map(item =>
          item.OrderItemID === existingItem.OrderItemID
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      updateQuantity(orderId, existingItem.OrderItemID, validMenuItem.id, newQuantity);

    } else {
      setPendingAdds(prev => ({ ...prev, [validMenuItem.id]: true }));

      const tempId = Date.now();

      const tempOrderItem = {
        OrderItemID: tempId,
        Item: {
          item_id: validMenuItem.id,
          item_name: validMenuItem.name,
          image: validMenuItem.image,
          price: validMenuItem.price
        },
        quantity: 1,
        special_note: "",
        isTemp: true
      };

      setOrderItems(prev => [...prev, tempOrderItem]);

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND}Order/AddItem/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_ins: orderId,
            order_items: validMenuItem.id,
            quantity: 1,
            special_note: ""
          })
        });

        const result = await response.json();

        if (result.status === 201 && result.data) {
          const realOrderItem = {
            OrderItemID: result.data.OrderItemID,
            Item: {
              item_id: result.data.Item?.item_id,
              item_name: result.data.Item?.item_name,
              price: Number(result.data.Item?.price || 0),
              image: result.data.Item?.image || ""
            },
            quantity: result.data.quantity,
            special_note: result.data.special_note,
            isTemp: false
          };

          setOrderItems(prev =>
            prev.map(item =>
              item.OrderItemID === tempId ? realOrderItem : item
            )
          );
        } else {
          setOrderItems(prev => prev.filter(item => item.OrderItemID !== tempId));
        }
      } catch (err) {
        setOrderItems(prev => prev.filter(item => item.OrderItemID !== tempId));
      } finally {
        setPendingAdds(prev => ({ ...prev, [validMenuItem.id]: false }));
      }
    }

    setFlashId(validMenuItem.id);
    setTimeout(() => setFlashId(null), 800);
  };

  const handleDecrementItem = (menuItemId) => {
    const existingItem = orderItems.find(item => item.Item?.item_id === menuItemId);

    if (!existingItem || existingItem.isTemp) return;

    // Only decrement if quantity is greater than 1
    if (existingItem.quantity > 1) {
      const newQuantity = existingItem.quantity - 1;

      setOrderItems(prev =>
        prev.map(item =>
          item.OrderItemID === existingItem.OrderItemID
            ? { ...item, quantity: newQuantity }
            : item
        )
      );

      updateQuantity(orderId, existingItem.OrderItemID, menuItemId, newQuantity);
    }
    // If quantity is 1, do nothing (don't remove the item)
  };

  const filteredItems = useMemo(() =>
      displayMenuItems.filter((item) => {
        if (category !== "All" && item.category !== category) return false;
        if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      }),
      [displayMenuItems, category, search]
    );

 const groupedItems = useMemo(() => {
    if (category !== "All") return { [category]: filteredItems };
    return CATEGORIES.slice(1).reduce((acc, cat) => {
      const rows = filteredItems.filter((i) => i.category === cat);
      if (rows.length) acc[cat] = rows;
      return acc;
    }, {});
  }, [filteredItems, category]);

  const cartCount = orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

const cartTotal = orderItems.reduce(
  (sum, item) =>
    sum + (Number(item.Item?.price || 0) * (item.quantity || 0)),
  0
);

const statsData = [
  { label: "Total Items", value: displayMenuItems.length, icon: <ChefHat size={15} /> },
  { label: "In Order", value: cartCount, icon: <ShoppingCart size={15} /> },
  { label: "Order Value", value: `₹${cartTotal.toLocaleString("en-IN")}`, icon: <Receipt size={15} /> },
];

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="main-content">
        <div className="menu-page">

          {errorMessage && (
            <div className="error-toast-global" style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '8px',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              animation: 'slideIn 0.3s ease-out'
            }}>
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {creatingOrder && (
            <div className="error-toast-global" style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              backgroundColor: '#f59e0b',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '8px',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              animation: 'slideIn 0.3s ease-out'
            }}>
              <AlertCircle size={18} />
              <span>Creating new order...</span>
            </div>
          )}

          <div className="menu-banner">
            <div className="banner-left">
              <span className="banner-eyebrow">
                <Zap size={13} /> Kitchen Management
              </span>
              <h1 className="banner-title">Menu</h1>
              {selectedTable?.id && (
                <div className="banner-table-chip">Table {selectedTable.id}</div>
              )}
            </div>
            <div className="banner-right">
              <div className="banner-stats">
                {statsData.map((s) => (
                  <div className="stat-block" key={s.label}>
                    <div className="stat-icon">{s.icon}</div>
                    <div className="stat-value">{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="menu-body">
            <div className="menu-left">

              <div className="top-bar">
                <div className="search-wrap" onClick={() => searchRef.current?.focus()}>
                  <Search size={15} />
                  <input
                    ref={searchRef}
                    placeholder="Search dishes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button className="search-clear" onClick={() => setSearch("")}>
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              <div className="cat-rail">
                <div className="rails">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      className={`cat-pill ${category === cat ? "active" : ""}`}
                      style={category === cat ? { "--pill-color": CAT_META[cat].color } : {}}
                      onClick={() => setCategory(cat)}
                    >
                      <span className="cat-pill-icon">{CAT_META[cat].icon}</span>
                      <span>{cat}</span>
                      <span className="cat-pill-num">{getCategoryCount(cat)}</span>
                    </button>
                  ))}
                </div>

                {selectedTable?.id && (
                  <div className="cart-icon-wrap" ref={cartRef}>
                    <button
                      className={`cart-icon-btn ${cartCount > 0 ? "has-items" : ""}`}
                      onClick={() => setCartOpen((o) => !o)}
                      title="View order"
                    >
                      <ShoppingCart size={18} />
                      {cartCount > 0 && (
                        <span className="cart-icon-badge">{cartCount}</span>
                      )}
                    </button>

                    {cartOpen && (
                      <div className="cart-popover">
                        <div className="cart-pop-arrow" />
                        <div className="cart-pop-header">
                          <div className="cart-pop-title">
                            <ShoppingCart size={14} />
                            <span>Current Order</span>
                            {cartCount > 0 && (
                              <span className="cart-pop-count">{cartCount}</span>
                            )}
                          </div>
                          <button className="cart-pop-close" onClick={() => setCartOpen(false)}>
                            <X size={14} />
                          </button>
                        </div>

                        {orderItems.length === 0 ? (
                          <div className="cart-pop-empty">
                            <ShoppingCart size={26} strokeWidth={1.2} />
                            <p>No items in order</p>
                          </div>
                        ) : (
                          <div className="cart-pop-list">
                            {orderItems.map((orderItem) => (
                              <div key={orderItem.OrderItemID} className="cart-pop-row">
                                <span className="cpr-name">
                                  {orderItem.Item?.item_name}
                                  {orderItem.isTemp && <span style={{ fontSize: '10px', marginLeft: '5px', color: '#f59e0b' }}>(adding...)</span>}
                                </span>
                                <div className="cpr-controls">
                                  <button
                                    className="cpr-btn"
                                    onClick={() => handleDecrementItem(orderItem.Item?.item_id)}
                                    disabled={orderItem.isTemp || orderItem.quantity === 1}
                                  >
                                    <Minus size={10} />
                                  </button>
                                  <span className="cpr-qty">{orderItem.quantity}</span>
                                  <button
                                    className="cpr-btn"
                                    onClick={() => handleAddItem({
                                      id: orderItem.Item?.item_id,
                                      name: orderItem.Item?.item_name,
                                      price: orderItem.Item?.price,
                                      image: orderItem.Item?.image
                                    })}
                                    disabled={orderItem.isTemp}
                                  >
                                    <Plus size={10} />
                                  </button>
                                </div>
                                <span className="cpr-price">
                                  ₹{(orderItem.Item?.price * orderItem.quantity).toLocaleString("en-IN")}
                                </span>
                                <button
                                  className="cpr-del"
                                  onClick={() => {
                                    if (!orderItem.isTemp) {
                                      const updatedItems = orderItems.filter(i => i.OrderItemID !== orderItem.OrderItemID);
                                      setOrderItems(updatedItems);
                                      removeItem(orderId, orderItem.OrderItemID, orderItem.Item?.item_id);
                                    }
                                  }}
                                  disabled={orderItem.isTemp}
                                >
                                  <X size={11} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {loading && (
                <div className="empty-state">
                  <div className="empty-icon">⏳</div>
                  <p>Loading menu…</p>
                </div>
              )}
              {error && (
                <div className="empty-state">
                  <div className="empty-icon">⚠️</div>
                  <p>Failed to load menu</p>
                </div>
              )}

              {!loading && !error && (
                filteredItems.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🍽️</div>
                    <p>No dishes match your filters</p>
                    <button onClick={() => { setSearch(""); setCategory("All"); }}>
                      Clear filters
                    </button>
                  </div>
                ) : (
                  <div className="item-list">
                    {Object.entries(groupedItems).map(([cat, rows]) => (
                      <div className="item-group" key={cat}>
                        <div className="group-header">
                          <span className="group-dot" style={{ background: CAT_META[cat]?.color }} />
                          <span className="group-name">{cat}</span>
                          <span className="group-count">{rows.length}</span>
                          <div className="group-line" />
                        </div>

                        {rows.map((item, idx) => {
                          const quantity = getQuantity(item.id);
                          const orderItem = orderItems.find(oi => oi.Item?.item_id === item.id);

                          return (
                            <div
                              key={item.id}
                              className={`item-row ${quantity > 0 ? "row-in-cart" : ""}`}
                              style={{ animationDelay: `${idx * 0.04}s` }}
                            >
                              <div className="row-left">
                                <span className="row-index">{String(idx + 1).padStart(2, "0")}</span>
                                <div className="row-info">
                                  <span className="row-name">{item.name}</span>
                                  <div className="row-meta">
                                    <Clock size={11} />
                                    <span>{item.prepTime} min</span>
                                  </div>
                                </div>
                              </div>

                              <div className="row-right">
                                <span className="row-price">
                                  ₹{item.price.toLocaleString("en-IN")}
                                </span>

                                {quantity > 0 && orderItem && (
                                  <div className="row-stepper">
                                    <button 
                                      onClick={() => handleDecrementItem(item.id)}
                                      disabled={orderItem.isTemp || quantity === 1}
                                    >
                                      <Minus size={11} />
                                    </button>
                                    <span>
                                      {quantity}
                                      {orderItem.isTemp && <span style={{ fontSize: '10px', marginLeft: '4px' }}>⏳</span>}
                                    </span>
                                    <button 
                                      onClick={() => handleAddItem(item)}
                                      disabled={orderItem.isTemp}
                                    >
                                      <Plus size={11} />
                                    </button>
                                  </div>
                                )}

                                {selectedTable?.id && quantity === 0 && (
                                  <button
                                    className={`row-add-btn ${flashId === item.id ? "flash" : ""}`}
                                    onClick={() => handleAddItem(item)}
                                    title="Add to order"
                                    disabled={pendingAdds[item.id] || creatingOrder}
                                  >
                                    {flashId === item.id
                                      ? <CheckCircle2 size={14} />
                                      : pendingAdds[item.id] ? <span>...</span> : <Plus size={14} />
                                    }
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}