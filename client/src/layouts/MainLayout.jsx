import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    ListTodo,
    BarChart3,
    Map,
    Calendar,
    PieChart,
    Settings,
    Bell,
    Search,
    BarChart,
    Kanban,
    LogOut
} from 'lucide-react';
import Logo from '../assets/logo.png';
import Avatar from '../assets/profile.png';
import './mainlayout.css';

const MainLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (path) => location.pathname === path ? 'active' : '';

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    }

    return (
        <div className="app-shell">
            <aside className="app-sidebar">
                <div className="sidebar-header">
                    <div className="logo-icon">
                        <img src={Logo} alt="logo" style={ {height: '2rem'}}/>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/dashboard" className={`nav-item ${isActive('/dashboard')}`}>
                        <LayoutDashboard size={20} strokeWidth={2} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/tasks" className={`nav-item ${isActive('/tasks')}`}>
                        <ListTodo size={20} strokeWidth={2} />
                        <span>All Tasks</span>
                    </Link>
                    <Link to="/projects" className={`nav-item ${isActive('/project')}`}>
                        <Kanban size={20} strokeWidth={2} />
                        <span>Projects</span>
                    </Link>
                    <Link to="/roadmaps" className={`nav-item ${isActive('/roadmaps')}`}>
                        <Map size={20} strokeWidth={2} />
                        <span>Roadmaps</span>
                    </Link>
                    <Link to="/calendar" className={`nav-item ${isActive('/calendar')}`}>
                        <Calendar size={20} strokeWidth={2} />
                        <span>Calendar</span>
                    </Link>
                    <Link to="/analytics" className={`nav-item ${isActive('/analytics')}`}>
                        <PieChart size={20} strokeWidth={2} />
                        <span>Analytics</span>
                    </Link>
                </nav>
                
                <div className="sidebar-footer">
                    <Link to="/settings" className={`nav-item ${isActive('/settings')}`}>
                        <Settings size={20} strokeWidth={2} />
                        <span>Settings</span>
                    </Link>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            <div className="content-area">
                <header className="app-header">
                    <div className="header-left">
                        <h3>Habitree Task Manager</h3>
                    </div>
                    <div className="header-right">
                        <div className="icon-btn"><Search size={18} /></div>
                        <div className="icon-btn notification-bell">
                            <Bell size={18} />
                            <span className="dot"></span>
                        </div>
                        <div className="user-profile">
                            <img src={Avatar} alt="User" className="avatar" style={{ height: '2rem'}}/>
                            <div className="user-text">
                                <span className="user-name">Mark Sharmy</span>
                                <span className="user-rank">Master</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="page-container">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default MainLayout;