import React from 'react';
import { X, AlertCircle, Trash2 } from 'lucide-react';
import './DeleteItemModal.css';

export default function DeleteItemModal({ isOpen, onClose, onSubmit, item }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(item.id);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} onKeyDown={handleKeyDown}>
      <div className="modal-container modal-small">
        <div className="modal-header">
          <div className="modal-icon-title">
            <AlertCircle size={24} className="alert-icon" />
            <h2 className="modal-title">Delete Item</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          <p className="delete-message">
            Are you sure you want to delete <strong>{item?.name}</strong>? This action cannot be undone.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="modal-buttons-danger">
          <button type="button" className="btn btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-delete">
            <Trash2 size={16} />
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
