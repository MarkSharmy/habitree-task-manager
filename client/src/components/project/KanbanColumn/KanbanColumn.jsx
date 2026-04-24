import React from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';
import KanbanCard from '../KanbanCard/KanbanCard';
import './kanbanColumn.css';

const KanbanColumn = ({ title, tasks, columnId }) => {
    return (
        <div className="kanban-column">
            <header className="column-header">
                <div className="column-info">
                    <span className="column-title">{title}</span>
                    <span className="task-count">{tasks?.length || 0}</span>
                </div>
                <div className="header-actions">
                    <button className="icon-btn-small">
                        <Plus size={16} />
                    </button>
                    <button className="icon-btn-small">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </header>

            <div className="task-list">
                {tasks && tasks.length > 0 ? (
                    tasks.map((task) => (
                        <KanbanCard key={task._id} task={task} />
                    ))
                ) : null}

                {/* The "Add Item" dashed placeholder from the UI */}
                <div className="add-item-placeholder">
                    <Plus size={18} />
                    <span>Add Item</span>
                </div>
            </div>
        </div>
    );
};

export default KanbanColumn;