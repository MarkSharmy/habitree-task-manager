import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDailyPlanner } from '../../store/slices/taskSlice';
import TaskItem from '../../components/dashboard/TaskItem';
import EfficiencyWidget from '../../components/dashboard/EfficiencyWidget';
import './dashboard.css';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import SessionSettings from '../../components/dashboard/session/SessionSettings';

const Dashboard = () => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [activeSession, setActiveSession] = useState(null);

    const dispatch = useDispatch();
    const { tasks, subtasks } = useSelector((state) => state.tasks.planner );

    const calculateEfficiency = (sessions) => {

    }

    const handleStartSession = (totalSeconds) => {
        setActiveSession({
            startTime: Date.now(),
            duration: totalSeconds,
            remaining: totalSeconds
        });

        setModalOpen(false);
    }

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        //dispatch(fetchDailyPlanner(today));
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
                            <button className="start-session-btn" onClick={() => setModalOpen(true)}>Start Session</button>
                        </div>
                        <div className="task-list">
                            {tasks.map(task => (
                                <TaskItem key={task._id} item={task}/>
                            ))}
                            {subtasks.map(sub => (
                                <TaskItem key={sub._id} item={sub} isSubtask={true}/>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Right Section: Stats */}
                <aside className="stats-sidebar">
                    <EfficiencyWidget score={0.69}/>

                    <div className="stat-card">
                        <h4>Todal Productivity Time</h4>
                        <p className="big-stat">5h 30m</p>
                        <small>Sums all completed sessions.</small>
                    </div>

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
                <SessionSettings
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    onStart={handleStartSession}
                />
            </div>
        </div>
    );
}

export default Dashboard;