import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import WorkersList from './pages/WorkersList';
import AttendanceReport from './pages/AttendanceReport';
import LateReports from './pages/LateReports';
import Navbar from './components/Navbar';
import './output.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar user={user} onLogout={logout} />}
        <Toaster position="top-right" />
        
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login onLogin={login} /> : <Navigate to={user.position === 'Administrator' ? '/admin' : '/dashboard'} />} 
          />
          <Route 
            path="/register" 
            element={<Register />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <WorkerDashboard user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin" 
            element={user?.position === 'Administrator' ? <AdminDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/workers" 
            element={user?.position === 'Administrator' ? <WorkersList /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/attendance" 
            element={user?.position === 'Administrator' ? <AttendanceReport /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin/late-reports" 
            element={user?.position === 'Administrator' ? <LateReports /> : <Navigate to="/login" />} 
          />
          <Route path="/" element={<Navigate to={user ? (user.position === 'Administrator' ? '/admin' : '/dashboard') : '/login'} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;