import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Calendar, Clock, Tag, Folder } from 'lucide-react';
import { assignTaskToDate } from '../../../store/slices/plannerSlice';

import Logo from '../../../assets/logo.png';
import './schedulerModal.css';

const SchedulerModal = ({ isOpen, onClose, task }) => {
    const dispatch = useDispatch();
    const { scheduling } = useSelector((state) => state.planner);

    const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
    const [scheduleTime, setScheduleTime] = useState('08:00');
    const [comments, setComments] = useState('');

    useEffect(() => {
        if (isOpen) {
            setScheduleDate(new Date().toISOString().split('T')[0]);
            setScheduleTime('08:00');
            setComments('');
        }
    }, [isOpen, task]);

    if (!isOpen || !task) return null;

    const handleAddToPlanner = async () => {
        try {
            const payload = {
                date: scheduleDate,
                taskId: task.parentId || task._id,
                subtaskId: task.parentId ? task._id : null,
                time: scheduleTime,
                comments,
            };

            if (!payload.taskId) {
                console.error('Error: taskId is missing.');
                return;
            }

            await dispatch(assignTaskToDate(payload)).unwrap();
            onClose();
        } catch (error) {
            console.error('Scheduling failed:', error);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="schedule-modal-content">
                <header className="modal-header">
                    <div className="modal-logo">
                        <img src={Logo} alt="Logo" style={{ height: '2rem' }} />
                        Scheduler
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} strokeWidth={2} />
                    </button>
                </header>

                <div className="modal-body">
                    <h1 className="task-display-title">{task.title}</h1>

                    <div className="meta-info-row">
                        <div className="meta-pill">
                            <Tag size={14} />
                            <span>Category:</span>
                            <span className="value-badge">{task.category}</span>
                        </div>
                        <div className="meta-pill">
                            <Folder size={14} />
                            <span>Group:</span>
                            <span className="value-badge">{task.groupId?.name}</span>
                        </div>
                    </div>

                    <div className="scheduling-controls">
                        <div className="input-field">
                            <label><Calendar size={16} /> Schedule Date:</label>
                            <input
                                type="date"
                                value={scheduleDate}
                                onChange={(e) => setScheduleDate(e.target.value)}
                                disabled={scheduling}
                            />
                        </div>
                        <div className="input-field">
                            <label><Clock size={16} /> Schedule Time:</label>
                            <input
                                type="time"
                                value={scheduleTime}
                                onChange={(e) => setScheduleTime(e.target.value)}
                                disabled={scheduling}
                            />
                        </div>
                    </div>

                    <div className="comments-area">
                        <label>Comments</label>
                        <textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Add notes for this scheduled instance..."
                            disabled={scheduling}
                        />
                    </div>
                </div>

                <footer className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button
                        className="btn-add-planner"
                        onClick={handleAddToPlanner}
                        disabled={scheduling}
                    >
                        {scheduling ? 'Adding...' : 'Add to Planner'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default SchedulerModal;