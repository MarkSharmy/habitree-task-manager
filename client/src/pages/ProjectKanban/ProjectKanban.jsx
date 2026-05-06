import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BarLoader, PulseLoader } from 'react-spinners';
import { DragDropContext } from '@hello-pangea/dnd';
import { fetchSingleProject, moveTaskBetweenColumns } from '../../store/slices/projectSlice';
import KanbanColumn from '../../components/project/KanbanColumn/KanbanColumn';
import './projectKanban.css';

const COLUMN_KEYS = [
    'backendBacklog', 'frontendBacklog', 'mobileBacklog',
    'design', 'todo', 'doing', 'testing', 'done'
];

const formatColumnTitle = (key) =>
    key.replace(/([A-Z])/g, ' $1').toUpperCase();

const ProjectKanban = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentProject, loading, moveLoading } = useSelector(state => state.projects);

    useEffect(() => {
        if (id) dispatch(fetchSingleProject(id));
    }, [id, dispatch]);

    if (loading || !currentProject) return (
        <div className="details-loader-container">
            <BarLoader color="#22c55e" />
        </div>
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
                            />
                        ))}
                    </div>
                </div>
            </div>
        </DragDropContext>
    );
};

export default ProjectKanban;