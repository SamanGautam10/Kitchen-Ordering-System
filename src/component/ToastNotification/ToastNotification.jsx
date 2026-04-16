import React, { useEffect } from 'react';
import { X, Check, AlertCircle, Info } from 'lucide-react';
import './ToastNotification.css';

export default function ToastNotification({ message, type = 'info', onClose, autoClose = true }) {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertCircle size={20} />;
      case 'info':
      default:
        return <Info size={20} />;
    }
  };

  return (
    <div className={`toast-notification toast-${type}`}>
      <div className="toast-icon">
        {getIcon()}
      </div>
      <div className="toast-message">
        {message}
      </div>
      <button className="toast-close-btn" onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <ToastNotification
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          autoClose={toast.autoClose !== false}
        />
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = React.useState([]);
  const [toastCounter, setToastCounter] = React.useState(0);

  const addToast = (message, type = 'info', autoClose = true) => {
    const id = toastCounter + 1;
    setToastCounter(id);
    setToasts(prev => [...prev, { id, message, type, autoClose }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return { toasts, addToast, removeToast };
}
