import { useDispatch } from 'react-redux';
import { updateTaskStatus } from '../../../store/slices/taskSlice';
import { removeTaskFromPlanner } from '../../../store/slices/plannerSlice';
import { 
    X, Tag, Folder, Calendar, Clock, 
    CheckCircle2, Archive, Trash2 
} from 'lucide-react';
import Logo from '../../../assets/logo.png';
import './itemModal.css';

const ItemModal = ({ isOpen, onClose, item, activeDate }) => {

    if (!isOpen || !item) return null;

    const task = item.taskId;
    const isSubtask = !!item.subtaskId;

    const dispatch = useDispatch();

    const handleComplete = async () => {
        if (isSubtask) {
            // Logic for subtasks if needed
            console.log("Flipping subtask isCompleted");
        } else {
            // This triggers the backend to move task to 'done' column
            await dispatch(updateTaskStatus({ id: task._id, status: 'Completed' }));
            // Also remove from today's planner since it is finished
            await dispatch(removeTaskFromPlanner({ date: activeDate, entryId: item._id }));
        }
        onClose();
    };

    const handleRemove = async () => {
        await dispatch(removeTaskFromPlanner({ date: activeDate, entryId: item._id }));
        
        if (!isSubtask) {
            await dispatch(updateTaskStatus({ id: task._id, status: 'On-Hold' }));
        }
        onClose();
    };

    const handleShelve = async () => {
        // 1. Remove from the visual planner for the active date
        await dispatch(removeTaskFromPlanner({ date: activeDate, entryId: item._id }));
        
        // 2. Update status to 'Shelved' which the backend maps to 'todo'
        if (!isSubtask) {
            await dispatch(updateTaskStatus({ id: task._id, status: 'Shelved' }));
        }
        onClose();
    };

    // Helper to format the date string passed from Dashboard
    const formatFullDate = (dateStr) => {
        if (!dateStr) return "";
        const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options);
    };

    return (
        <div className="modal-overlay">
            <div className="item-modal-content">
                <header className="modal-header">
                    <div className="modal-logo">
                        <img src={Logo} alt="Logo" style={{height: '2.5rem'}}/> 
                        Scheduler
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} strokeWidth={2} />
                    </button>
                </header>

                <div className="modal-body">
                    <h1 className="task-display-title">{task?.title}</h1>

                    <div className="meta-info-grid">
                        <div className="meta-pill">
                            <Tag size={14} className="icon-pink" />
                            <span className="label">Category:</span>
                            <span className="value-badge">{task?.category}</span>
                        </div>
                        <div className="meta-pill">
                            <Folder size={14} className="icon-purple" />
                            <span className="label">Group:</span>
                            <span className="value-badge">{task?.groupId?.name}</span>
                        </div>
                    </div>

                    <div className="time-info-row">
                        <div className="time-pill">
                            <Calendar size={16} />
                            {/* Display the formatted date here */}
                            <span>{formatFullDate(item.date)}</span>
                        </div>
                        <div className="time-pill">
                            <Clock size={16} />
                            <span>{item.time}</span>
                        </div>
                    </div>

                    <div className="detail-list">
                        <div className="detail-item">
                            <span className="detail-label">Owner:</span>
                            <span className="detail-value">Mark Sharmy</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Subtask:</span>
                            <span className="detail-value">{item.subtaskId ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Status:</span>
                            <span className="detail-value status-text">{task?.status}</span>
                        </div>
                    </div>

                    <div className="action-footer">
                        <button className="btn-action complete" onClick={handleComplete}>
                            <CheckCircle2 size={16} /> Complete
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