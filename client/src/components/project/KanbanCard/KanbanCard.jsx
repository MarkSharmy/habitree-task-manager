import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { MoreHorizontal, User, Check, X } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd'; // Added
import { updateTask, deleteTask, moveTaskBetweenColumns } from '../../../store/slices/projectSlice';
import MoveCardModal from '../../modals/Project/MoveCardModal';
import './kanbanCard.css';

const KanbanCard = ({ task, index }) => { // Added index prop
    const menuRef = useRef(null);
    const dispatch = useDispatch();
    const [showOptions, setShowOptions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(task.title);
    const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

    const handleMoveTask = (taskId, sourceColumn, targetColumn) => {
        if (sourceColumn !== targetColumn) {
            dispatch(moveTaskBetweenColumns({ 
                projectId: task.projectId, 
                taskId, 
                fromColumn: sourceColumn, 
                toColumn: targetColumn 
            }));
        }
        setIsMoveModalOpen(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No Date';
        return new Date(dateString).toISOString().split('T')[0];
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleUpdate = () => {
        if (editedTitle.trim() !== "" && editedTitle !== task.title) {
            dispatch(updateTask({ taskId: task._id, updates: { title: editedTitle } }));
        }
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            dispatch(deleteTask({ taskId: task._id, projectId: task.projectId, columnId: task.kanban }));
        }
        setShowOptions(false);
    };

    return (
        <Draggable draggableId={task._id} index={index}>
            {(provided, snapshot) => (
                <div 
                    className={`kanban-card ${snapshot.isDragging ? 'dragging' : ''}`}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style }}
                >
                    <div className="kanban-card-header">
                        {isEditing ? (
                            <div className="edit-mode-container">
                                <input 
                                    className="edit-task-input"
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    autoFocus
                                />
                                <div className="edit-actions">
                                    <Check size={14} className="save-icon" onClick={handleUpdate} />
                                    <X size={14} className="cancel-icon" onClick={() => { setIsEditing(false); setEditedTitle(task.title); }} />
                                </div>
                            </div>
                        ) : (
                            <p className="task-title">{task.title || 'Untitled Task'}</p>
                        )}
                        
                        <div className="options-container" ref={menuRef}>
                            <button className="card-action-btn" onClick={() => setShowOptions(!showOptions)}>
                                <MoreHorizontal size={14} />
                            </button>

                            {showOptions && (
                                <div className="card-options-menu">
                                    <button className="menu-item" onClick={() => { setIsEditing(true); setShowOptions(false); }}>EDIT</button>
                                    <button className="menu-item delete-item" onClick={handleDelete}>DELETE</button>
                                    <button className="menu-item" onClick={() => { setIsMoveModalOpen(true); setShowOptions(false); }}>MOVE</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="kanban-card-footer">
                        <div className="task-assignee">
                            {task.userId?.avatar ? (
                                <img src={task.userId.avatar} alt={task.userId.username} className="assignee-avatar" />
                            ) : (
                                <div className="assignee-placeholder"><User size={12} /></div>
                            )}
                            <span className="assignee-name">{task.userId?.username || 'Unassigned'}</span>
                        </div>
                        <span className="task-date">{formatDate(task.createdAt)}</span>
                    </div>

                    <MoveCardModal 
                        isOpen={isMoveModalOpen}
                        onClose={() => setIsMoveModalOpen(false)}
                        task={task}
                        onMove={handleMoveTask}
                        columnKeys={['backendBacklog', 'frontendBacklog', 'mobileBacklog', 'design', 'todo', 'doing', 'testing', 'done']}
                    />
                </div>
            )}
        </Draggable>
    );
};

export default KanbanCard;