import React, { useState, useEffect } from 'react';
import { listAvailableModels, getSelectedModel, setSelectedModel } from '../services/gemini';
import { Select } from '../ui';

const ModelSelector = () => {
    const [models, setModels] = useState([]);
    const [selected, setSelected] = useState(getSelectedModel());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        listAvailableModels().then(m => {
            setModels(m);
            setLoading(false);
        });
    }, []);

    const handleChange = (e) => {
        const model = e.target.value;
        setSelected(model);
        setSelectedModel(model);
    };

    return (
        <Select
            label="AI Model"
            value={selected}
            onChange={handleChange}
            options={models}
            loading={loading}
            className="model-selector"
        />
    );
};

export default ModelSelector;
