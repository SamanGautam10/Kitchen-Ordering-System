import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus, Search, Edit2, Trash2, X, Check, AlertCircle,
  UtensilsCrossed, ChefHat, ToggleLeft, ToggleRight,
} from "lucide-react";
import Sidebar from "../component/Sidebar/Sidebars";
import { ToastContainer, useToast } from "../component/ToastNotification/ToastNotification";
import { useMenu } from "../context/MenuContext"; // Import the MenuContext
import "../assets/css/MenuManagement.css";

const Backend = import.meta.env.VITE_BACKEND;

const CATEGORIES = ["Main Course", "Appetizer", "Dessert", "Beverage", "Side"];

const CAT_COLORS = {
  "Main Course": { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
  "Appetizer":   { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
  "Dessert":     { bg: "#fce7f3", text: "#9d174d", border: "#f9a8d4" },
  "Beverage":    { bg: "#ede9fe", text: "#5b21b6", border: "#c4b5fd" },
  "Side":        { bg: "#dcfce7", text: "#166534", border: "#86efac" },
};

const EMPTY_FORM = { item_name: "", price: "", category: "Main Course", is_available: true };

// ── Item modal (create / edit) ────────────────────────────────────────
function ItemModal({ mode, item, onClose, onSave }) {
  const [form, setForm] = useState(
    mode === "edit" && item
      ? { item_name: item.item_name, price: item.price, category: item.category, is_available: item.is_available }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.item_name.trim() || !form.price) { setErr("Name and price are required."); return; }
    setSaving(true); setErr(null);
    try {
      if (mode === "create") {
        const res = await axios.post(`${Backend}Order/menus/`, form);
        onSave(res.data, "create");
      } else {
        const res = await axios.patch(`${Backend}Order/menus/${item.id}/`, form);
        onSave(res.data, "edit");
      }
    } catch (e) {
      console.error("API Error:", e.response);
      if (e.response?.data) {
        const errorData = e.response.data;
        if (typeof errorData === 'string') {
          setErr(errorData);
        } else if (errorData.message) {
          setErr(errorData.message);
        } else if (errorData.detail) {
          setErr(errorData.detail);
        } else if (errorData.error) {
          setErr(errorData.error);
        } else {
          setErr("Request failed. Please try again.");
        }
      } else {
        setErr("Request failed. Please check your connection.");
      }
    } finally { setSaving(false); }
  };

  return (
    <div className="menu-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="menu-modal">
        <div className="menu-modal-header">
          <h3>{mode === "create" ? "Add Menu Item" : "Edit Menu Item"}</h3>
          <button className="menu-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="menu-modal-body">
          <div className="menu-form-row">
            <div className="menu-field">
              <label>Item Name</label>
              <input value={form.item_name} onChange={e => set("item_name", e.target.value)} placeholder="e.g. Margherita Pizza" required />
            </div>
            <div className="menu-field">
              <label>Price (Rs.)</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={e => set("price", e.target.value)} placeholder="0.00" required />
            </div>
          </div>
          <div className="menu-form-row">
            <div className="menu-field">
              <label>Category</label>
              <select value={form.category} onChange={e => set("category", e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="menu-field">
              <label>Availability</label>
              <button type="button"
                className={`menu-modal-toggle ${form.is_available ? "on" : "off"}`}
                onClick={() => set("is_available", !form.is_available)}
              >
                {form.is_available ? "Available" : "Unavailable"}
              </button>
            </div>
          </div>
          {err && <div className="menu-modal-error"><AlertCircle size={14} />{err}</div>}
          <div className="menu-modal-footer">
            <button type="button" className="menu-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className={`menu-btn-submit ${mode === "edit" ? "amber" : "green"}`} disabled={saving}>
              {saving ? "Saving…" : mode === "create" ? <><Plus size={14} /> Add Item</> : <><Check size={14} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete modal ──────────────────────────────────────────────────────
function DeleteModal({ item, onClose, onConfirm, addToast }) {
  const [loading, setLoading] = useState(false);
  const confirm = async () => {
    setLoading(true);
    try {
      const response = await axios.delete(`${Backend}Order/menus/${item.id}/`);
      
      console.log("Delete response status:", response.status);
      
      // Handle 204 No Content - successful deletion
      if (response.status === 204) {
        onConfirm(item.id);
        addToast(`${item.item_name} deleted successfully!`, "success");
      } else if (response.status === 200 && response.data?.status === "success") {
        onConfirm(item.id);
        addToast(response.data.message || `${item.item_name} deleted successfully!`, "success");
      } else {
        onConfirm(item.id);
        addToast(`${item.item_name} deleted successfully!`, "success");
      }
    } catch (error) {
      console.error("Delete error:", error);
      
      if (error.response?.status === 404) {
        addToast(`${item.item_name} has already been deleted.`, "info");
        onConfirm(item.id);
      } else if (error.response?.data?.message) {
        addToast(error.response.data.message, "error");
        setLoading(false);
      } else if (error.response?.data?.error) {
        addToast(error.response.data.error, "error");
        setLoading(false);
      } else {
        addToast("Failed to delete menu item. Please try again.", "error");
        setLoading(false);
      }
    }
  };
  
  return (
    <div className="menu-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="menu-modal menu-modal-sm">
        <div className="menu-modal-header danger">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AlertCircle size={20} color="#ef4444" />
            <h3>Delete Item</h3>
          </div>
          <button className="menu-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="menu-modal-body">
          <p className="menu-delete-msg">Are you sure you want to delete <strong>{item?.item_name}</strong>? This action cannot be undone.</p>
          <div className="menu-modal-footer">
            <button className="menu-btn-cancel" onClick={onClose}>Cancel</button>
            <button className="menu-btn-danger" onClick={confirm} disabled={loading}>
              <Trash2 size={14} /> {loading ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────
export default function MenuManagement() {
  const [activeView, setActiveView] = useState("menu-mgmt");
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [modal, setModal] = useState(null);
  const { toasts, addToast, removeToast } = useToast();
  
  // Use the MenuContext instead of local state
  const { menuItems, loading, fetchMenu } = useMenu();

  // Initial fetch - force refresh to get latest data
  useEffect(() => {
    fetchMenu(); // Fetch from API
  }, []);

  const filtered = (menuItems || []).filter(i => {
    const matchCat = catFilter === "All" || i.category === catFilter;
    const matchSearch = !search || i.item_name?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleSave = async (saved, mode) => {
    console.log("Saved data:", saved);
    
    if (mode === "create") {
      // Refresh menu items from API to get the new item
      await fetchMenu();
      addToast(`${saved.item_name} added!`, "success");
    } else {
      // Update the menu item in local state
      const updatedItems = menuItems.map(i => i.id === saved.id ? saved : i);
      // Since context doesn't have update function, we'll refresh
      await fetchMenu();
      addToast(`${saved.item_name} updated!`, "info");
    }
    setModal(null);
  };

  const handleDelete = async (id) => {
    // Refresh menu items from API after deletion
    await fetchMenu();
    setModal(null);
  };

  const toggleAvail = async (item) => {
    const updated = { ...item, is_available: !item.is_available };
    
    try {
      await axios.patch(`${Backend}Order/menus/${item.id}/`, { is_available: updated.is_available });
      // Refresh to get updated data
      await fetchMenu();
      addToast(`${item.item_name} is now ${updated.is_available ? "available" : "unavailable"}`, "info");
    } catch (error) {
      console.error("Toggle availability error:", error);
      addToast("Failed to update availability. Please try again.", "error");
    }
  };

  const stats = [
    { label: "Total Items",  value: menuItems?.length || 0, icon: ChefHat, variant: "blue" },
    { label: "Available",    value: menuItems?.filter(i => i.is_available).length || 0, icon: Check, variant: "green" },
    { label: "Unavailable",  value: menuItems?.filter(i => !i.is_available).length || 0, icon: ToggleLeft, variant: "amber" },
    { label: "Categories",   value: new Set(menuItems?.map(i => i.category) || []).size, icon: UtensilsCrossed, variant: "purple" },
  ];

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="main-content">
        <div className="menu-mgmt-page">

          {/* Header */}
          <div className="menu-mgmt-header">
            <div>
              <h1 className="admin-title">Menu Management</h1>
              <p className="admin-subtitle">Add, edit and manage your restaurant menu</p>
            </div>
            <button className="menu-mgmt-add-btn" onClick={() => setModal({ type: "create" })}>
              <Plus size={16} /> Add Item
            </button>
          </div>

          {/* Stats */}
          <div className="menu-mgmt-stats">
            {stats.map(s => {
              const Icon = s.icon;
              return (
                <div className={`menu-stat-card ${s.variant}`} key={s.label}>
                  <div className="menu-stat-top">
                    <div className="menu-stat-icon"><Icon size={20} /></div>
                  </div>
                  <p className="menu-stat-label">{s.label}</p>
                  <h2 className="menu-stat-value">{s.value}</h2>
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="menu-mgmt-filters">
            <div className="menu-search-wrap">
              <Search size={15} />
              <input placeholder="Search dishes…" value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button onClick={() => setSearch("")}><X size={13} /></button>}
            </div>
            <div className="menu-cat-pills">
              {["All", ...CATEGORIES].map(c => (
                <button key={c} className={`menu-cat-pill ${catFilter === c ? "active" : ""}`} onClick={() => setCatFilter(c)}>{c}</button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="menu-mgmt-table-card">
            <div className="menu-mgmt-card-header">
              <h3>
                Menu Items
                <span className="menu-count-badge">{filtered.length}</span>
              </h3>
            </div>

            {loading ? (
              <div className="menu-skeleton-list">
                {[1,2,3,4,5].map(i => <div className="menu-skeleton-row" key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="menu-empty">
                <UtensilsCrossed size={40} strokeWidth={1.2} />
                <p>No items found</p>
                <span>{search || catFilter !== "All" ? "Try clearing your filters" : "Click \"Add Item\" to get started"}</span>
              </div>
            ) : (
              <div className="menu-table-wrap">
                <table className="menu-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item, idx) => {
                      const cat = CAT_COLORS[item.category] || CAT_COLORS["Main Course"];
                      return (
                        <tr key={item.id}>
                          <td className="menu-td-num">{String(idx + 1).padStart(2, "0")}</td>
                          <td className="menu-td-name">{item.item_name}</td>
                          <td>
                            <span className="menu-cat-badge" style={{ background: cat.bg, color: cat.text, border: `1px solid ${cat.border}` }}>
                              {item.category}
                            </span>
                          </td>
                          <td className="menu-td-price">Rs. {Number(item.price).toFixed(2)}</td>
                          <td>
                            <button className={`menu-avail-toggle ${item.is_available ? "avail" : "unavail"}`} onClick={() => toggleAvail(item)}>
                              {item.is_available ? "Available" : "Unavailable"}
                            </button>
                          </td>
                          <td>
                            <div className="menu-row-actions">
                              <button className="menu-btn-edit" onClick={() => setModal({ type: "edit", item })} title="Edit">
                                <Edit2 size={14} />
                              </button>
                              <button className="menu-btn-delete" onClick={() => setModal({ type: "delete", item })} title="Delete">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {(modal?.type === "create" || modal?.type === "edit") && (
          <ItemModal mode={modal.type} item={modal.item} onClose={() => setModal(null)} onSave={handleSave} />
        )}
        {modal?.type === "delete" && (
          <DeleteModal 
            item={modal.item} 
            onClose={() => setModal(null)} 
            onConfirm={handleDelete}
            addToast={addToast}
          />
        )}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </main>
    </div>
  );
}