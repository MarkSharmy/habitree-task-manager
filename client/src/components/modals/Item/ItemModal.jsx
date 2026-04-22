import React from 'react';
import { 
    X, Tag, Folder, Calendar, Clock, 
    User, CheckCircle2, Archive, Trash2 
} from 'lucide-react';
import Logo from '../../../assets/logo.png';
import './itemModal.css';

const ItemModal = ({ isOpen, onClose, item, onStatusUpdate }) => {
    if (!isOpen || !item) return null;

    // item.taskId contains the populated Task object
    // item contains planner-specific data like time and date
    const task = item.taskId;

    return (
        <div className="modal-overlay">
            <div className="item-modal-content">
                <header className="modal-header">
                    <div className="modal-logo"><img src={Logo} style={{height: '2.5rem'}}/> Scheduler</div>
                    <button className="close-btn" onClick={onClose}><X size={20} strokeWidth={2} /></button>
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
                            <span>{item.date}</span>
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
                        <button 
                            className="btn-action complete" 
                            onClick={() => onStatusUpdate(item._id, 'Completed')}
                        >
                            <CheckCircle2 size={16} /> Complete
                        </button>
                        <button 
                            className="btn-action shelve"
                            onClick={() => onStatusUpdate(item._id, 'Shelved')}
                        >
                            <Archive size={16} /> Shelve
                        </button>
                        <button 
                            className="btn-action remove"
                            onClick={() => onStatusUpdate(item._id, 'Removed')}
                        >
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