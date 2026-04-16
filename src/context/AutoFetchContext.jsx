// src/context/AutoFetchContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AutoFetchContext = createContext();

export const AutoFetchProvider = ({ children }) => {
  const [data, setData] = useState([]);      
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BACKEND_URL = 'https://aagamanmainali35-kot-x.onrender.com/';

  useEffect(() => {
    let intervalId;

    const fetchData = () => {
      axios.get(BACKEND_URL)
        .then(res => {
          setData(res.data);
          setError(null);   
          setLoading(false);
        })
        .catch(err => {
          setError(err);
          setLoading(false);
          console.error(err);
        });
    };

    fetchData();
    intervalId = setInterval(fetchData, 600000); 

    return () => clearInterval(intervalId);
  }, []);

  return (
    <AutoFetchContext.Provider value={{ data, loading, error }}>
      {children}
    </AutoFetchContext.Provider>
  );
};

export const useAutoFetch = () => useContext(AutoFetchContext);