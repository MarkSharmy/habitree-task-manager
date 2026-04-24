import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BarLoader } from 'react-spinners';
import { fetchSingleProject } from '../../store/slices/projectSlice';
import KanbanColumn from '../../components/project/KanbanColumn/KanbanColumn';
import './projectKanban.css';

const ProjectKanban = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { currentProject, loading } = useSelector(state => state.projects);

    useEffect(() => {
        if (id) dispatch(fetchSingleProject(id));
    }, [id, dispatch]);

    if (loading || !currentProject) return (
        <div className="loader-full"><BarLoader color="#22c55e" /></div>
    );

    // Columns matching your Mongoose Schema
    const columnKeys = [
        'backendBacklog', 'frontendBacklog', 'mobileBacklog', 
        'design', 'todo', 'doing', 'testing', 'done'
    ];

    return (
        <div className="kanban-page-container">
            <header className="kanban-header">
                <div className="header-left">
                    <h1>{currentProject.name}</h1>
                    <p>{currentProject.description}</p>
                </div>
                <div className="header-right">
                    <div className="collaborator-avatars">
                         {/* Map collaborators here */}
                    </div>
                    <button className="settings-btn">Settings</button>
                </div>
            </header>

            <div className="search-filter-bar">
                <input type="text" placeholder="Search item here" className="kanban-search" />
                <button className="filter-btn">Filters</button>
            </div>

            <div className="kanban-board">
                {columnKeys.map(key => (
                    <KanbanColumn 
                        key={key} 
                        title={key.replace(/([A-Z])/g, ' $1').toUpperCase()} 
                        tasks={currentProject.kanban[key]} 
                        columnId={key}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProjectKanban;