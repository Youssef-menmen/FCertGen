import React, { useEffect } from 'react';
import './StatusMessage.css';

export default function StatusMessage({ type='info', text, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`status-message status-message--${type}`} role="alert">
      <span className="status-icon">
        {type==='success'?'✅':type==='error'?'❌':'ℹ️'}
      </span>
      <span className="status-text">{text}</span>
      <button className="status-close" onClick={onClose}>✕</button>
    </div>
  );
}
