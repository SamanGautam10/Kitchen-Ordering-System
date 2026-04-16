import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Menu from './pages/menu';
import AdminDashboard from "./pages/AdminDashboard"
import MenuManagement from "./pages/MenuManagement"
import TableManagement from "./pages/Table"
import Billing from "./pages/Billing"
function App() {
  return (

    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Order" element={<Menu />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/menu" element={<MenuManagement />} />
        <Route path="/admin/table" element={<TableManagement />} />
        <Route path="/billing" element={<Billing />} />
      </Routes>
    </Router>
  );
}

export default App;