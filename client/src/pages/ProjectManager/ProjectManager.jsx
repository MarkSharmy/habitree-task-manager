import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BarLoader } from 'react-spinners';
import { fetchProjects } from '../../store/slices/projectSlice';
import ProjectCard from '../../components/project/ProjectCard/ProjectCard';
import CreateProjectModal from '../../components/modals/Project/CreateProjectModal';
import './projectManager.css';

const ProjectManager = () => {
    const dispatch = useDispatch();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { items: projects, loading, error } = useSelector((state) => state.projects);

    useEffect(() => {
        dispatch(fetchProjects());
    }, [dispatch]);

    if (loading) return (
        <div className="details-loader-container">
            <BarLoader color="#22c55e" />
            <p>Loading Projects...</p>
        </div>
    );

    if (error) return (
        <div className="error-container">
            <p>Error: {error}</p>
            <button onClick={() => dispatch(fetchProjects())}>Retry</button>
        </div>
    );

    return (
        <div className="project-manager-container">
            <header className="page-header">
                <h1>Project Manager</h1>
                <button className="add-project-btn" onClick={() => setIsCreateModalOpen(true)}>
                    <span>+</span> New Project
                </button>
            </header>

            {projects.length > 0 ? (
                <div className="projects-grid">
                    {projects.map((proj) => (
                        <ProjectCard key={proj._id} project={proj} />
                    ))}
                </div>
            ) : (
                /* Reusing the empty state pattern we discussed for the Dashboard */
                <div className="empty-planner-state">
                    <p>No projects found.</p>
                    <small>Create your first project to start tracking progress.</small>
                </div>
            )}
            <CreateProjectModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
};

export default ProjectManager;