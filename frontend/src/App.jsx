import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute'; // Import the ProtectedRoute component
import Welcome from './components/Welcome';
import About from './components/About';
import Auth from './components/Auth';
import ProfileManagement from './components/Profile Management/ProfileManagement';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/about" element={<About />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/admin" element={<AdminLogin />} />
        {/* Wrap the Dashboard route with ProtectedRoute */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/admin-dashboard" element={<ProtectedRoute element={<AdminDashboard />} adminRoute={true} />} 
        
/>     <Route path="/profile" element={<ProtectedRoute element={<ProfileManagement />} />} /> </Routes>
    </Router>
  );
}

export default App;
