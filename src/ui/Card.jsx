import React from 'react';
import './Card.css';

const Card = ({
    children,
    padding = 'md',
    hoverable = false,
    onClick,
    className = '',
    ...props
}) => {
    const classes = [
        'ui-card',
        `ui-card-p-${padding}`,
        hoverable && 'ui-card-hoverable',
        onClick && 'ui-card-clickable',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} onClick={onClick} {...props}>
            {children}
        </div>
    );
};

export default Card;
