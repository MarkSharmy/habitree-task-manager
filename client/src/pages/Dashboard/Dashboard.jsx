import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

import SessionSettings from '../../components/modals/Session/SessionSettings';
import SessionModal from '../../components/modals/Session/SessionModal';
import TaskItem from '../../components/dashboard/TaskItem/TaskItem';
import EfficiencyWidget from '../../components/dashboard/EfficiencyWidget/EfficiencyWidget';

import { fetchTodayStats } from '../../store/slices/statsSlice';
import { saveWorkSession } from '../../store/slices/sessionSlice';

import './dashboard.css';

const Dashboard = () => {
    const dispatch = useDispatch();
    
    const { tasks, subtasks } = useSelector((state) => state.tasks );
    const { efficiencyScore, totalProductivityMinutes } = useSelector((state) => state.stats);

    const [isSettingsOpen, setSettingsOpen] = useState(false);
    const [isActiveModalOpen, setActiveModalOpen] = useState(false);
    const [sessionTime, setSessionTime] = useState(0);

    const formatMinutes = (mins) => {
        if (!mins) mins = 0;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`
    }

    const handleStartSession = (totalSeconds) => {
        setSessionTime(totalSeconds);
        setSettingsOpen(false);
        setActiveModalOpen(true);
    }

    const handleSessionFinish = (sessionData) => {
        dispatch(saveWorkSession(sessionData));
        setActiveModalOpen(false);
    };

    useEffect(() => {
        dispatch(fetchTodayStats());
    }, [dispatch]);

    return (

        <div className="dashboard-container">
            <div className="planner-header">
                <h2>Today's Tasks</h2>
                <div className="date-picker">
                    <ChevronLeft size={20} strokeWidth={2} className="date-picker-icon"/>
                    <Calendar size={16} strokeWidth={2}/>
                    <span>Wednesday, Apr 1st</span>
                    <ChevronRight size={20} strokeWidth={2} className="date-picker-icon"/>
                </div>
                <button className="quick-add-btn">+ Quick Add</button>
            </div>
            <div className="dashboard-grid">
                
                {/* Center Section: Planner */}
                <section className="planner-section">
                    <div className="planner-card">
                        <div className="card-header">
                            <div>
                                <span className="icon"><Calendar size={16} strokeWidth={2}/></span> <span>Scheduler</span>
                            </div>
                            <button className="start-session-btn" onClick={() => setSettingsOpen(true)}>Start Session</button>
                        </div>
                        <div className="task-list">
                            
                        </div>
                    </div>
                </section>

                {/* Right Section: Stats */}
                <aside className="stats-sidebar">
                    <div className="stat-card">
                        <h4>Todal Productivity Time</h4>
                        <p className="big-stat">{formatMinutes(totalProductivityMinutes)}</p>
                        <small>Sums all completed sessions.</small>
                    </div>

                    <EfficiencyWidget score={efficiencyScore}/>

                    <div className="stat-card">
                        <h4>Weekly Overview</h4>
                        <div className="mini-chart-placeholder"></div>
                    </div>

                    <div className="stat-card">
                        <h4>Recent Activity</h4>
                        <ul className="activity-list">
                            <li>Completed: Read Forex for Beginners Chapter 1</li>
                        </ul>
                    </div>
                </aside>
            </div>

            <SessionSettings
                isOpen={isSettingsOpen}
                onClose={() => setSettingsOpen(false)}
                onStart={handleStartSession}
            />

            <SessionModal
                isOpen={isActiveModalOpen}
                initialSeconds={sessionTime}
                onFinish={handleSessionFinish}
                onClose={() => setActiveModalOpen(false)}
            />
        </div>
    );
}

export default Dashboard;