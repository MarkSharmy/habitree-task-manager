import { useEffect, useState } from 'react';
import { BarLoader } from 'react-spinners';
import { useSelector, useDispatch } from 'react-redux';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

import SessionSettings from '../../components/modals/Session/SessionSettings';
import SessionModal from '../../components/modals/Session/SessionModal';
import PlannerItem from '../../components/dashboard/PlannerItem/PlannerItem';
import EfficiencyWidget from '../../components/dashboard/EfficiencyWidget/EfficiencyWidget';
import ItemModal from '../../components/modals/Item/ItemModal';

import { fetchTodayStats } from '../../store/slices/statsSlice';
import { saveWorkSession } from '../../store/slices/sessionSlice';
import { setActiveDate, fetchPlannerByDate } from '../../store/slices/plannerSlice';

import './dashboard.css';

const Dashboard = () => {
    const dispatch = useDispatch();

    const { activeDate, dayData, loading: plannerLoading } = useSelector((state) => state.planner);
    const { efficiencyScore, totalProductivityMinutes, loading: statsLoading } = useSelector((state) => state.stats);

    const [selectedPlannerItem, setSelectedPlannerItem] = useState(null);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isSettingsOpen, setSettingsOpen] = useState(false);
    const [isActiveModalOpen, setActiveModalOpen] = useState(false);
    const [sessionTime, setSessionTime] = useState(0);

    const formatMinutes = (mins) => {
        if (!mins) mins = 0;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    };

    const formatDisplayDate = (dateStr) => {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options);
    };

    const handleDateStep = (step) => {
        const current = new Date(activeDate);
        current.setDate(current.getDate() + step);
        const dateStr = current.toISOString().split('T')[0];
        dispatch(setActiveDate(dateStr));
    };

    const handleItemClick = (entry) => {
        setSelectedPlannerItem({ ...entry, date: activeDate });
        setIsItemModalOpen(true);
    };

    const handleStatusUpdate = (id, newStatus) => {
        console.log(`Updating item ${id} to ${newStatus}`);
        setIsItemModalOpen(false);
    };

    useEffect(() => {
        dispatch(fetchPlannerByDate(activeDate));
        dispatch(fetchTodayStats());
    }, [dispatch, activeDate]);

    if (statsLoading || plannerLoading) return (
        <div className="details-loader-container">
            <BarLoader color="#3b82f6" />
            <p>Syncing Planner...</p>
        </div>
    );

    return (
        <div className="dashboard-container">
            <div className="planner-header">
                <h2>Tasks Overview</h2>
                <div className="date-picker">
                    <ChevronLeft
                        size={20}
                        className="date-picker-icon"
                        onClick={() => handleDateStep(-1)}
                    />
                    <Calendar size={16} strokeWidth={2} />
                    <span>{formatDisplayDate(activeDate)}</span>
                    <ChevronRight
                        size={20}
                        className="date-picker-icon"
                        onClick={() => handleDateStep(1)}
                    />
                </div>
                <button className="quick-add-btn">+ Quick Add</button>
            </div>

            <div className="dashboard-grid">
                <section className="planner-section">
                    <div className="planner-card">
                        <div className="card-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Calendar size={16} strokeWidth={2} />
                                <span>Scheduler</span>
                            </div>
                            <button className="start-session-btn" onClick={() => setSettingsOpen(true)}>
                                Start Session
                            </button>
                        </div>
                        <div className="task-list">
                            {dayData?.tasks?.length > 0 ? (
                                dayData.tasks.map((entry) => (
                                    <div
                                        key={entry._id}
                                        onClick={() => handleItemClick(entry)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <PlannerItem
                                            item={entry.taskId}
                                            scheduledTime={entry.time}
                                            specificSubtaskId={entry.subtaskId}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="empty-planner-state">
                                    <div className="empty-icon-container">
                                        <Calendar size={48} strokeWidth={1} />
                                    </div>
                                    <p>Your schedule is clear for today.</p>
                                    <small>Add tasks from your inventory or use "Quick Add" to get started.</small>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <aside className="stats-sidebar">
                    <div className="stat-card">
                        <h4>Total Productivity Time</h4>
                        <p className="big-stat">{formatMinutes(totalProductivityMinutes)}</p>
                        <small>Sums all completed sessions.</small>
                    </div>

                    <EfficiencyWidget score={efficiencyScore} />

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
                onStart={(seconds) => {
                    setSessionTime(seconds);
                    setSettingsOpen(false);
                    setActiveModalOpen(true);
                }}
            />

            <SessionModal
                isOpen={isActiveModalOpen}
                initialSeconds={sessionTime}
                onFinish={async (data) => {
                    try {
                        await dispatch(saveWorkSession(data)).unwrap();
                        dispatch(fetchTodayStats());
                        dispatch(fetchPlannerByDate(activeDate));
                        setActiveModalOpen(false);
                    } catch (err) {
                        console.error("Failed to save session:", err);
                    }
                }}
                onClose={() => setActiveModalOpen(false)}
            />

            <ItemModal
                isOpen={isItemModalOpen}
                onClose={() => setIsItemModalOpen(false)}
                item={selectedPlannerItem}
                activeDate={activeDate}
                onStatusUpdate={handleStatusUpdate}
            />
        </div>
    );
};

export default Dashboard;