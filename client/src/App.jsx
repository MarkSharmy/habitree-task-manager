import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Landing from './pages/Landing/Landing';
import Dashboard from './pages/Dashboard/Dashboard';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import TaskInventory from './pages/TaskInventory/TaskInventory';

import NotFound from './pages/NotFound/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';


function App() {

  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* --- Private Routes --- */}
        <Route element={ <ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<TaskInventory />} />
        </Route>

        {/* Redirect unknown routes */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  )
}

export default App
