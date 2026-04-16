import React, { useState } from "react";
import {
  Home,
  ShoppingCart,
  Receipt,
  Circle,
  Users,
  HandPlatter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import OrderSummary from "../component/OrderSummary/OrderSummarys";
import "../assets/css/kitchen-dashboard.css";
import Sidebar from "../component/Sidebar/Sidebars";
import { useTables } from "../context/TablesContext";
import { useOrder } from "../context/OrderItemContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const Backend = import.meta.env.VITE_BACKEND;

  const { tables, loading, error, selectedTable, setSelectedTable } =
    useTables();

  const {
    orderItems,
    orderId,
    setOrderItems,
    setOrderId,
    addItem,
    updateQuantity,
    removeItem,
    clearOrder,
  } = useOrder();

  const [activeView, setActiveView] = useState("home");
  const [orderLoading, setOrderLoading] = useState(false);

  // handle table selection & fetch order if occupied
  const handleSelectTable = async (table) => {
    if (selectedTable?.id === table.id) {
      clearOrder();
      setSelectedTable(null);
      return;
    }

    setSelectedTable(table);

    if (table.status === "occupied") {
      setOrderLoading(true);

      try {
        const res = await fetch(`${Backend}Order/${table.id}/`);
        if (!res.ok) throw new Error();

        const data = await res.json();
        setOrderItems(data.Items); // store raw Items array
        setOrderId(data.id); // store orderId
      } catch (err) {
        clearOrder();
        console.error(err);
      } finally {
        setTimeout(() => setOrderLoading(false), 350); 
      }
    } else {
      clearOrder();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "#22c55e";
      case "occupied":
        return "#ef4444";
      default:
        return "#94a3b8";
    }
  };

  const getStatusLabel = (status) =>
    status.charAt(0).toUpperCase() + status.slice(1);

  const calculateTotal = () => {
    const subtotal = orderItems.reduce(
      (s, i) => s + i.Item.price * i.quantity,
      0
    );
    return subtotal + subtotal * 0.13;
  };

  const stats = [
    {
      label: "Current Table",
      value: selectedTable?.table_name || "Not Selected",
      icon: Home,
      color: "#3b82f6",
    },
    {
      label: "Items in Order",
      value: orderItems.reduce((s, i) => s + i.quantity, 0),
      icon: ShoppingCart,
      color: "#8b5cf6",
    },
    {
      label: "Order Total",
      value: `$${calculateTotal().toFixed(2)}`,
      icon: Receipt,
      color: "#22c55e",
    },
  ];

  const showFallback = !loading && (error || (tables && tables.length === 0));

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <main className="main-content">
        <div className="dashboard">
          <h1 className="page-title">Dashboard</h1>

          {/* Stats */}
          <div className="stats-grid">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="stat-card">
                  <div
                    className="stat-icon"
                    style={{ backgroundColor: stat.color }}
                  >
                    <Icon size={24} color="#fff" />
                  </div>
                  <div className="stat-content">
                    <p className="stat-label">{stat.label}</p>
                    <h2 className="stat-value">{stat.value}</h2>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tables + Order */}
          <div className={`dashboard-grid ${!selectedTable ? "no-order" : ""}`}>
            {/* Table selection */}
            {loading ? (
              <div className="table-selection-container">
                <div className="tables-grid">
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="table-card skeleton" />
                    ))}
                </div>
              </div>
            ) : showFallback ? (
              <div className="fallback-ui standalone">
                <HandPlatter size={64} />
                <h2>No Tables Available</h2>
                <p>Create one to start taking orders</p>
                <button
                  className="create-table-btn"
                  onClick={() => navigate("/create-table")}
                >
                  + Create Table
                </button>
              </div>
            ) : (
              <div className="table-selection-container">
                <div className="table-selection-header">
                  <h3 className="section-title">Select Table</h3>
                  <div className="table-status-legend">
                    <div className="legend-item">
                      <Circle size={12} fill="#22c55e" />
                      <span>Available</span>
                    </div>
                    <div className="legend-item">
                      <Circle size={12} fill="#ef4444" />
                      <span>Occupied</span>
                    </div>
                    <div className="legend-item">
                      <Circle size={12} fill="#f59e0b" />
                      <span>Reserved</span>
                    </div>
                  </div>
                </div>

                <div className="tables-grid">
                  {(tables || []).map((table) => (
                    <button
                      key={table.id}
                      onClick={() => handleSelectTable(table)}
                      className={`table-card ${
                        selectedTable?.id === table.id ? "selected" : ""
                      } ${table.status}`}
                    >
                      <div className="table-card-header">
                        <div
                          className="status-dot"
                          style={{ backgroundColor: getStatusColor(table.status) }}
                        />
                        <span className="status-label">
                          {getStatusLabel(table.status)}
                        </span>
                      </div>

                      <div className="table-card-body">
                        <h4 className="table-name">{table.table_name}</h4>
                        <div className="table-capacity">
                          <Users size={16} />
                          <span>{table.capacity} seats</span>
                        </div>
                      </div>

                      {selectedTable?.id === table.id && (
                        <div className="selected-badge">Selected</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Order summary */}
            {selectedTable && (
              <OrderSummary
                orderItems={orderItems}
                tableNumber={selectedTable.table_name}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                onClearOrder={clearOrder}
                loading={orderLoading} // ✅ pass loading here
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;