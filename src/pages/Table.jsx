import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Plus, Search, Edit2, Trash2, X, Check, AlertCircle,
  LayoutGrid, Users, Circle,
} from "lucide-react";
import Sidebar from "../component/Sidebar/Sidebars";
import { ToastContainer, useToast } from "../component/ToastNotification/ToastNotification";
import { useTables } from "../context/TablesContext"; // Import the context
import "../assets/css/TableManagement.css";

const Backend = import.meta.env.VITE_BACKEND;

const STATUS_META = {
  available: { bg: "#dcfce7", text: "#166534", border: "#86efac", dot: "#22c55e" },
  occupied:  { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5", dot: "#ef4444" },
  reserved:  { bg: "#fed7aa", text: "#92400e", border: "#fdba74", dot: "#f59e0b" },
};

const EMPTY_FORM = { table_name: "", capacity: "4", status: "available" };

// ── Table modal (create / edit) ───────────────────────────────────────
function TableModal({ mode, table, onClose, onSave }) {
  const [form, setForm] = useState(
    mode === "edit" && table
      ? { table_name: table.table_name, capacity: table.capacity, status: table.status }
      : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.table_name.trim() || !form.capacity) { 
      setErr("Name and capacity are required."); 
      return; 
    }
    setSaving(true); 
    setErr(null);
    
    try {
      if (mode === "create") {
        const res = await axios.post(`${Backend}Tables/create/`, {
          table_name: form.table_name,
          status: form.status,
          capacity: parseInt(form.capacity)
        });
        console.log("Create response:", res.data);
        onSave(res.data.table, "create");
      } else {
        const res = await axios.put(`${Backend}Tables/update/${table.id}/`, {
          table_name: form.table_name,
          status: form.status,
          capacity: parseInt(form.capacity)
        });
        console.log("Update response:", res.data);
        onSave(res.data.table || res.data, "edit");
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
    } finally { 
      setSaving(false); 
    }
  };

  return (
    <div className="tbl-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="tbl-modal">
        <div className="tbl-modal-header">
          <h3>{mode === "create" ? "Add New Table" : "Edit Table"}</h3>
          <button className="tbl-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="tbl-modal-body">
          <div className="tbl-form-row">
            <div className="tbl-field">
              <label>Table Name</label>
              <input value={form.table_name} onChange={e => set("table_name", e.target.value)} placeholder="e.g. Table A1" required />
            </div>
            <div className="tbl-field">
              <label>Capacity (seats)</label>
              <input type="number" min="1" max="20" value={form.capacity} onChange={e => set("capacity", e.target.value)} placeholder="4" required />
            </div>
          </div>
          <div className="tbl-field">
            <label>Status</label>
            <div className="tbl-status-picker">
              {Object.entries(STATUS_META).map(([s, meta]) => (
                <button type="button" key={s}
                  className={`tbl-status-opt ${form.status === s ? "selected" : ""}`}
                  style={form.status === s ? { background: meta.bg, borderColor: meta.border, color: meta.text } : {}}
                  onClick={() => set("status", s)}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: meta.dot, display: "inline-block" }} />
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {err && <div className="tbl-modal-error"><AlertCircle size={14} />{err}</div>}
          <div className="tbl-modal-footer">
            <button type="button" className="tbl-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className={`tbl-btn-submit ${mode === "edit" ? "amber" : "blue"}`} disabled={saving}>
              {saving ? "Saving…" : mode === "create" ? <><Plus size={14} /> Add Table</> : <><Check size={14} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete modal ──────────────────────────────────────────────────────
function DeleteModal({ table, onClose, onConfirm, addToast }) {
  const [loading, setLoading] = useState(false);
  const confirm = async () => {
    setLoading(true);
    try {
      const response = await axios.delete(`${Backend}Tables/delete/${table.id}/`);
      
      console.log("Delete response status:", response.status);
      
      // Handle 204 No Content - successful deletion
      if (response.status === 204) {
        onConfirm(table.id);
        addToast(`${table.table_name} deleted successfully!`, "success");
      } else if (response.status === 200 && response.data?.status === "success") {
        onConfirm(table.id);
        addToast(response.data.message || `${table.table_name} deleted successfully!`, "success");
      } else {
        onConfirm(table.id);
        addToast(`${table.table_name} deleted successfully!`, "success");
      }
    } catch (error) {
      console.error("Delete error:", error);
      
      if (error.response?.status === 404) {
        addToast(`${table.table_name} has already been deleted.`, "info");
        onConfirm(table.id);
      } else if (error.response?.data?.message) {
        addToast(error.response.data.message, "error");
        setLoading(false);
      } else if (error.response?.data?.error) {
        addToast(error.response.data.error, "error");
        setLoading(false);
      } else {
        addToast("Failed to delete table. Please try again.", "error");
        setLoading(false);
      }
    }
  };
  
  return (
    <div className="tbl-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="tbl-modal tbl-modal-sm">
        <div className="tbl-modal-header danger">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AlertCircle size={20} color="#ef4444" />
            <h3>Delete Table</h3>
          </div>
          <button className="tbl-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="tbl-modal-body">
          <p className="tbl-delete-msg">Are you sure you want to delete <strong>{table?.table_name}</strong>? All associated orders will be removed.</p>
          <div className="tbl-modal-footer">
            <button className="tbl-btn-cancel" onClick={onClose}>Cancel</button>
            <button className="tbl-btn-danger" onClick={confirm} disabled={loading}>
              <Trash2 size={14} /> {loading ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────
export default function TableManagement() {
  const [activeView, setActiveView] = useState("table-mgmt");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [modal, setModal] = useState(null);
  const { toasts, addToast, removeToast } = useToast();
  
  // Use the TablesContext instead of local state
  const { 
    tables, 
    loading, 
    fetchTables, 
    removeTable, 
    updateTable 
  } = useTables();

  // Initial fetch - force refresh to get latest data
  useEffect(() => {
    fetchTables(true); // Force refresh from API
  }, []);

  const filtered = (tables || []).filter(t => {
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    const matchSearch = !search || t.table_name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleSave = async (saved, mode) => {
    console.log("Saved data:", saved);
    
    if (mode === "create") {
      // Refresh tables from API to get the new table
      await fetchTables(true);
      addToast(`${saved.table_name} added!`, "success");
    } else {
      // Update the table in context
      updateTable(saved.id, saved);
      addToast(`${saved.table_name} updated!`, "info");
    }
    setModal(null);
  };

  const handleDelete = (id) => {
    // Remove from context
    removeTable(id);
    setModal(null);
    // No need to call fetchTables again as removeTable already updates state
  };

  const stats = [
    { label: "Total Tables", value: tables?.length || 0, variant: "blue", icon: LayoutGrid },
    { label: "Available", value: tables?.filter(t => t.status === "available").length || 0, variant: "green", icon: Circle },
    { label: "Occupied", value: tables?.filter(t => t.status === "occupied").length || 0, variant: "red", icon: Circle },
    { label: "Reserved", value: tables?.filter(t => t.status === "reserved").length || 0, variant: "amber", icon: Circle },
  ];

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="main-content">
        <div className="tbl-mgmt-page">

          {/* Header */}
          <div className="tbl-mgmt-header">
            <div>
              <h1 className="admin-title">Table Management</h1>
              <p className="admin-subtitle">Manage your restaurant tables and seating</p>
            </div>
            <button className="tbl-mgmt-add-btn" onClick={() => setModal({ type: "create" })}>
              <Plus size={16} /> Add Table
            </button>
          </div>

          {/* Stats */}
          <div className="tbl-mgmt-stats">
            {stats.map(s => {
              const Icon = s.icon;
              return (
                <div className={`tbl-stat-card ${s.variant}`} key={s.label}>
                  <div className="tbl-stat-top">
                    <div className="tbl-stat-icon"><Icon size={20} /></div>
                  </div>
                  <p className="tbl-stat-label">{s.label}</p>
                  <h2 className="tbl-stat-value">{s.value}</h2>
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="tbl-mgmt-filters">
            <div className="tbl-search-wrap">
              <Search size={15} />
              <input placeholder="Search tables…" value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button onClick={() => setSearch("")}><X size={13} /></button>}
            </div>
            <div className="tbl-status-pills">
              {["All", "available", "occupied", "reserved"].map(s => (
                <button key={s}
                  className={`tbl-status-pill ${statusFilter === s ? "active" : ""}`}
                  style={statusFilter === s && s !== "All"
                    ? { background: STATUS_META[s]?.bg, color: STATUS_META[s]?.text, borderColor: STATUS_META[s]?.border }
                    : {}}
                  onClick={() => setStatusFilter(s)}
                >
                  {s === "All" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <div className="tbl-view-toggle">
              <button className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")} title="Grid">⊞</button>
              <button className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")} title="List">☰</button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="tbl-list-card">
              <div className="tbl-skeleton-list">{[1,2,3,4].map(i => <div className="tbl-skeleton-row" key={i} />)}</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="tbl-list-card">
              <div className="tbl-empty">
                <LayoutGrid size={40} strokeWidth={1.2} />
                <p>No tables found</p>
                <span>{search || statusFilter !== "All" ? "Try clearing your filters" : "Click \"Add Table\" to get started"}</span>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="tbl-grid">
              {filtered.map(t => {
                const sm = STATUS_META[t.status] || STATUS_META.available;
                return (
                  <div key={t.id} className={`tbl-grid-card ${t.status}`}>
                    <div className="tbl-card-top">
                      <span className="tbl-status-dot-badge" style={{ background: sm.bg, color: sm.text }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: sm.dot, display: "inline-block" }} />
                        {t.status}
                      </span>
                      <div className="tbl-card-actions">
                        <button className="tbl-btn-edit" onClick={() => setModal({ type: "edit", table: t })}><Edit2 size={13} /></button>
                        <button className="tbl-btn-delete" onClick={() => setModal({ type: "delete", table: t })}><Trash2 size={13} /></button>
                      </div>
                    </div>
                    <h3 className="tbl-card-name">{t.table_name}</h3>
                    <div className="tbl-card-cap"><Users size={14} />{t.capacity} seats</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="tbl-list-card">
              <div className="tbl-list-header">
                <h3>Tables <span className="tbl-count-badge">{filtered.length}</span></h3>
              </div>
              <div className="tbl-table-wrap">
                <table className="tbl-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Table Name</th>
                      <th>Capacity</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t, idx) => {
                      const sm = STATUS_META[t.status] || STATUS_META.available;
                      return (
                        <tr key={t.id}>
                          <td className="tbl-td-num">{String(idx + 1).padStart(2, "0")}</td>
                          <td className="tbl-td-name">{t.table_name}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b" }}>
                              <Users size={13} color="#94a3b8" />{t.capacity}
                            </div>
                          </td>
                          <td>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600,
                              padding: "3px 10px", borderRadius: 20, background: sm.bg, color: sm.text, border: `1px solid ${sm.border}` }}>
                              <span style={{ width: 7, height: 7, borderRadius: "50%", background: sm.dot, display: "inline-block" }} />
                              {t.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button className="tbl-btn-edit" onClick={() => setModal({ type: "edit", table: t })}><Edit2 size={14} /></button>
                              <button className="tbl-btn-delete" onClick={() => setModal({ type: "delete", table: t })}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {(modal?.type === "create" || modal?.type === "edit") && (
          <TableModal mode={modal.type} table={modal.table} onClose={() => setModal(null)} onSave={handleSave} />
        )}
        {modal?.type === "delete" && (
          <DeleteModal 
            table={modal.table} 
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