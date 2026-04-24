import { MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Avatar from '../../../assets/profile.png';
import './projectCard.css';

const ProjectCard = ({ project }) => {
    const navigate = useNavigate();
    const progressStyle = { width: `${project.progress || 0}%` };

    return (
        <div className="project-card" onClick={() => navigate(`/projects/${project._id}`)}>
            <div className="project-card-header">
                <h3>{project.name}</h3>
                <button className="btn-icon-ghost">
                    <MoreVertical size={18} />
                </button>
            </div>

            <p className="project-description">{project.description}</p>

            <div className="progress-section">
                <span className="label">Progress</span>
                <div className="progress-bar-container">
                    <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                </div>
            </div>

            <div className="tech-stack-tags">
                {project.techStack.map((tech, idx) => (
                    <span key={idx} className="tech-tag">{tech}</span>
                ))}
            </div>

            <div className="project-card-footer">
                <div className="collaborators">
                    <span className="label">Collaborators</span>
                    <div className="avatar-group">
                        {/* Show owner and collaborators */}
                        <img src={Avatar} className="avatar-circle" title="Owner" />
                        {project.collaborators.slice(0, 3).map(c => (
                            <img key={c._id} src={c.avatar} className="avatar-circle" />
                        ))}
                    </div>
                </div>
                <div className="creation-date">
                    <span className="label">Date Created:</span>
                    <span className="date-text">{project.formattedDate}</span>
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;