import React, { createContext, useContext, useState, useEffect } from "react";

const MenuContext = createContext();

export const useMenu = () => useContext(MenuContext);

const Backend=import.meta.env.VITE_BACKEND
export const MenuProvider = ({ children }) => {
  const [menuItems, setMenuItems] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMenu = () => {
    setLoading(true);
    fetch(`${Backend}Order/menus`)
      .then((res) => res.json())
      .then((data) => {
        // console.log(JSON.stringify(data,null,5))
          setMenuItems(data || []);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMenu();
    
  }, []);
  return (
    <MenuContext.Provider
      value={{
        menuItems,
        loading,
        error,
        fetchMenu,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};