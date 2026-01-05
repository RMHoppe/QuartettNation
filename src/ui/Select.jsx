import React from 'react';
import './Select.css';

const Select = ({
    label,
    options = [],
    value,
    onChange,
    disabled = false,
    loading = false,
    placeholder = 'Select...',
    className = '',
    ...props
}) => {
    return (
        <div className={`select-wrapper ${className}`}>
            {label && <label className="select-label">{label}</label>}
            <select
                className="select-field"
                value={value}
                onChange={onChange}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? (
                    <option>Loading...</option>
                ) : (
                    <>
                        {placeholder && <option value="">{placeholder}</option>}
                        {options.map((opt) => (
                            <option key={opt.value || opt} value={opt.value || opt}>
                                {opt.label || opt}
                            </option>
                        ))}
                    </>
                )}
            </select>
        </div>
    );
};

export default Select;
