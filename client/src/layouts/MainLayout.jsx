import { useState } from 'react';
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
    Kanban,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import Logo from '../assets/logo.png';
import Avatar from '../assets/profile.png';
import './mainlayout.css';

const MainLayout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="app-shell">
            {/* Overlay for mobile sidebar */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
                onClick={closeSidebar}
            />

            <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-icon">
                        <img src={Logo} alt="logo" style={{ height: '2rem' }} />
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/dashboard" className={`nav-item ${isActive('/dashboard')}`} onClick={closeSidebar}>
                        <LayoutDashboard size={20} strokeWidth={2} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/tasks" className={`nav-item ${isActive('/tasks')}`} onClick={closeSidebar}>
                        <ListTodo size={20} strokeWidth={2} />
                        <span>All Tasks</span>
                    </Link>
                    <Link to="/projects" className={`nav-item ${isActive('/project')}`} onClick={closeSidebar}>
                        <Kanban size={20} strokeWidth={2} />
                        <span>Projects</span>
                    </Link>
                    <Link to="/roadmaps" className={`nav-item ${isActive('/roadmaps')}`} onClick={closeSidebar}>
                        <Map size={20} strokeWidth={2} />
                        <span>Roadmaps</span>
                    </Link>
                    <Link to="/calendar" className={`nav-item ${isActive('/calendar')}`} onClick={closeSidebar}>
                        <Calendar size={20} strokeWidth={2} />
                        <span>Calendar</span>
                    </Link>
                    <Link to="/analytics" className={`nav-item ${isActive('/analytics')}`} onClick={closeSidebar}>
                        <PieChart size={20} strokeWidth={2} />
                        <span>Analytics</span>
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <Link to="/settings" className={`nav-item ${isActive('/settings')}`} onClick={closeSidebar}>
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
                    <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                            className="hamburger-btn"
                            onClick={() => setSidebarOpen(prev => !prev)}
                            aria-label="Toggle menu"
                        >
                            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                        <h3>Habitree Task Manager</h3>
                    </div>
                    <div className="header-right">
                        <div className="icon-btn"><Search size={18} /></div>
                        <div className="icon-btn notification-bell">
                            <Bell size={18} />
                            <span className="dot"></span>
                        </div>
                        <div className="user-profile">
                            <img src={Avatar} alt="User" className="avatar" style={{ height: '2rem', borderRadius: '50%' }} />
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

            {/* Mobile Bottom Navigation */}
            <nav className="mobile-bottom-nav">
                <Link to="/dashboard" className={`mobile-nav-item ${isActive('/dashboard')}`}>
                    <LayoutDashboard size={20} strokeWidth={2} />
                    <span>Home</span>
                </Link>
                <Link to="/tasks" className={`mobile-nav-item ${isActive('/tasks')}`}>
                    <ListTodo size={20} strokeWidth={2} />
                    <span>Tasks</span>
                </Link>
                <Link to="/projects" className={`mobile-nav-item ${isActive('/project')}`}>
                    <Kanban size={20} strokeWidth={2} />
                    <span>Projects</span>
                </Link>
                <Link to="/calendar" className={`mobile-nav-item ${isActive('/calendar')}`}>
                    <Calendar size={20} strokeWidth={2} />
                    <span>Calendar</span>
                </Link>
                <Link to="/analytics" className={`mobile-nav-item ${isActive('/analytics')}`}>
                    <PieChart size={20} strokeWidth={2} />
                    <span>Stats</span>
                </Link>
            </nav>
        </div>
    );
};

export default MainLayout;