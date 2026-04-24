import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, User, Zap, Plus } from 'lucide-react';
import { createProject } from '../../../store/slices/projectSlice'; // Ensure this thunk exists

import Avatar from '../../../assets/profile.png';
import Logo from '../../../assets/logo.png';
import './createProject.css';

const CreateProjectModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth); // Assuming you have an auth slice for user data

    // 1. Local Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [techInput, setTechInput] = useState('');
    const [techStack, setTechStack] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    // 2. Tag/Skill Input Logic
    const handleAddTech = () => {
        if (techInput && !techStack.includes(techInput)) {
            setTechStack([...techStack, techInput.trim()]);
            setTechInput('');
        }
    };

    const handleRemoveTech = (tagToRemove) => {
        setTechStack(techStack.filter(tag => tag !== tagToRemove));
    };

    // 3. Static Info: Creation Date (dd-mm-yyyy)
    const getFormattedDate = () => {
        const d = new Date();
        return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    };

    // 4. Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(createProject({ name, description, techStack })).unwrap();
            onClose();
        } catch (err) {
            console.error("Failed to save project:", err);
        }
    };

    useEffect(() => {
        if (isOpen) {
            // Reset to initial values every time the modal opens
            setName('');
            setDescription('');
            setTechInput('');
            setTechStack([]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <form className="create-project-modal" onSubmit={handleSubmit}>
                <header className="modal-header">
                    <div className="modal-logo">
                        <img src={Logo} alt="Logo" style={{ height: '2.5rem' }} /> 
                        New Project
                    </div>
                    <button type="button" className="close-btn" onClick={onClose} disabled={isSaving}>
                        <X size={20} strokeWidth={2} />
                    </button>
                </header>

                <div className="modal-body">
                    <div className="project-input-group">
                        <label>Project Title</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Add project name"
                            required
                            disabled={isSaving}
                        />
                    </div>

                    <div className="project-input-group">
                        <label>Description</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add description"
                            rows={6}
                            disabled={isSaving}
                        />
                    </div>

                    {/* Skill/Tech Input Area matching image pattern */}
                    <div className="skill-input-row">
                        <input 
                            type="text" 
                            className="inline-skill-input"
                            value={techInput}
                            onChange={(e) => setTechInput(e.target.value)}
                            placeholder="skill name..."
                            onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTech(); } }}
                            disabled={isSaving}
                        />
                        <button type="button" className="btn-add-skill" onClick={handleAddTech} disabled={isSaving}>
                            <Plus size={16} /> Add Skill
                        </button>
                    </div>

                    {/* Tags Display */}
                    {techStack.length > 0 && (
                        <div className="tech-tag-container">
                            {techStack.map(tag => (
                                <span key={tag} className="tech-tag-badge">
                                    <Zap size={12} className="icon-purple"/> {tag} 
                                    <button type="button" onClick={() => handleRemoveTech(tag)}><X size={12}/></button>
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="static-info-section">
                        <div className="info-item">
                            <span className="info-label">Owner</span>
                            <div className="owner-display">
                                <img src={user?.avatar || Avatar} alt="user" />
                                <p>{user?.username || 'Current User'}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Creation Date:</span>
                            <p className="date-display">{getFormattedDate()}</p>
                        </div>
                    </div>
                </div>

                <footer className="modal-footer">
                    <button type="button" className="btn-cancel" onClick={onClose} disabled={isSaving}>Cancel</button>
                    <button 
                        type="submit" 
                        className="btn-create-project" 
                        disabled={isSaving || !name}
                    >
                        {isSaving ? "Creating..." : "Create Project"}
                    </button>
                </footer>
            </form>
        </div>
    );
};

export default CreateProjectModal;