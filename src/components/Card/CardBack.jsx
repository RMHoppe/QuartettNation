import React from 'react';
import './CardBack.css';

const CardBack = () => {
    // Generate rows for the brick pattern
    const rows = Array.from({ length: 24 }); // Enough to cover vertical
    const textRepeats = Array.from({ length: 8 }); // Enough to cover horizontal in each row

    return (
        <div className="card-back-content">
            <div className="card-back-pattern">
                {rows.map((_, rowIndex) => (
                    <div key={rowIndex} className="pattern-row">
                        {textRepeats.map((_, i) => (
                            <span key={i} className="pattern-text-item">QuartettNation</span>
                        ))}
                    </div>
                ))}
            </div>
            <div className="card-back-logo">
                QN
            </div>
        </div>
    );
};

export default CardBack;
