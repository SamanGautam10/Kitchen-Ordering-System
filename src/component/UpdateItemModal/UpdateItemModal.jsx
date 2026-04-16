import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './UpdateItemModal.css';

export default function UpdateItemModal({ isOpen, onClose, onSubmit, item }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: ''
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        price: item.price || '',
        category: item.category || '',
        description: item.description || ''
      });
    }
  }, [item, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.price && formData.category) {
      onSubmit(formData);
    }
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
      <div className="modal-container modal-medium">
        <div className="modal-header">
          <h2 className="modal-title">Update Item</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Item Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter item name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Enter price"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              <option value="Food">Food</option>
              <option value="Beverage">Beverage</option>
              <option value="Dessert">Dessert</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter item description"
              rows="4"
            />
          </div>

          <div className="modal-buttons">
            <button type="button" className="btn btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-update">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
