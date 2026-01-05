import React from 'react';
import './CardBack.css';

const CardBack = () => {
    return (
        <div className="card-back">
            <div className="card-back-pattern">
                {/* 
                   We use a pseudo-element or background-image in CSS for the pattern 
                   to keep DOM clean. But for a repeated text effect that rotates, 
                   we might need actual elements or a very clever SVG background.
                   
                   Let's use a CSS background gradient pattern combined with a central logo.
                */}
                <div className="pattern-text">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <span key={i}>QuartettNation </span>
                    ))}
                </div>
            </div>
            <div className="card-back-logo">
                QN
            </div>
        </div>
    );
};

export default CardBack;
