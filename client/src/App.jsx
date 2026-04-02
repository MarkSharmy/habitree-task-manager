import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Landing from './pages/Landing/Landing';
import Dashboard from './pages/Dashboard/Dashboard';
import NotFound from './pages/NotFound/NotFound';

function App() {

  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route path="/" element={<Landing />} />

        {/* --- Private Routes --- */}
        <Route element={ <MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
            {/* <Route path="/tasks" element={<TaskList />} /> */}
          </Route>

        {/* Redirect unknown routes */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  )
}

export default App
