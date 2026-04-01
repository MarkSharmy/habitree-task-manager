import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDailyPlanner } from '../../store/slices/taskSlice';
import TaskItem from '../../components/Dashboard/TaskItem';
import EfficiencyWidget from '../../components/Dashboard/EfficiencyWidget';
import './Dashboard.css';
import { div } from 'framer-motion/client';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { tasks, subtasks } = useSelector((state) => state.tasks.planner );

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        dispatch(fetchDailyPlanner(today));
    }, [dispatch]);

    return (
        <div className="dashboard-grid">
            {/* Center Section: Planner */}
            <section className="planner-section">
                <div className="planner-header">
                    <h2>Today's Tasks</h2>
                    <div className="date-picker">
                        <span>Wednesday, Apr 1st</span>
                    </div>
                    <button className="quick-add-btn">+ Quick Add</button>
                </div>

                <div className="planner-card">
                    <div className="card-header">
                        <span className="icon">📅</span> Scheduler
                        <button className="start-session-btn">Start Session</button>
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
        </div>
    );
}

export default Dashboard;