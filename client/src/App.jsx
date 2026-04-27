import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Landing from './pages/Landing/Landing';
import Dashboard from './pages/Dashboard/Dashboard';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import TaskInventory from './pages/TaskInventory/TaskInventory';

import NotFound from './pages/NotFound/NotFound';
import ServerError from './pages/Error/ServerError';
import ProtectedRoute from './components/auth/ProtectedRoute';
import TaskDetails from './pages/TaskDetails/TaskDetails';
import ProjectManager from './pages/ProjectManager/ProjectManager';
import ProjectKanban from './pages/ProjectKanban/ProjectKanban';


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
          <Route path="/tasks/:id" element={<TaskDetails />} />
          <Route path="/projects/" element={<ProjectManager />} />
          <Route path="/projects/:id" element={<ProjectKanban />} />
        </Route>

        {/* Internal server error */}
        <Route path="/server-error" element={<ServerError />} />

        {/* Redirect unknown routes */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  )
}

export default App
