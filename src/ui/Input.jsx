import React from 'react';
import './Input.css';

const Input = ({
    label,
    error,
    disabled = false,
    fullWidth = true,
    className = '',
    ...props
}) => {
    return (
        <div className={`input-wrapper ${fullWidth ? 'input-full' : ''} ${className}`}>
            {label && <label className="input-label">{label}</label>}
            <input
                className={`input-field ${error ? 'input-error' : ''}`}
                disabled={disabled}
                {...props}
            />
            {error && <span className="input-error-text">{error}</span>}
        </div>
    );
};

export default Input;
