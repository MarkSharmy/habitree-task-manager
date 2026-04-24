import React from 'react';
import { MoreHorizontal, User } from 'lucide-react';
import './kanbanCard.css';

const KanbanCard = ({ task }) => {
    // Formatting date to match UI (YYYY-MM-DD)
    const formatDate = (dateString) => {
        if (!dateString) return 'No Date';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    return (
        <div className="kanban-card">
            <div className="kanban-card-header">
                <p className="task-title">{task.title || 'Untitled Task'}</p>
                <button className="card-action-btn">
                    <MoreHorizontal size={14} />
                </button>
            </div>

            <div className="kanban-card-footer">
                <div className="task-assignee">
                    {task.assignee?.avatar ? (
                        <img 
                            src={task.assignee.avatar} 
                            alt={task.assignee.username} 
                            className="assignee-avatar" 
                        />
                    ) : (
                        <div className="assignee-placeholder">
                            <User size={12} />
                        </div>
                    )}
                    <span className="assignee-name">
                        {task.assignee?.username || 'Unassigned'}
                    </span>
                </div>
                
                <span className="task-date">
                    {formatDate(task.createdAt || task.scheduledDate)}
                </span>
            </div>
        </div>
    );
};

export default KanbanCard;