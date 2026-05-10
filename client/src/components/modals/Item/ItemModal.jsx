import { useDispatch, useSelector } from 'react-redux';
import { updateTaskStatus } from '../../../store/slices/taskSlice';
import { removeTaskFromPlanner, fetchPlannerByDate } from '../../../store/slices/plannerSlice';
import {
    X, Tag, Folder, Calendar, Clock,
    CheckCircle2, Archive, Trash2
} from 'lucide-react';
import Logo from '../../../assets/logo.png';
import './itemModal.css';

const ItemModal = ({ isOpen, onClose, item, activeDate }) => {
    const dispatch = useDispatch();
    const { profile } = useSelector(state => state.user);

    if (!isOpen || !item) return null;

    const task = item.taskId;
    const isSubtask = !!item.subtaskId;
    const isCompleted = task?.status === 'Completed';

    /* Mark as complete — stays in planner, visually highlighted */
    const handleComplete = async () => {
        if (!isSubtask) {
            await dispatch(updateTaskStatus({ id: task._id, status: 'Completed' })).unwrap();
        }
        // Refetch the planner so dayData.tasks gets the updated task status,
        // triggering an immediate re-render of PlannerItem without a page refresh
        await dispatch(fetchPlannerByDate(activeDate));
        onClose();
    };

    /* Shelve — remove from planner and mark task as Shelved */
    const handleShelve = async () => {
        await dispatch(removeTaskFromPlanner({ date: activeDate, entryId: item._id }));
        if (!isSubtask) {
            await dispatch(updateTaskStatus({ id: task._id, status: 'Shelved' }));
        }
        onClose();
    };

    /* Remove — pulls it off the planner list only, no status change */
    const handleRemove = async () => {
        await dispatch(removeTaskFromPlanner({ date: activeDate, entryId: item._id }));
        onClose();
    };

    const formatFullDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    return (
        <div className="modal-overlay">
            <div className="item-modal-content">
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
                    {/* Completed banner */}
                    {isCompleted && (
                        <div className="completed-status-banner">
                            <CheckCircle2 size={16} />
                            This task has been marked as completed.
                        </div>
                    )}

                    <h1 className={`task-display-title ${isCompleted ? 'is-completed' : ''}`}>
                        {task?.title}
                    </h1>

                    <div className="meta-info-grid">
                        <div className="meta-pill">
                            <Tag size={14} />
                            <span className="label">Category:</span>
                            <span className="value-badge">{task?.category}</span>
                        </div>
                        <div className="meta-pill">
                            <Folder size={14} />
                            <span className="label">Group:</span>
                            <span className="value-badge">{task?.groupId?.name || '—'}</span>
                        </div>
                    </div>

                    <div className="time-info-row">
                        <div className="time-pill">
                            <Calendar size={16} />
                            <span>{formatFullDate(item.date)}</span>
                        </div>
                        <div className="time-pill">
                            <Clock size={16} />
                            <span>{item.time || '—'}</span>
                        </div>
                    </div>

                    <div className="detail-list">
                        <div className="detail-item">
                            <span className="detail-label">Owner:</span>
                            <span className="detail-value">{profile?.username || '—'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Subtask:</span>
                            <span className="detail-value">{isSubtask ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Status:</span>
                            <span className={`detail-value status-text ${isCompleted ? 'completed' : ''}`}>
                                {task?.status}
                            </span>
                        </div>
                    </div>

                    <div className="action-footer">
                        <button
                            className="btn-action complete"
                            onClick={handleComplete}
                            disabled={isCompleted}
                            title={isCompleted ? 'Already completed' : 'Mark as complete'}
                        >
                            <CheckCircle2 size={16} />
                            {isCompleted ? 'Completed' : 'Complete'}
                        </button>

                        <button className="btn-action shelve" onClick={handleShelve}>
                            <Archive size={16} /> Shelve
                        </button>

                        <button className="btn-action remove" onClick={handleRemove}>
                            <Trash2 size={16} /> Remove
                        </button>

                        <button className="btn-action cancel" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemModal;