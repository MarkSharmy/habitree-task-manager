import React from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { MoreHorizontal, Plus } from 'lucide-react';
import { Droppable } from '@hello-pangea/dnd'; // Added
import { addTaskToColumn } from '../../../store/slices/projectSlice';
import KanbanCard from '../KanbanCard/KanbanCard';
import './kanbanColumn.css';

const KanbanColumn = ({ title, tasks, columnId }) => {
    const { id: projectId } = useParams();
    const dispatch = useDispatch();

    const handleAddItem = () => {
        if (projectId && columnId) {
            dispatch(addTaskToColumn({ projectId, columnId }));
        }
    };

    return (
        <div className="kanban-column">
            <header className="column-header">
                <div className="column-info">
                    <span className="column-title">{title}</span>
                    <span className="task-count">{tasks?.length || 0}</span>
                </div>
                <div className="header-actions">
                    <button className="icon-btn-small" onClick={handleAddItem}>
                        <Plus size={16} />
                    </button>
                    <button className="icon-btn-small">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </header>

            <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                    <div 
                        className={`task-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {tasks?.map((task, index) => (
                            <KanbanCard key={task._id} task={task} index={index} />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
};

export default KanbanColumn;