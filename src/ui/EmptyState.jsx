import React from 'react';
import './EmptyState.css';

const EmptyState = ({ icon = '📦', message = 'Nothing here yet', children }) => {
    return (
        <div className="empty-state">
            <span className="empty-icon">{icon}</span>
            <p className="empty-message">{message}</p>
            {children}
        </div>
    );
};

export default EmptyState;
