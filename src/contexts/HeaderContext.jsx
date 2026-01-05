import React, { createContext, useContext, useState } from 'react';

const HeaderContext = createContext({
    title: 'QuartettNation',
    setTitle: () => { },
    backTo: null,
    setBackTo: () => { }, // Can be a path string OR a function
    customContent: null,
    setCustomContent: () => { }
});

export const HeaderProvider = ({ children }) => {
    const [title, setTitle] = useState('QuartettNation');
    const [backTo, setBackTo] = useState(null);
    const [customContent, setCustomContent] = useState(null);

    return (
        <HeaderContext.Provider value={{
            title, setTitle,
            backTo, setBackTo,
            customContent, setCustomContent
        }}>
            {children}
        </HeaderContext.Provider>
    );
};

export const useHeader = () => useContext(HeaderContext);
