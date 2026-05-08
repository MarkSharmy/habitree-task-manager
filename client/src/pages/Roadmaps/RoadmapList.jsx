import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { BarLoader } from 'react-spinners';
import { Plus, GitBranch, MoreVertical, Edit3, Trash2, Clock, ArrowRight } from 'lucide-react';
import {
    fetchUserRoadmaps,
    createRoadmap,
    updateRoadmapMeta,
    deleteRoadmap,
} from '../../store/slices/roadmapSlice';
import CreateRoadmap from '../../components/modals/Roadmap/CreateRoadmap';
import './roadmapList.css';

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const calcProgress = (nodes) => {
    if (!nodes || nodes.length === 0) return 0;
    const completed = nodes.filter(n => n.data?.status === 'Completed').length;
    return Math.round((completed / nodes.length) * 100);
};

/* ── Individual card with its own dropdown ── */
const RoadmapCard = ({ roadmap, onEdit, onDelete, onClick }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const progress = calcProgress(roadmap.nodes);

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="roadmap-card" onClick={onClick}>
            <div className="roadmap-card-top">
                <div className="roadmap-card-icon">
                    <GitBranch size={20} strokeWidth={2} />
                </div>
                <div ref={menuRef} style={{ position: 'relative' }}>
                    <button
                        className="roadmap-card-menu-btn"
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
                    >
                        <MoreVertical size={16} />
                    </button>
                    {menuOpen && (
                        <div className="roadmap-card-dropdown">
                            <button
                                className="dropdown-menu-item"
                                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(roadmap); }}
                            >
                                <Edit3 size={14} /> Edit Name
                            </button>
                            <button
                                className="dropdown-menu-item danger"
                                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(roadmap); }}
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="roadmap-card-body">
                <h3>{roadmap.skillName}</h3>
                <div className="roadmap-card-stats">
                    <div className="roadmap-stat">
                        <span className="roadmap-stat-value">{roadmap.nodes?.length || 0}</span>
                        <span className="roadmap-stat-label">Nodes</span>
                    </div>
                    <div className="roadmap-stat">
                        <span className="roadmap-stat-value">{roadmap.edges?.length || 0}</span>
                        <span className="roadmap-stat-label">Connections</span>
                    </div>
                    <div className="roadmap-stat">
                        <span className="roadmap-stat-value">{progress}%</span>
                        <span className="roadmap-stat-label">Complete</span>
                    </div>
                </div>
            </div>

            <div className="roadmap-card-progress">
                <div className="roadmap-card-progress-bar-bg">
                    <div
                        className="roadmap-card-progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="roadmap-card-progress-label">
                    <span>Progress</span>
                    <span>{progress}%</span>
                </div>
            </div>

            <div className="roadmap-card-footer">
                <span className="roadmap-card-date">
                    <Clock size={12} /> Updated {formatDate(roadmap.updatedAt)}
                </span>
                <button className="roadmap-open-btn" onClick={onClick}>
                    Open <ArrowRight size={12} />
                </button>
            </div>
        </div>
    );
};

/* ── Main list page ── */
const RoadmapList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { list, loading } = useSelector(state => state.roadmaps);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoadmap, setEditingRoadmap] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        dispatch(fetchUserRoadmaps());
    }, [dispatch]);

    const handleCreate = async (formData) => {
        setSubmitting(true);
        try {
            const result = await dispatch(createRoadmap({
                skillName: formData.skillName,
                nodes: [],
                edges: [],
                zoom: 1,
                pan: { x: 0, y: 0 },
            })).unwrap();
            setIsModalOpen(false);
            navigate(`/roadmaps/${result._id}`);
        } catch (err) {
            console.error('Failed to create roadmap:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async (formData) => {
        if (!editingRoadmap) return;
        setSubmitting(true);
        try {
            await dispatch(updateRoadmapMeta({ id: editingRoadmap._id, skillName: formData.skillName })).unwrap();
            setEditingRoadmap(null);
            setIsModalOpen(false);
        } catch (err) {
            console.error('Failed to update roadmap:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (roadmap) => {
        if (!window.confirm(`Delete "${roadmap.skillName}"? This cannot be undone.`)) return;
        try {
            await dispatch(deleteRoadmap(roadmap._id)).unwrap();
        } catch (err) {
            console.error('Failed to delete roadmap:', err);
        }
    };

    const openCreate = () => {
        setEditingRoadmap(null);
        setIsModalOpen(true);
    };

    const openEdit = (roadmap) => {
        setEditingRoadmap(roadmap);
        setIsModalOpen(true);
    };

    if (loading && list.length === 0) return (
        <div className="details-loader-container">
            <BarLoader color="#3b82f6" />
            <p>Loading Roadmaps...</p>
        </div>
    );

    return (
        <div className="roadmap-list-container">
            <div className="roadmap-list-header">
                <div>
                    <h1>Skill Roadmaps</h1>
                    <p>Visualise your learning path and track progress across skills</p>
                </div>
                <button className="btn-create-roadmap" onClick={openCreate}>
                    <Plus size={18} /> New Roadmap
                </button>
            </div>

            <div className="roadmap-cards-grid">
                {list.length > 0 ? (
                    list.map(roadmap => (
                        <RoadmapCard
                            key={roadmap._id}
                            roadmap={roadmap}
                            onClick={() => navigate(`/roadmaps/${roadmap._id}`)}
                            onEdit={openEdit}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <div className="roadmap-empty-state">
                        <GitBranch size={40} strokeWidth={1.5} />
                        <h3>No roadmaps yet</h3>
                        <p>Create your first skill roadmap to start visualising your learning journey and connecting tasks into a skill tree.</p>
                        <button className="btn-create-roadmap" onClick={openCreate}>
                            <Plus size={16} /> Create Your First Roadmap
                        </button>
                    </div>
                )}
            </div>

            <CreateRoadmap
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingRoadmap(null); }}
                onSubmit={editingRoadmap ? handleEdit : handleCreate}
                initialData={editingRoadmap}
                loading={submitting}
            />
        </div>
    );
};

export default RoadmapList;