import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const TablesContext = createContext();

export const useTables = () => {
  const context = useContext(TablesContext);
  if (!context) {
    throw new Error("useTables must be used within TablesProvider");
  }
  return context;
};

export const TablesProvider = ({ children }) => {
    const Backend = import.meta.env.VITE_BACKEND;

  const [tables, setTables] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchTables = (force = false) => {
    if (!force && tables !== null) return;

    setLoading(true);
    setError(false);

    const startTime = Date.now();

    axios
      .get(`${Backend}Tables/all/`)
      .then((res) => {
        setTables(res.data);
      })
      .catch(() => {
        setTables([]);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // ➕ Add table (placeholder)
  const addTable = (tableData) => {
    // TODO: API call
  };

  // ❌ Remove table
  const removeTable = (tableId) => {
    setTables((prev) => prev?.filter((t) => t.id !== tableId) || []);
    if (selectedTable?.id === tableId) setSelectedTable(null);
    // TODO: API call
  };

  // ✏️ Update table
  const updateTable = (tableId, updates) => {
    setTables((prev) =>
      prev?.map((t) =>
        t.id === tableId ? { ...t, ...updates } : t
      ) || []
    );
    // TODO: API call
  };

  // 🔍 Helpers
  const getTableById = (tableId) =>
    tables?.find((t) => t.id === tableId);

  const getAvailableTables = () =>
    tables?.filter((t) => t.status === "available") || [];

  const getOccupiedTables = () =>
    tables?.filter((t) => t.status === "occupied") || [];

  return (
    <TablesContext.Provider
      value={{
        tables,
        loading,
        error,
        fetchTables, // 👈 use this to refetch (e.g., after API sleep)
        addTable,
        removeTable,
        updateTable,
        getTableById,
        getAvailableTables,
        getOccupiedTables,
        selectedTable,
        setSelectedTable,
      }}
    >
      {children}
    </TablesContext.Provider>
  );
};