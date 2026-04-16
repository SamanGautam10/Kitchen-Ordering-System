import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Receipt, User, Tag, CheckCircle, LayoutGrid,
  Clock, Printer, ChevronDown, AlertCircle, Loader,
} from "lucide-react";
import Sidebar from "../component/Sidebar/Sidebars";
import "../assets/css/Billing.css";
import { useTables } from "../context/TablesContext";
import { useOrder } from "../context/OrderItemContext";
import { useNavigate } from 'react-router-dom';

export default function Billing() {
  const Backend = import.meta.env.VITE_BACKEND;
  const [activeView, setActiveView] = useState("billing");

  const { tables, selectedTable, setSelectedTable } = useTables();
  const { orderItems, clearOrder, errorMessage: contextErrorMessage, orderId } = useOrder();

  // Form state
  const [billedTo, setBilledTo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [vat, setVat] = useState(13);
  const [tablePickerOpen, setTablePickerOpen] = useState(false);

  // UI state
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // Handle nested Item structure in calculations
  const subtotal = orderItems.reduce((s, i) => {
    const price = i.Item?.price || i.price || 0;
    const quantity = i.quantity || 0;
    return s + Number(price) * quantity;
  }, 0);
  
  const vatAmount = subtotal * (vat / 100);
  const discountAmt = subtotal * (discount / 100);
  const total = subtotal + vatAmount - discountAmt;

  useEffect(() => {
    console.log('📦 orderItems from context:', orderItems);
    console.log('🪑 selectedTable:', selectedTable);
  }, [orderItems, selectedTable]);

  // Handle checkout - API call here
  const handleCheckout = async () => {
  if (!selectedTable?.id) {
    setError("Please select a table first.");
    return;
  }
  if (!billedTo.trim()) {
    setError("Please enter the customer name.");
    return;
  }
  if (orderItems.length === 0) {
    setError("No items in the current order.");
    return;
  }

  setError(null);
  setIsSubmitting(true);

  try {
    const payload = {
      Order_id: orderId,
      Name: billedTo,
      Discount: discount.toString(),
      VAT: vat.toString()
    };

    const response = await axios.post(`${Backend}Bill/create-bill/`, payload);

    const billData = response.data;

    // ✅ SUCCESS STATE
    setSuccess({
      Billed_to: billData.Name || billedTo,
      VAT: billData.VAT || vat,
      Discount: billData.Discount || discount,
      Bill_Total: billData.Bill_Total || total.toFixed(2),
      Billing_Date: billData.Billing_Date || new Date().toISOString(),
      orderItems: [...orderItems],
      billDetails: billData
    });

    // ✅ IMPORTANT: update context ONLY (no extra API call)
    setSelectedTable(prev =>
      prev ? { ...prev, status: "available" } : null
    );

    // ✅ ALSO update tables list (this is critical)
    if (tables && tables.length > 0) {
      const updatedTables = tables.map(t =>
        t.id === selectedTable.id
          ? { ...t, status: "available" }
          : t
      );

      // ⚠️ only if your context exposes this
      if (typeof setTables === "function") {
        setTables(updatedTables);
      }
    }

    // ✅ clear order AFTER success snapshot
    clearOrder();

    // reset form
    setBilledTo("");
    setDiscount(0);
    setVat(13);

  } catch (err) {
    console.error('❌ Bill submission error:', err);

    const errorMsg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "Failed to generate bill. Please try again.";

    setError(errorMsg);

  } finally {
    setIsSubmitting(false);
  }
};

  const handlePrint = () => {
    const printDialogClosed = () => {
      navigate('/');
    };
    
    // Listen for print media query changes
    const mediaQueryList = window.matchMedia('print');
    mediaQueryList.addEventListener('change', (mql) => {
      if (!mql.matches) {
        printDialogClosed();
      }
    });
    
    window.print();
  };

  const resetBill = () => {
    setSuccess(null);
    setError(null);
    setBilledTo("");
    setDiscount(0);
    setVat(13);
    setSelectedTable(null);
    window.location.href="/"
  };

  const occupiedTables = (tables || []).filter((t) => t.status === "occupied");

  // Helper functions for nested Item structure
  const getItemName = (item) => item.Item?.item_name || item.name || "Unknown Item";
  const getItemPrice = (item) => item.Item?.price || item.price || 0;
  const getItemQuantity = (item) => item.quantity || 0;

  // Success View - Full page without sidebar
  if (success) {
    const receiptItems = success.orderItems || orderItems;
    
    return (
      <div className="bill-full-page">
        <div className="bill-receipt full-page-receipt" id="printable-receipt">
          <div className="receipt-header">
            <div className="receipt-check">
              <CheckCircle size={40} color="#22c55e" />
            </div>
            <h2 className="receipt-title">Bill Generated</h2>
            <p className="receipt-subtitle">Payment successful</p>
          </div>

          <div className="receipt-divider" />

          <div className="receipt-meta">
            <div className="receipt-meta-row">
              <span className="rml">Billed To</span>
              <span className="rmr">{success.Billed_to}</span>
            </div>
            <div className="receipt-meta-row">
              <span className="rml">Table</span>
              <span className="rmr">{selectedTable?.table_name || "—"}</span>
            </div>
            <div className="receipt-meta-row">
              <span className="rml">Date</span>
              <span className="rmr">
                {new Date(success.Billing_Date || Date.now()).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="receipt-divider dashed" />

          <div className="receipt-items">
            {receiptItems.length > 0 ? (
              receiptItems.map((item, idx) => (
                <div className="receipt-item-row" key={item.OrderItemID || item.id || idx}>
                  <span className="ri-name">{getItemName(item)}</span>
                  <span className="ri-qty">×{getItemQuantity(item)}</span>
                  <span className="ri-price">
                    Rs. {(Number(getItemPrice(item)) * getItemQuantity(item)).toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="receipt-no-items">Items cleared from context.</p>
            )}
          </div>

          <div className="receipt-divider dashed" />

          <div className="receipt-totals">
            <div className="receipt-total-row">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toFixed(2)}</span>
            </div>
            <div className="receipt-total-row">
              <span>VAT ({success.VAT}%)</span>
              <span>Rs. {(subtotal * (Number(success.VAT) / 100)).toFixed(2)}</span>
            </div>
            {Number(success.Discount) > 0 && (
              <div className="receipt-total-row discount">
                <span>Discount ({success.Discount}%)</span>
                <span>- Rs. {(subtotal * (Number(success.Discount) / 100)).toFixed(2)}</span>
              </div>
            )}
            <div className="receipt-total-row grand-total">
              <span>Total</span>
              <span>Rs. {Number(success.Bill_Total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bill-actions no-print">
          <button className="quick-action-btn" onClick={handlePrint}>
            <Printer size={16} /> Print Receipt
          </button>
          <button className="submit-button" onClick={resetBill}>
            New Bill
          </button>
        </div>
      </div>
    );
  }

  // Main Billing View
  return (
    <div className="app-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <main className="main-content">
        <div className="billing-page">
          <div className="billing-header">
            <h1 className="admin-title">Billing</h1>
            <p className="admin-subtitle">Checkout &amp; invoice generation</p>
          </div>

          <div className="billing-grid">
            {/* LEFT: Order details */}
            <div className="billing-left">
              {/* Table selector */}
              <div className="admin-card billing-section table-card-section">
                <div className="admin-card-header">
                  <h3>Select Table</h3>
                  <LayoutGrid size={18} color="#64748b" />
                </div>

                <div className="table-picker-wrap">
                  <button
                    className="table-picker-trigger"
                    onClick={() => setTablePickerOpen((o) => !o)}
                  >
                    <LayoutGrid size={16} color="#64748b" />
                    <span>
                      {selectedTable ? selectedTable.table_name : "Choose a table…"}
                    </span>
                    <ChevronDown
                      size={15}
                      style={{
                        marginLeft: "auto",
                        transition: "transform .2s",
                        transform: tablePickerOpen ? "rotate(180deg)" : "rotate(0)",
                      }}
                    />
                  </button>

                  {tablePickerOpen && (
                    <div className="table-picker-dropdown">
                      {occupiedTables.length === 0 ? (
                        <p className="table-picker-empty">No occupied tables</p>
                      ) : (
                        occupiedTables.map((t) => (
                          <button
                            key={t.id}
                            className={`table-picker-option ${selectedTable?.id === t.id ? "active" : ""}`}
                            onClick={() => { setSelectedTable(t); setTablePickerOpen(false); }}
                          >
                            <span className="tpo-dot occupied" />
                            {t.table_name}
                            <span className="tpo-cap">{t.capacity} seats</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Order items */}
              <div className="admin-card billing-section items-card-section">
                <div className="admin-card-header">
                  <h3>Order Items</h3>
                  {selectedTable && (
                    <span className="billing-table-tag">{selectedTable.table_name}</span>
                  )}
                </div>

                {orderItems.length === 0 ? (
                  <div className="billing-empty">
                    <Receipt size={36} color="#cbd5e1" strokeWidth={1.4} />
                    <p>No items in order</p>
                    <span>Select an occupied table to load its order</span>
                  </div>
                ) : (
                  <div className="billing-items-list">
                    {orderItems.map((item) => (
                      <div className="billing-item-row" key={item.OrderItemID || item.id}>
                        <div className="bir-info">
                          <span className="bir-name">{getItemName(item)}</span>
                          <span className="bir-unit">Rs. {Number(getItemPrice(item)).toFixed(2)} / unit</span>
                        </div>
                        <div className="bir-right">
                          <span className="bir-qty">×{getItemQuantity(item)}</span>
                          <span className="bir-total">
                            Rs. {(Number(getItemPrice(item)) * getItemQuantity(item)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Bill summary */}
            <div className="billing-right">
              <div className="admin-card billing-summary-card">
                <div className="admin-card-header">
                  <h3>Bill Summary</h3>
                  <Receipt size={18} color="#64748b" />
                </div>

                <div className="billing-field">
                  <label className="billing-label">
                    <User size={14} /> Billed To
                  </label>
                  <input
                    className="billing-input"
                    type="text"
                    placeholder="Customer name"
                    value={billedTo}
                    onChange={(e) => setBilledTo(e.target.value)}
                  />
                </div>

                <div className="billing-field">
                  <label className="billing-label">
                    <Receipt size={14} /> VAT (%)
                  </label>
                  <input
                    className="billing-input"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={vat}
                    onChange={(e) => setVat(Math.max(0, Math.min(100, Number(e.target.value))))}
                  />
                </div>

                <div className="billing-field">
                  <label className="billing-label">
                    <Tag size={14} /> Discount (%)
                  </label>
                  <input
                    className="billing-input"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
                  />
                </div>

                <div className="billing-divider" />

                <div className="billing-totals">
                  <div className="billing-total-row">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="billing-total-row vat-line">
                    <span>VAT ({vat}%)</span>
                    <span>Rs. {vatAmount.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="billing-total-row discount-line">
                      <span>Discount ({discount}%)</span>
                      <span>− Rs. {discountAmt.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="billing-total-row grand">
                    <span>Total</span>
                    <span>Rs. {total.toFixed(2)}</span>
                  </div>
                </div>

                {(error || contextErrorMessage) && (
                  <div className="billing-error">
                    <AlertCircle size={15} />
                    <span>{error || contextErrorMessage}</span>
                  </div>
                )}

                <button
                  className="billing-checkout-btn"
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Loader size={16} className="spin" /> Generating Bill…</>
                  ) : (
                    <><Receipt size={16} /> Generate Bill</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}