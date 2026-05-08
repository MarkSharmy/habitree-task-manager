import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Landing from './pages/Landing/Landing';
import Dashboard from './pages/Dashboard/Dashboard';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import TaskInventory from './pages/TaskInventory/TaskInventory';
import TaskDetails from './pages/TaskDetails/TaskDetails';
import ProjectManager from './pages/ProjectManager/ProjectManager';
import ProjectKanban from './pages/ProjectKanban/ProjectKanban';
import Profile from './pages/Profile/Profile';
import Analytics from './pages/Analytics/Analytics';
import Calendar from './pages/Calendar/Calendar';
import RoadmapList from './pages/Roadmaps/RoadmapList';
import RoadmapCanvas from './pages/Roadmaps/RoadmapCanvas';
import NotFound from './pages/NotFound/NotFound';
import ServerError from './pages/Error/ServerError';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
    return (
        <Router>
            <Routes>
                {/* Public */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Private */}
                <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/tasks" element={<TaskInventory />} />
                    <Route path="/tasks/:id" element={<TaskDetails />} />
                    <Route path="/projects" element={<ProjectManager />} />
                    <Route path="/projects/:id" element={<ProjectKanban />} />
                    <Route path="/settings" element={<Profile />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/roadmaps" element={<RoadmapList />} />
                    <Route path="/roadmaps/:id" element={<RoadmapCanvas />} />
                </Route>

                <Route path="/server-error" element={<ServerError />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
}

export default App;