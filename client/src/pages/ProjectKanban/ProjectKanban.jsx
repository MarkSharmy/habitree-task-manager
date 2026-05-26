import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BarLoader, PulseLoader } from 'react-spinners';
import { DragDropContext } from '@hello-pangea/dnd';
import { fetchSingleProject, moveTaskBetweenColumns } from '../../store/slices/projectSlice';
import KanbanColumn from '../../components/project/KanbanColumn/KanbanColumn';
import './projectKanban.css';

const COLUMN_KEYS = [
    'backendBacklog', 'frontendBacklog', 'mobileBacklog',
    'design', 'issues', 'todo', 'doing', 'testing', 'done'
];

const formatColumnTitle = (key) => key.replace(/([A-Z])/g, ' $1').toUpperCase();

const ProjectKanban = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentProject, loading, moveLoading } = useSelector(state => state.projects);

    // selectedTasks: Set of taskIds currently checked across ALL columns
    const [selectedTasks, setSelectedTasks] = useState(new Set());

    const handleToggleSelect = useCallback((taskId) => {
        setSelectedTasks(prev => {
            const next = new Set(prev);
            next.has(taskId) ? next.delete(taskId) : next.add(taskId);
            return next;
        });
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedTasks(new Set());
    }, []);

    // Clear selection whenever the project reloads
    useEffect(() => {
        setSelectedTasks(new Set());
    }, [currentProject?._id]);

    useEffect(() => {
        if (id) dispatch(fetchSingleProject(id));
    }, [id, dispatch]);

    if (loading || !currentProject) return (
        <div className="details-loader-container"><BarLoader color="#22c55e" /></div>
    );

    const onDragEnd = (result) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        dispatch(moveTaskBetweenColumns({
            projectId: currentProject._id,
            taskId: draggableId,
            fromColumn: source.droppableId,
            toColumn: destination.droppableId,
        }));
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="kanban-page-container">
                <header className="kanban-header">
                    <div className="header-left">
                        <h1>{currentProject.name}</h1>
                        <p>{currentProject.description}</p>
                    </div>
                    <div className="header-right">
                        <div className="collaborator-avatars">
                            {currentProject.collaborators?.map(user => (
                                <img
                                    key={user._id}
                                    src={user.avatar || '/default-avatar.png'}
                                    alt={user.username}
                                    className="collab-img"
                                />
                            ))}
                        </div>
                        <button className="settings-btn">Settings</button>
                    </div>
                </header>

                <div className="search-filter-bar">
                    <input type="text" placeholder="Search item here" className="kanban-search" />
                    <button className="filter-btn">Filters</button>
                </div>

                {/* Selection count bar */}
                {selectedTasks.size > 0 && (
                    <div className="selection-bar">
                        <span className="selection-bar-count">
                            {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} selected
                        </span>
                        <button className="selection-bar-clear" onClick={handleClearSelection}>
                            Clear selection
                        </button>
                    </div>
                )}

                <div className="kanban-board-wrapper">
                    {moveLoading && (
                        <div className="kanban-move-overlay">
                            <PulseLoader color="#22c55e" size={12} />
                            <p>Updating Board...</p>
                        </div>
                    )}

                    <div className={`kanban-board ${moveLoading ? 'board-blur' : ''}`}>
                        {COLUMN_KEYS.map(key => (
                            <KanbanColumn
                                key={key}
                                title={formatColumnTitle(key)}
                                tasks={currentProject.kanban[key]}
                                columnId={key}
                                allColumnKeys={COLUMN_KEYS}
                                selectedTasks={selectedTasks}
                                onToggleSelect={handleToggleSelect}
                                onClearSelection={handleClearSelection}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </DragDropContext>
    );
};

export default ProjectKanban;