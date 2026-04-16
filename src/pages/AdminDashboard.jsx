import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  DollarSign, ShoppingCart, LayoutGrid, UtensilsCrossed,
  Clock, TrendingUp,
} from "lucide-react";
import Sidebar from "../component/Sidebar/Sidebars";
import "../assets/css/AdminDashboard.css";

// ✅ helper (unchanged)
const formatTrend = (value) => {
  if (value === undefined || value === null) return "—";
  if (value > 0) return `+${value.toFixed(1)}%`;
  if (value < 0) return `${value.toFixed(1)}%`;
  return "No change";
};

const QUICK_ACTIONS = [
  { label: "Add Menu Item", icon: UtensilsCrossed },
  { label: "Add Table",     icon: LayoutGrid      },
  { label: "View Orders",   icon: ShoppingCart    },
  { label: "View Reports",  icon: TrendingUp      },
];

// ✅ Status color map for order_status
const STATUS_COLOR = {
  active:    "#f59e0b",
  preparing: "#f59e0b",
  ready:     "#3b82f6",
  delivered: "#22c55e",
  completed: "#22c55e",
};

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState("admin");
  const [stats, setStats] = useState(null);
  const [tables, setTables] = useState([]);
  const [tableStats, setTableStats] = useState({
    available: 0,
    occupied: 0,
    reserved: 0
  });

  // ✅ Recent orders state (replaces hardcoded RECENT_ORDERS)
  const [recentOrders, setRecentOrders] = useState([]);

  const Backend = import.meta.env.VITE_BACKEND;

  // ✅ Fetch stats API
  useEffect(() => {
    axios.get(`${Backend}dashboard/stats/`)
      .then(res => {
        console.log("Stats API:", res.data);
        setStats(res.data);
      })
      .catch(err => console.error("Stats error:", err));
  }, []);

  // ✅ Fetch tables API
  useEffect(() => {
    axios.get(`${Backend}Tables/all/`)
      .then(res => {
        console.log("Tables API:", res.data);
        setTables(res.data);

        const availableCount = res.data.filter(table => table.status === "available" || table.status === "Available").length;
        const occupiedCount  = res.data.filter(table => table.status === "occupied"  || table.status === "Occupied").length;
        const reservedCount  = res.data.filter(table => table.status === "reserved"  || table.status === "Reserved").length;

        setTableStats({
          available: availableCount,
          occupied:  occupiedCount,
          reserved:  reservedCount
        });
      })
      .catch(err => console.error("Tables API error:", err));
  }, []);

  // ✅ Fetch recent orders from API
  useEffect(() => {
    axios.get(`${Backend}Order/all/`)
      .then(res => {
        console.log("Orders API:", res.data);
        // Sort by created_at descending, take latest 5
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setRecentOrders(sorted.slice(0, 5));
      })
      .catch(err => console.error("Orders API error:", err));
  }, []);

  // ✅ Dynamic TABLE_STATUS based on API data
  const TABLE_STATUS = [
    { label: "Available", count: tableStats.available, color: "#22c55e" },
    { label: "Occupied",  count: tableStats.occupied,  color: "#ef4444" },
    { label: "Reserved",  count: tableStats.reserved,  color: "#f59e0b" },
  ];

  // ✅ Generate TABLE_GRID from API data or fallback to 12 tables
  const TABLE_GRID = tables.length > 0 ? tables : Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    name: `Table ${i + 1}`,
    status: "available"
  }));

  // ✅ Function to get table color based on status
  const getTableColor = (table) => {
    if (table.status === "available" || table.status === "Available") {
      return { background: "#dcfce7", color: "#166534" };
    } else if (table.status === "occupied" || table.status === "Occupied") {
      return { background: "#fee2e2", color: "#991b1b" };
    } else if (table.status === "reserved" || table.status === "Reserved") {
      return { background: "#fed7aa", color: "#92400e" };
    }
    return { background: "#f1f5f9", color: "#64748b" };
  };

  // ✅ Function to get table display name
  const getTableName = (table) => {
    return table.table_name || table.name || `Table ${table.table_number || table.id || ''}`;
  };

  // ✅ Helper: calculate order total from Items array
  const getOrderTotal = (order) => {
    return order.Items.reduce((sum, i) => sum + Number(i.Item.price) * i.quantity, 0).toFixed(2);
  };

  // ✅ Helper: time ago from created_at
  const getTimeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (diff < 1) return "just now";
    if (diff === 1) return "1 min ago";
    return `${diff} min ago`;
  };

  // ✅ ONLY this is dynamic
  const STAT_CARDS = [
    {
      id: "revenue",
      label: "Total Revenue Today",
      value: `Rs. ${stats?.revenue ?? 0}`,
      trend: formatTrend(stats?.revenue_trend),
      icon: DollarSign,
      iconBg: "#22c55e",
    },
    {
      id: "orders",
      label: "Active Orders",
      value: stats?.orders ?? 0,
      trend: formatTrend(stats?.orders_trend),
      icon: ShoppingCart,
      iconBg: "#3b82f6",
    },
    {
      id: "tables",
      label: "Total Tables",
      value: (tables.length || stats?.tables) ?? 0,
      trend: "No change",
      trendNeutral: true,
      icon: LayoutGrid,
      iconBg: "#8b5cf6",
    },
    {
      id: "menu",
      label: "Menu Items",
      value: stats?.menu ?? 0,
      trend:
        stats?.menu_trend !== undefined
          ? `${stats.menu_trend > 0 ? "+" : ""}${stats.menu_trend}%`
          : "No change",
      icon: UtensilsCrossed,
      iconBg: "#f59e0b",
    },
  ];

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <main className="main-content">
        <div className="admin-dashboard">

          {/* Header */}
          <div className="admin-header">
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">Overview of your restaurant operations</p>
          </div>

          {/* ✅ Stat Cards (dynamic) */}
          <div className="admin-stats-grid">
            {STAT_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div className="admin-stat-card" key={card.id}>
                  <div className="admin-stat-header">
                    <div className="admin-stat-icon" style={{ background: card.iconBg }}>
                      <Icon size={22} color="#fff" strokeWidth={2} />
                    </div>
                    <span
                      className="admin-stat-trend"
                      style={card.trendNeutral ? { background: "#f1f5f9", color: "#64748b" } : {}}
                    >
                      {card.trend}
                    </span>
                  </div>
                  <p className="admin-stat-label">{card.label}</p>
                  <h2 className="admin-stat-value">{card.value}</h2>
                </div>
              );
            })}
          </div>

          {/* EVERYTHING BELOW UNCHANGED IN STRUCTURE */}

          <div className="admin-content-grid">

            {/* ✅ Recent Orders - now from API */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Recent Orders</h3>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="orders-list">
                {recentOrders.length === 0 ? (
                  <p style={{ color: "#94a3b8", fontSize: "14px", padding: "12px 0" }}>
                    No recent orders found.
                  </p>
                ) : (
                  recentOrders.map((order) => {
                    const statusKey = order.order_status?.toLowerCase();
                    const statusColor = STATUS_COLOR[statusKey] || "#64748b";
                    return (
                      <div className="order-item-admin" key={order.id}>
                        <div className="order-info">
                          <div className="order-table">
                            <LayoutGrid size={16} color="#64748b" />
                            Table {order.table}
                          </div>
                          <div className="order-details">
                            <span>{order.Items.length} items</span>
                            <span className="order-time">
                              <Clock size={12} />
                              {getTimeAgo(order.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="order-right">
                          <span className="order-total">Rs. {getOrderTotal(order)}</span>
                          <span
                            className="order-status"
                            style={{ background: statusColor }}
                          >
                            {order.order_status?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Table Status - Updated with dynamic data using table names */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Table Status</h3>
              </div>

              <div className="table-status-summary">
                {TABLE_STATUS.map(({ label, count, color }) => (
                  <div className="status-item" key={label}>
                    <span className="status-dot" style={{ background: color }} />
                    <span>{label}</span>
                    <span className="status-count">{count}</span>
                  </div>
                ))}
              </div>

              <div className="table-grid-mini">
                {TABLE_GRID.map((table, index) => {
                  const tableName  = getTableName(table);
                  const tableStyle = getTableColor(table);
                  return (
                    <div
                      className="mini-table"
                      key={index}
                      style={tableStyle}
                      title={`Status: ${table.status}`}
                    >
                      {tableName}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Quick Actions */}
          <div className="admin-card">
            <div className="admin-card-header" style={{ borderBottom: "none" }}>
              <h3>Quick Actions</h3>
            </div>
            <div className="quick-actions">
              {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
                <button className="quick-action-btn" key={label}>
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}