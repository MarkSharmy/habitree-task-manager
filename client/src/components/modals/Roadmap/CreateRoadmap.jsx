import { useState, useEffect } from 'react';
import { X, GitBranch } from 'lucide-react';
import './createRoadmap.css';

const CreateRoadmapModal = ({ isOpen, onClose, onSubmit, initialData, loading }) => {
    const isEditing = !!initialData;
    const [skillName, setSkillName] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSkillName(initialData?.skillName || '');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!skillName.trim()) return;
        onSubmit({ skillName: skillName.trim() });
    };

    return (
        <div className="roadmap-modal-overlay" onClick={onClose}>
            <div className="roadmap-modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="roadmap-modal-header">
                    <h2>
                        <GitBranch size={16} />
                        {isEditing ? 'Edit Roadmap' : 'Create New Roadmap'}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={18} strokeWidth={2} />
                    </button>
                </header>

                <form onSubmit={handleSubmit}>
                    <div className="roadmap-modal-body">
                        <div className="roadmap-form-group">
                            <label>Skill Name *</label>
                            <input
                                type="text"
                                placeholder="e.g. Master MERN Stack, Forex Trading"
                                value={skillName}
                                onChange={(e) => setSkillName(e.target.value)}
                                autoFocus
                                required
                            />
                            <span className="roadmap-form-hint">
                                Give your roadmap a clear, descriptive name for the skill you want to develop.
                            </span>
                        </div>
                    </div>

                    <div className="roadmap-modal-footer">
                        <button type="button" className="btn-roadmap-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-roadmap-submit"
                            disabled={loading || !skillName.trim()}
                        >
                            {loading
                                ? (isEditing ? 'Saving...' : 'Creating...')
                                : (isEditing ? 'Save Changes' : 'Create Roadmap')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRoadmapModal;